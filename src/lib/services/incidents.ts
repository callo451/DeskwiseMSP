import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { MajorIncident, MajorIncidentUpdate } from '@/lib/types';

export interface IncidentDocument extends Omit<MajorIncident, 'id'> {
  _id?: ObjectId;
  orgId: string; // Organization ID for multi-tenancy
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentUpdateDocument extends Omit<MajorIncidentUpdate, 'id'> {
  _id?: ObjectId;
  orgId: string; // Organization ID for multi-tenancy
  incidentId: string;
  createdBy: string;
  createdAt: Date;
}

export class IncidentService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<IncidentDocument>('incidents');
  }

  private static async getUpdatesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<IncidentUpdateDocument>('incident_updates');
  }

  static async getAll(orgId: string, filters?: {
    status?: string;
    isPublished?: boolean;
    affectedClient?: string;
    affectedService?: string;
  }): Promise<MajorIncident[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId }; // Always filter by organization
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }
    
    if (filters?.affectedClient) {
      query.affectedClients = { $in: [filters.affectedClient, 'All'] };
    }
    
    if (filters?.affectedService) {
      query.affectedServices = filters.affectedService;
    }

    const incidents = await collection
      .find(query)
      .sort({ startedAt: -1 })
      .toArray();

    const incidentsWithUpdates = await Promise.all(
      incidents.map(async (incident) => {
        const updates = await this.getIncidentUpdates(orgId, incident._id!.toString());
        return this.documentToIncident(incident, updates);
      })
    );

    return incidentsWithUpdates;
  }

  static async getById(id: string, orgId: string): Promise<MajorIncident | null> {
    const collection = await this.getCollection();
    const incident = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!incident) return null;
    
    const updates = await this.getIncidentUpdates(orgId, id);
    return this.documentToIncident(incident, updates);
  }

  static async getPublished(orgId: string): Promise<MajorIncident[]> {
    return this.getAll(orgId, { isPublished: true });
  }

  static async getActive(orgId: string): Promise<MajorIncident[]> {
    const collection = await this.getCollection();
    
    const incidents = await collection
      .find({ 
        orgId,
        status: { $ne: 'Resolved' },
        isPublished: true 
      })
      .sort({ startedAt: -1 })
      .toArray();

    const incidentsWithUpdates = await Promise.all(
      incidents.map(async (incident) => {
        const updates = await this.getIncidentUpdates(orgId, incident._id!.toString());
        return this.documentToIncident(incident, updates);
      })
    );

    return incidentsWithUpdates;
  }

  static async create(
    orgId: string,
    incidentData: Omit<MajorIncident, 'id' | 'updates'>,
    createdBy: string,
    initialUpdate?: Omit<MajorIncidentUpdate, 'id'>
  ): Promise<MajorIncident> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const incidentDocument: Omit<IncidentDocument, '_id'> = {
      ...incidentData,
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(incidentDocument);
    
    let updates: MajorIncidentUpdate[] = [];
    
    // Add initial update if provided
    if (initialUpdate) {
      const update = await this.addUpdate(orgId, result.insertedId.toString(), {
        ...initialUpdate,
        timestamp: now.toISOString(),
      }, createdBy);
      updates = [update];
    }
    
    const createdIncident = await collection.findOne({ _id: result.insertedId });
    if (!createdIncident) throw new Error('Failed to create incident');
    
    return this.documentToIncident(createdIncident, updates);
  }

  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<MajorIncident, 'id' | 'updates'>>,
    updatedBy: string
  ): Promise<MajorIncident | null> {
    const collection = await this.getCollection();
    
    const updateData: any = {
      ...updates,
      updatedBy,
      updatedAt: new Date()
    };

    // If status is being changed to Resolved, set resolvedAt
    if (updates.status === 'Resolved' && !updates.resolvedAt) {
      updateData.resolvedAt = new Date().toISOString();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    const incidentUpdates = await this.getIncidentUpdates(orgId, id);
    return this.documentToIncident(result, incidentUpdates);
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const updatesCollection = await this.getUpdatesCollection();
    
    // Delete all updates first
    await updatesCollection.deleteMany({ incidentId: id, orgId });
    
    // Delete the incident
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    return result.deletedCount > 0;
  }

  static async addUpdate(
    orgId: string,
    incidentId: string,
    updateData: Omit<MajorIncidentUpdate, 'id'>,
    createdBy: string
  ): Promise<MajorIncidentUpdate> {
    const updatesCollection = await this.getUpdatesCollection();
    
    const updateDocument: Omit<IncidentUpdateDocument, '_id'> = {
      ...updateData,
      orgId,
      incidentId,
      createdBy,
      createdAt: new Date(),
    };

    const result = await updatesCollection.insertOne(updateDocument);
    
    // Update the incident's status if the update changes it
    if (updateData.status) {
      await this.update(incidentId, orgId, { status: updateData.status }, createdBy);
    }
    
    const createdUpdate = await updatesCollection.findOne({ _id: result.insertedId });
    if (!createdUpdate) throw new Error('Failed to create incident update');
    
    return this.updateDocumentToUpdate(createdUpdate);
  }

  static async updateIncidentUpdate(
    orgId: string,
    incidentId: string,
    updateId: string,
    updateData: Partial<Omit<MajorIncidentUpdate, 'id'>>,
    updatedBy: string
  ): Promise<MajorIncidentUpdate | null> {
    const updatesCollection = await this.getUpdatesCollection();
    
    const result = await updatesCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(updateId),
        orgId,
        incidentId: incidentId 
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    // Update the incident's updatedBy and updatedAt
    await this.update(incidentId, orgId, {}, updatedBy);
    
    return this.updateDocumentToUpdate(result);
  }

  static async deleteIncidentUpdate(orgId: string, incidentId: string, updateId: string): Promise<boolean> {
    const updatesCollection = await this.getUpdatesCollection();
    
    const result = await updatesCollection.deleteOne({ 
      _id: new ObjectId(updateId),
      orgId,
      incidentId: incidentId 
    });
    
    return result.deletedCount > 0;
  }

  static async getIncidentUpdates(orgId: string, incidentId: string): Promise<MajorIncidentUpdate[]> {
    const updatesCollection = await this.getUpdatesCollection();
    
    const updates = await updatesCollection
      .find({ orgId, incidentId })
      .sort({ timestamp: 1 })
      .toArray();

    return updates.map(this.updateDocumentToUpdate);
  }

  static async getStats(orgId: string): Promise<{
    total: number;
    active: number;
    resolved: number;
    published: number;
    byStatus: Record<string, number>;
  }> {
    const collection = await this.getCollection();
    
    const [
      total,
      active,
      resolved,
      published,
      statusCounts
    ] = await Promise.all([
      collection.countDocuments({ orgId }),
      collection.countDocuments({ orgId, status: { $ne: 'Resolved' } }),
      collection.countDocuments({ orgId, status: 'Resolved' }),
      collection.countDocuments({ orgId, isPublished: true }),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((item: any) => {
      byStatus[item._id] = item.count;
    });

    return {
      total,
      active,
      resolved,
      published,
      byStatus
    };
  }

  static async getByClient(orgId: string, clientId: string): Promise<MajorIncident[]> {
    return this.getAll(orgId, { affectedClient: clientId });
  }

  static async getByService(orgId: string, service: string): Promise<MajorIncident[]> {
    return this.getAll(orgId, { affectedService: service });
  }

  private static documentToIncident(
    doc: IncidentDocument, 
    updates: MajorIncidentUpdate[]
  ): MajorIncident {
    const { _id, createdBy, updatedBy, createdAt, updatedAt, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest,
      updates
    };
  }

  private static updateDocumentToUpdate(doc: IncidentUpdateDocument): MajorIncidentUpdate {
    const { _id, incidentId, createdBy, createdAt, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }
}