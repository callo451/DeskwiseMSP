import { ObjectId, OptionalId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Client } from '@/lib/types';

export interface ClientDocument extends Omit<Client, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  onboardingClients: number;
  inactiveClients: number;
  totalTickets: number;
  totalAssets: number;
  totalContacts: number;
}

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  ticketCount: number;
  openTickets: number;
  assetCount: number;
  contactCount: number;
  contractCount: number;
  lastActivity: Date;
  monthlyRevenue: number;
}

export class ClientsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ClientDocument>('clients');
  }

  private static async getTicketsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('tickets');
  }

  private static async getAssetsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('assets');
  }

  private static async getContactsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('contacts');
  }

  private static async getContractsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('contracts');
  }

  /**
   * Get all clients for an organization
   */
  static async getAll(orgId: string): Promise<Client[]> {
    const collection = await this.getCollection();
    
    const clients = await collection
      .find({ orgId })
      .sort({ createdAt: -1 })
      .toArray();

    return clients.map(client => ({
      id: client._id.toString(),
      name: client.name,
      industry: client.industry,
      contacts: client.contacts,
      tickets: client.tickets,
      status: client.status,
      mainContact: client.mainContact,
      phone: client.phone,
      address: client.address
    }));
  }

  /**
   * Get client by ID
   */
  static async getById(id: string, orgId: string): Promise<Client | null> {
    const collection = await this.getCollection();
    
    const client = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (!client) return null;

    return {
      id: client._id.toString(),
      name: client.name,
      industry: client.industry,
      contacts: client.contacts,
      tickets: client.tickets,
      status: client.status,
      mainContact: client.mainContact,
      phone: client.phone,
      address: client.address
    };
  }

  /**
   * Create a new client
   */
  static async create(
    orgId: string,
    clientData: Omit<Client, 'id' | 'contacts' | 'tickets'>,
    createdBy: string
  ): Promise<Client> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<ClientDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      name: clientData.name,
      industry: clientData.industry,
      status: clientData.status,
      mainContact: clientData.mainContact,
      phone: clientData.phone,
      address: clientData.address,
      contacts: 0, // Will be calculated from contacts collection
      tickets: 0   // Will be calculated from tickets collection
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      name: document.name,
      industry: document.industry,
      contacts: document.contacts,
      tickets: document.tickets,
      status: document.status,
      mainContact: document.mainContact,
      phone: document.phone,
      address: document.address
    };
  }

  /**
   * Update a client
   */
  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<Client, 'id' | 'contacts' | 'tickets'>>,
    updatedBy: string
  ): Promise<Client | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      {
        $set: {
          ...updates,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      name: result.name,
      industry: result.industry,
      contacts: result.contacts,
      tickets: result.tickets,
      status: result.status,
      mainContact: result.mainContact,
      phone: result.phone,
      address: result.address
    };
  }

  /**
   * Delete a client
   */
  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId
    });

    return result.deletedCount > 0;
  }

  /**
   * Get client statistics for organization
   */
  static async getStats(orgId: string): Promise<ClientStats> {
    const collection = await this.getCollection();
    const ticketsCollection = await this.getTicketsCollection();
    const assetsCollection = await this.getAssetsCollection();
    const contactsCollection = await this.getContactsCollection();

    // Get client stats
    const clientStats = await collection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          onboardingClients: {
            $sum: { $cond: [{ $eq: ['$status', 'Onboarding'] }, 1, 0] }
          },
          inactiveClients: {
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // Get related stats
    const [ticketCount, assetCount, contactCount] = await Promise.all([
      ticketsCollection.countDocuments({ orgId }),
      assetsCollection.countDocuments({ orgId }),
      contactsCollection.countDocuments({ orgId })
    ]);

    const stats = clientStats[0] || {
      totalClients: 0,
      activeClients: 0,
      onboardingClients: 0,
      inactiveClients: 0
    };

    return {
      totalClients: stats.totalClients,
      activeClients: stats.activeClients,
      onboardingClients: stats.onboardingClients,
      inactiveClients: stats.inactiveClients,
      totalTickets: ticketCount,
      totalAssets: assetCount,
      totalContacts: contactCount
    };
  }

  /**
   * Get client metrics with associated data counts
   */
  static async getClientMetrics(orgId: string): Promise<ClientMetrics[]> {
    const collection = await this.getCollection();
    const ticketsCollection = await this.getTicketsCollection();
    const assetsCollection = await this.getAssetsCollection();
    const contactsCollection = await this.getContactsCollection();
    const contractsCollection = await this.getContractsCollection();

    // Get all clients
    const clients = await collection.find({ orgId }).toArray();

    // Get metrics for each client
    const clientMetrics = await Promise.all(
      clients.map(async (client) => {
        const clientName = client.name;

        // Get counts for this client
        const [ticketStats, assetCount, contactCount, contractCount] = await Promise.all([
          // Ticket stats
          ticketsCollection.aggregate([
            { $match: { orgId, client: clientName } },
            {
              $group: {
                _id: null,
                totalTickets: { $sum: 1 },
                openTickets: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['Open', 'In Progress', 'Pending']] },
                      1,
                      0
                    ]
                  }
                },
                lastActivity: { $max: '$updatedAt' }
              }
            }
          ]).toArray(),
          // Asset count
          assetsCollection.countDocuments({ orgId, client: clientName }),
          // Contact count
          contactsCollection.countDocuments({ orgId, client: clientName }),
          // Contract count
          contractsCollection.countDocuments({ orgId, clientId: client._id.toString() })
        ]);

        const ticketData = ticketStats[0] || {
          totalTickets: 0,
          openTickets: 0,
          lastActivity: client.createdAt
        };

        return {
          clientId: client._id.toString(),
          clientName: client.name,
          ticketCount: ticketData.totalTickets,
          openTickets: ticketData.openTickets,
          assetCount,
          contactCount,
          contractCount,
          lastActivity: ticketData.lastActivity || client.createdAt,
          monthlyRevenue: 0 // TODO: Calculate from contracts
        };
      })
    );

    return clientMetrics;
  }

  /**
   * Update client counters (to be called when related data changes)
   */
  static async updateCounters(orgId: string, clientName: string): Promise<void> {
    const collection = await this.getCollection();
    const ticketsCollection = await this.getTicketsCollection();
    const contactsCollection = await this.getContactsCollection();

    // Get current counts
    const [ticketCount, contactCount] = await Promise.all([
      ticketsCollection.countDocuments({ orgId, client: clientName }),
      contactsCollection.countDocuments({ orgId, client: clientName })
    ]);

    // Update the client document
    await collection.updateOne(
      { orgId, name: clientName },
      {
        $set: {
          tickets: ticketCount,
          contacts: contactCount,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Search clients by name or industry
   */
  static async search(orgId: string, query: string): Promise<Client[]> {
    const collection = await this.getCollection();
    
    const clients = await collection
      .find({
        orgId,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { industry: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ name: 1 })
      .toArray();

    return clients.map(client => ({
      id: client._id.toString(),
      name: client.name,
      industry: client.industry,
      contacts: client.contacts,
      tickets: client.tickets,
      status: client.status,
      mainContact: client.mainContact,
      phone: client.phone,
      address: client.address
    }));
  }

  /**
   * Get clients by status
   */
  static async getByStatus(orgId: string, status: Client['status']): Promise<Client[]> {
    const collection = await this.getCollection();
    
    const clients = await collection
      .find({ orgId, status })
      .sort({ name: 1 })
      .toArray();

    return clients.map(client => ({
      id: client._id.toString(),
      name: client.name,
      industry: client.industry,
      contacts: client.contacts,
      tickets: client.tickets,
      status: client.status,
      mainContact: client.mainContact,
      phone: client.phone,
      address: client.address
    }));
  }

  /**
   * Get client by name (for lookup operations)
   */
  static async getByName(orgId: string, name: string): Promise<Client | null> {
    const collection = await this.getCollection();
    
    const client = await collection.findOne({ orgId, name });

    if (!client) return null;

    return {
      id: client._id.toString(),
      name: client.name,
      industry: client.industry,
      contacts: client.contacts,
      tickets: client.tickets,
      status: client.status,
      mainContact: client.mainContact,
      phone: client.phone,
      address: client.address
    };
  }

  /**
   * Get client quotes count and total value
   */
  static async getClientQuoteMetrics(orgId: string, clientId: string): Promise<{
    quoteCount: number;
    totalQuoteValue: number;
    acceptedQuoteValue: number;
  }> {
    const client = await clientPromise;
    const db = client.db('deskwise');
    const quotesCollection = db.collection('quotes');

    const metrics = await quotesCollection.aggregate([
      { $match: { orgId, clientId } },
      {
        $group: {
          _id: null,
          quoteCount: { $sum: 1 },
          totalQuoteValue: { $sum: '$total' },
          acceptedQuoteValue: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, '$total', 0] }
          }
        }
      }
    ]).toArray();

    const result = metrics[0] || {
      quoteCount: 0,
      totalQuoteValue: 0,
      acceptedQuoteValue: 0
    };

    return {
      quoteCount: result.quoteCount,
      totalQuoteValue: result.totalQuoteValue,
      acceptedQuoteValue: result.acceptedQuoteValue
    };
  }
}