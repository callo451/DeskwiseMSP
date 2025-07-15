import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Asset } from '@/lib/types';

export interface AssetDocument extends Omit<Asset, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Enhanced asset tracking fields
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  maintenanceSchedule?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    nextMaintenanceDate: Date;
    lastMaintenanceDate?: Date;
  };
  depreciation?: {
    method: 'straight_line' | 'declining_balance';
    usefulLife: number; // years
    salvageValue: number;
    currentValue: number;
  };
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface AssetStats {
  totalAssets: number;
  onlineAssets: number;
  offlineAssets: number;
  warningAssets: number;
  securedAssets: number;
  atRiskAssets: number;
  totalValue: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgDiskUsage: number;
  maintenanceDue: number;
  warrantyExpiring: number;
}

export interface AssetExtended extends Asset {
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  maintenanceSchedule?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    nextMaintenanceDate: Date;
    lastMaintenanceDate?: Date;
  };
  depreciation?: {
    method: 'straight_line' | 'declining_balance';
    usefulLife: number;
    salvageValue: number;
    currentValue: number;
  };
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetLocationStats {
  location: string;
  assetCount: number;
  onlineCount: number;
  offlineCount: number;
  warningCount: number;
}

export interface AssetTypeStats {
  type: Asset['type'];
  count: number;
  onlineCount: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgDiskUsage: number;
}

export interface AssetMaintenanceRecord {
  _id?: ObjectId;
  assetId: string;
  orgId: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  performedAt: Date;
  nextScheduledDate?: Date;
  cost?: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export class AssetsService {
  private static async getAssetsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<AssetDocument>('assets');
  }

  private static async getMaintenanceCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<AssetMaintenanceRecord>('asset_maintenance');
  }

  private static async getTicketsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('tickets');
  }

  /**
   * Get all assets for an organization
   */
  static async getAll(orgId: string, filters?: {
    type?: string[];
    status?: string[];
    isSecure?: boolean;
    client?: string;
    location?: string;
    maintenanceDue?: boolean;
    warrantyExpiring?: number; // days
    includeDeleted?: boolean;
  }): Promise<AssetExtended[]> {
    const collection = await this.getAssetsCollection();
    
    const query: any = { orgId };
    
    if (!filters?.includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    if (filters?.type?.length) {
      query.type = { $in: filters.type };
    }
    
    if (filters?.status?.length) {
      query.status = { $in: filters.status };
    }
    
    if (filters?.isSecure !== undefined) {
      query.isSecure = filters.isSecure;
    }
    
    if (filters?.client) {
      query.client = { $regex: filters.client, $options: 'i' };
    }
    
    if (filters?.location) {
      query.$or = [
        { 'location.building': { $regex: filters.location, $options: 'i' } },
        { 'location.floor': { $regex: filters.location, $options: 'i' } },
        { 'location.room': { $regex: filters.location, $options: 'i' } },
        { 'location.rack': { $regex: filters.location, $options: 'i' } }
      ];
    }

    if (filters?.maintenanceDue) {
      const today = new Date();
      query['maintenanceSchedule.nextMaintenanceDate'] = { $lte: today };
    }

    if (filters?.warrantyExpiring) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.warrantyExpiring);
      query.warrantyExpiration = { $lte: futureDate, $gte: new Date() };
    }

    const assets = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return assets.map(asset => ({
      id: asset._id!.toString(),
      name: asset.name,
      client: asset.client,
      type: asset.type,
      status: asset.status,
      isSecure: asset.isSecure,
      lastSeen: asset.lastSeen,
      ipAddress: asset.ipAddress,
      macAddress: asset.macAddress,
      os: asset.os,
      cpu: asset.cpu,
      ram: asset.ram,
      disk: asset.disk,
      notes: asset.notes,
      activityLogs: asset.activityLogs,
      associatedTickets: asset.associatedTickets,
      specifications: asset.specifications,
      sku: asset.sku,
      contractId: asset.contractId,
      purchaseDate: asset.purchaseDate,
      warrantyExpiration: asset.warrantyExpiration,
      maintenanceSchedule: asset.maintenanceSchedule,
      depreciation: asset.depreciation,
      location: asset.location,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    }));
  }

  /**
   * Get asset by ID
   */
  static async getById(id: string, orgId: string): Promise<AssetExtended | null> {
    const collection = await this.getAssetsCollection();
    
    const asset = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!asset) return null;

    return {
      id: asset._id!.toString(),
      name: asset.name,
      client: asset.client,
      type: asset.type,
      status: asset.status,
      isSecure: asset.isSecure,
      lastSeen: asset.lastSeen,
      ipAddress: asset.ipAddress,
      macAddress: asset.macAddress,
      os: asset.os,
      cpu: asset.cpu,
      ram: asset.ram,
      disk: asset.disk,
      notes: asset.notes,
      activityLogs: asset.activityLogs,
      associatedTickets: asset.associatedTickets,
      specifications: asset.specifications,
      sku: asset.sku,
      contractId: asset.contractId,
      purchaseDate: asset.purchaseDate,
      warrantyExpiration: asset.warrantyExpiration,
      maintenanceSchedule: asset.maintenanceSchedule,
      depreciation: asset.depreciation,
      location: asset.location,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    };
  }

  /**
   * Create a new asset
   */
  static async create(
    orgId: string,
    assetData: Omit<Asset, 'id'> & {
      purchaseDate?: Date;
      warrantyExpiration?: Date;
      maintenanceSchedule?: {
        frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
        nextMaintenanceDate: Date;
        lastMaintenanceDate?: Date;
      };
      depreciation?: {
        method: 'straight_line' | 'declining_balance';
        usefulLife: number;
        salvageValue: number;
        currentValue: number;
      };
      location?: {
        building?: string;
        floor?: string;
        room?: string;
        rack?: string;
      };
    },
    createdBy: string
  ): Promise<AssetExtended> {
    const collection = await this.getAssetsCollection();
    
    const now = new Date();
    const document: Omit<AssetDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      name: assetData.name,
      client: assetData.client,
      type: assetData.type,
      status: assetData.status,
      isSecure: assetData.isSecure,
      lastSeen: assetData.lastSeen,
      ipAddress: assetData.ipAddress,
      macAddress: assetData.macAddress,
      os: assetData.os,
      cpu: assetData.cpu,
      ram: assetData.ram,
      disk: assetData.disk,
      notes: assetData.notes,
      activityLogs: assetData.activityLogs || [],
      associatedTickets: assetData.associatedTickets || [],
      specifications: assetData.specifications,
      sku: assetData.sku,
      contractId: assetData.contractId,
      purchaseDate: assetData.purchaseDate,
      warrantyExpiration: assetData.warrantyExpiration,
      maintenanceSchedule: assetData.maintenanceSchedule,
      depreciation: assetData.depreciation,
      location: assetData.location,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    // Add activity log for asset creation
    await this.addActivityLog(result.insertedId.toString(), orgId, 'Asset created', createdBy);
    
    return {
      id: result.insertedId.toString(),
      name: document.name,
      client: document.client,
      type: document.type,
      status: document.status,
      isSecure: document.isSecure,
      lastSeen: document.lastSeen,
      ipAddress: document.ipAddress,
      macAddress: document.macAddress,
      os: document.os,
      cpu: document.cpu,
      ram: document.ram,
      disk: document.disk,
      notes: document.notes,
      activityLogs: document.activityLogs,
      associatedTickets: document.associatedTickets,
      specifications: document.specifications,
      sku: document.sku,
      contractId: document.contractId,
      purchaseDate: document.purchaseDate,
      warrantyExpiration: document.warrantyExpiration,
      maintenanceSchedule: document.maintenanceSchedule,
      depreciation: document.depreciation,
      location: document.location,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }

  /**
   * Update an asset
   */
  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<Asset, 'id'> & {
      purchaseDate?: Date;
      warrantyExpiration?: Date;
      maintenanceSchedule?: {
        frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
        nextMaintenanceDate: Date;
        lastMaintenanceDate?: Date;
      };
      depreciation?: {
        method: 'straight_line' | 'declining_balance';
        usefulLife: number;
        salvageValue: number;
        currentValue: number;
      };
      location?: {
        building?: string;
        floor?: string;
        room?: string;
        rack?: string;
      };
    }>,
    updatedBy: string
  ): Promise<AssetExtended | null> {
    const collection = await this.getAssetsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, isDeleted: { $ne: true } },
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

    // Add activity log for update
    await this.addActivityLog(id, orgId, 'Asset updated', updatedBy);

    return {
      id: result._id!.toString(),
      name: result.name,
      client: result.client,
      type: result.type,
      status: result.status,
      isSecure: result.isSecure,
      lastSeen: result.lastSeen,
      ipAddress: result.ipAddress,
      macAddress: result.macAddress,
      os: result.os,
      cpu: result.cpu,
      ram: result.ram,
      disk: result.disk,
      notes: result.notes,
      activityLogs: result.activityLogs,
      associatedTickets: result.associatedTickets,
      specifications: result.specifications,
      sku: result.sku,
      contractId: result.contractId,
      purchaseDate: result.purchaseDate,
      warrantyExpiration: result.warrantyExpiration,
      maintenanceSchedule: result.maintenanceSchedule,
      depreciation: result.depreciation,
      location: result.location,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Soft delete an asset
   */
  static async delete(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getAssetsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: deletedBy,
          updatedAt: new Date()
        }
      }
    );

    if (result) {
      await this.addActivityLog(id, orgId, 'Asset deleted', deletedBy);
    }

    return !!result;
  }

  /**
   * Restore a soft-deleted asset
   */
  static async restore(id: string, orgId: string, restoredBy: string): Promise<AssetExtended | null> {
    const collection = await this.getAssetsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          updatedBy: restoredBy,
          updatedAt: new Date()
        },
        $unset: {
          deletedAt: 1
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    await this.addActivityLog(id, orgId, 'Asset restored', restoredBy);

    return {
      id: result._id!.toString(),
      name: result.name,
      client: result.client,
      type: result.type,
      status: result.status,
      isSecure: result.isSecure,
      lastSeen: result.lastSeen,
      ipAddress: result.ipAddress,
      macAddress: result.macAddress,
      os: result.os,
      cpu: result.cpu,
      ram: result.ram,
      disk: result.disk,
      notes: result.notes,
      activityLogs: result.activityLogs,
      associatedTickets: result.associatedTickets,
      specifications: result.specifications,
      sku: result.sku,
      contractId: result.contractId,
      purchaseDate: result.purchaseDate,
      warrantyExpiration: result.warrantyExpiration,
      maintenanceSchedule: result.maintenanceSchedule,
      depreciation: result.depreciation,
      location: result.location,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Get asset statistics for organization
   */
  static async getStats(orgId: string): Promise<AssetStats> {
    const collection = await this.getAssetsCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          onlineAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'Online'] }, 1, 0] }
          },
          offlineAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'Offline'] }, 1, 0] }
          },
          warningAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'Warning'] }, 1, 0] }
          },
          securedAssets: {
            $sum: { $cond: ['$isSecure', 1, 0] }
          },
          atRiskAssets: {
            $sum: { $cond: [{ $not: '$isSecure' }, 1, 0] }
          },
          avgCpuUsage: { $avg: '$cpu.usage' },
          avgMemoryUsage: { 
            $avg: {
              $cond: [
                { $gt: ['$ram.total', 0] },
                { $multiply: [{ $divide: ['$ram.used', '$ram.total'] }, 100] },
                0
              ]
            }
          },
          avgDiskUsage: {
            $avg: {
              $cond: [
                { $gt: ['$disk.total', 0] },
                { $multiply: [{ $divide: ['$disk.used', '$disk.total'] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Get maintenance due count
    const today = new Date();
    const maintenanceDue = await collection.countDocuments({
      orgId,
      isDeleted: { $ne: true },
      'maintenanceSchedule.nextMaintenanceDate': { $lte: today }
    });

    // Get warranty expiring count (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const warrantyExpiring = await collection.countDocuments({
      orgId,
      isDeleted: { $ne: true },
      warrantyExpiration: { $lte: thirtyDaysFromNow, $gte: today }
    });

    const result = stats[0] || {
      totalAssets: 0,
      onlineAssets: 0,
      offlineAssets: 0,
      warningAssets: 0,
      securedAssets: 0,
      atRiskAssets: 0,
      avgCpuUsage: 0,
      avgMemoryUsage: 0,
      avgDiskUsage: 0
    };

    // Calculate total value from depreciation current values
    const valueStats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true }, 'depreciation.currentValue': { $exists: true } } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$depreciation.currentValue' }
        }
      }
    ]).toArray();

    return {
      totalAssets: result.totalAssets,
      onlineAssets: result.onlineAssets,
      offlineAssets: result.offlineAssets,
      warningAssets: result.warningAssets,
      securedAssets: result.securedAssets,
      atRiskAssets: result.atRiskAssets,
      totalValue: valueStats[0]?.totalValue || 0,
      avgCpuUsage: Math.round(result.avgCpuUsage || 0),
      avgMemoryUsage: Math.round(result.avgMemoryUsage || 0),
      avgDiskUsage: Math.round(result.avgDiskUsage || 0),
      maintenanceDue,
      warrantyExpiring
    };
  }

  /**
   * Get assets by client
   */
  static async getByClient(orgId: string, clientName: string): Promise<AssetExtended[]> {
    const collection = await this.getAssetsCollection();
    
    const assets = await collection
      .find({ 
        orgId, 
        client: clientName,
        isDeleted: { $ne: true }
      })
      .sort({ name: 1 })
      .toArray();

    return assets.map(asset => ({
      id: asset._id!.toString(),
      name: asset.name,
      client: asset.client,
      type: asset.type,
      status: asset.status,
      isSecure: asset.isSecure,
      lastSeen: asset.lastSeen,
      ipAddress: asset.ipAddress,
      macAddress: asset.macAddress,
      os: asset.os,
      cpu: asset.cpu,
      ram: asset.ram,
      disk: asset.disk,
      notes: asset.notes,
      activityLogs: asset.activityLogs,
      associatedTickets: asset.associatedTickets,
      specifications: asset.specifications,
      sku: asset.sku,
      contractId: asset.contractId,
      purchaseDate: asset.purchaseDate,
      warrantyExpiration: asset.warrantyExpiration,
      maintenanceSchedule: asset.maintenanceSchedule,
      depreciation: asset.depreciation,
      location: asset.location,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    }));
  }

  /**
   * Update asset monitoring data
   */
  static async updateMonitoringData(
    id: string,
    orgId: string,
    monitoringData: {
      status?: Asset['status'];
      isSecure?: boolean;
      lastSeen?: string;
      cpu?: { model: string; usage: number };
      ram?: { total: number; used: number };
      disk?: { total: number; used: number };
    }
  ): Promise<AssetExtended | null> {
    const collection = await this.getAssetsCollection();
    
    const updates: any = {
      updatedAt: new Date()
    };

    if (monitoringData.status) updates.status = monitoringData.status;
    if (monitoringData.isSecure !== undefined) updates.isSecure = monitoringData.isSecure;
    if (monitoringData.lastSeen) updates.lastSeen = monitoringData.lastSeen;
    if (monitoringData.cpu) updates.cpu = monitoringData.cpu;
    if (monitoringData.ram) updates.ram = monitoringData.ram;
    if (monitoringData.disk) updates.disk = monitoringData.disk;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, isDeleted: { $ne: true } },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id!.toString(),
      name: result.name,
      client: result.client,
      type: result.type,
      status: result.status,
      isSecure: result.isSecure,
      lastSeen: result.lastSeen,
      ipAddress: result.ipAddress,
      macAddress: result.macAddress,
      os: result.os,
      cpu: result.cpu,
      ram: result.ram,
      disk: result.disk,
      notes: result.notes,
      activityLogs: result.activityLogs,
      associatedTickets: result.associatedTickets,
      specifications: result.specifications,
      sku: result.sku,
      contractId: result.contractId,
      purchaseDate: result.purchaseDate,
      warrantyExpiration: result.warrantyExpiration,
      maintenanceSchedule: result.maintenanceSchedule,
      depreciation: result.depreciation,
      location: result.location,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Add activity log to asset
   */
  static async addActivityLog(
    assetId: string,
    orgId: string,
    activity: string,
    performedBy?: string
  ): Promise<void> {
    const collection = await this.getAssetsCollection();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      activity: performedBy ? `${activity} by ${performedBy}` : activity
    };

    await collection.updateOne(
      { _id: new ObjectId(assetId), orgId },
      {
        $push: {
          activityLogs: {
            $each: [logEntry],
            $position: 0,
            $slice: 50 // Keep only the latest 50 logs
          }
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Associate asset with ticket
   */
  static async associateWithTicket(
    assetId: string,
    orgId: string,
    ticketId: string
  ): Promise<void> {
    const collection = await this.getAssetsCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(assetId), orgId },
      {
        $addToSet: { associatedTickets: ticketId },
        $set: { updatedAt: new Date() }
      }
    );

    await this.addActivityLog(assetId, orgId, `Associated with ticket ${ticketId}`);
  }

  /**
   * Create asset from inventory item deployment
   */
  static async createFromInventoryDeployment(
    orgId: string,
    inventoryItemId: string,
    assetData: {
      name: string;
      client: string;
      type: 'Server' | 'Workstation' | 'Network' | 'Printer';
      ipAddress?: string;
      macAddress?: string;
      location?: {
        building?: string;
        floor?: string;
        room?: string;
        rack?: string;
      };
      notes?: string;
    },
    deployedBy: string
  ): Promise<AssetExtended> {
    // Get inventory item details for asset creation
    try {
      const { InventoryService } = await import('./inventory');
      const inventoryItem = await InventoryService.getById(inventoryItemId, orgId);
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }

      // Create asset with inventory item information
      const assetCreateData = {
        name: assetData.name,
        client: assetData.client,
        type: assetData.type,
        status: 'Online' as const,
        isSecure: false,
        lastSeen: new Date().toISOString(),
        ipAddress: assetData.ipAddress || '',
        macAddress: assetData.macAddress || '',
        os: '',
        cpu: { model: '', usage: 0 },
        ram: { total: 0, used: 0 },
        disk: { total: 0, used: 0 },
        notes: assetData.notes || `Deployed from inventory item: ${inventoryItem.name} (${inventoryItem.sku})`,
        activityLogs: [],
        associatedTickets: [],
        sku: inventoryItem.sku,
        purchaseDate: inventoryItem.purchaseInfo?.purchaseDate,
        warrantyExpiration: inventoryItem.warrantyInfo?.endDate,
        location: assetData.location,
        specifications: {
          serialNumber: inventoryItem.serialNumbers?.[0] // Use first serial number if available
        }
      };

      const asset = await this.create(orgId, assetCreateData, deployedBy);
      
      // Add activity log about inventory deployment
      await this.addActivityLog(
        asset.id,
        orgId,
        `Created from inventory deployment of ${inventoryItem.name} (${inventoryItem.sku})`,
        deployedBy
      );

      return asset;
    } catch (error) {
      console.error('Failed to create asset from inventory deployment:', error);
      throw error;
    }
  }

  /**
   * Remove asset association with ticket
   */
  static async removeTicketAssociation(
    assetId: string,
    orgId: string,
    ticketId: string
  ): Promise<void> {
    const collection = await this.getAssetsCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(assetId), orgId },
      {
        $pull: { associatedTickets: ticketId },
        $set: { updatedAt: new Date() }
      }
    );

    await this.addActivityLog(assetId, orgId, `Removed association with ticket ${ticketId}`);
  }

  /**
   * Get location statistics
   */
  static async getLocationStats(orgId: string): Promise<AssetLocationStats[]> {
    const collection = await this.getAssetsCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true }, 'location.building': { $exists: true } } },
      {
        $group: {
          _id: '$location.building',
          assetCount: { $sum: 1 },
          onlineCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Online'] }, 1, 0] }
          },
          offlineCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Offline'] }, 1, 0] }
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Warning'] }, 1, 0] }
          }
        }
      },
      { $sort: { assetCount: -1 } }
    ]).toArray();

    return stats.map(stat => ({
      location: stat._id || 'Unknown',
      assetCount: stat.assetCount,
      onlineCount: stat.onlineCount,
      offlineCount: stat.offlineCount,
      warningCount: stat.warningCount
    }));
  }

  /**
   * Get type statistics
   */
  static async getTypeStats(orgId: string): Promise<AssetTypeStats[]> {
    const collection = await this.getAssetsCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          onlineCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Online'] }, 1, 0] }
          },
          avgCpuUsage: { $avg: '$cpu.usage' },
          avgMemoryUsage: { 
            $avg: {
              $cond: [
                { $gt: ['$ram.total', 0] },
                { $multiply: [{ $divide: ['$ram.used', '$ram.total'] }, 100] },
                0
              ]
            }
          },
          avgDiskUsage: {
            $avg: {
              $cond: [
                { $gt: ['$disk.total', 0] },
                { $multiply: [{ $divide: ['$disk.used', '$disk.total'] }, 100] },
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    return stats.map(stat => ({
      type: stat._id as Asset['type'],
      count: stat.count,
      onlineCount: stat.onlineCount,
      avgCpuUsage: Math.round(stat.avgCpuUsage || 0),
      avgMemoryUsage: Math.round(stat.avgMemoryUsage || 0),
      avgDiskUsage: Math.round(stat.avgDiskUsage || 0)
    }));
  }

  /**
   * Search assets
   */
  static async search(orgId: string, query: string): Promise<AssetExtended[]> {
    const collection = await this.getAssetsCollection();
    
    const assets = await collection
      .find({
        orgId,
        isDeleted: { $ne: true },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { client: { $regex: query, $options: 'i' } },
          { ipAddress: { $regex: query, $options: 'i' } },
          { macAddress: { $regex: query, $options: 'i' } },
          { os: { $regex: query, $options: 'i' } },
          { 'cpu.model': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ name: 1 })
      .toArray();

    return assets.map(asset => ({
      id: asset._id!.toString(),
      name: asset.name,
      client: asset.client,
      type: asset.type,
      status: asset.status,
      isSecure: asset.isSecure,
      lastSeen: asset.lastSeen,
      ipAddress: asset.ipAddress,
      macAddress: asset.macAddress,
      os: asset.os,
      cpu: asset.cpu,
      ram: asset.ram,
      disk: asset.disk,
      notes: asset.notes,
      activityLogs: asset.activityLogs,
      associatedTickets: asset.associatedTickets,
      specifications: asset.specifications,
      sku: asset.sku,
      contractId: asset.contractId,
      purchaseDate: asset.purchaseDate,
      warrantyExpiration: asset.warrantyExpiration,
      maintenanceSchedule: asset.maintenanceSchedule,
      depreciation: asset.depreciation,
      location: asset.location,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    }));
  }

  // Maintenance Management

  /**
   * Create maintenance record
   */
  static async createMaintenanceRecord(
    orgId: string,
    maintenanceData: Omit<AssetMaintenanceRecord, '_id' | 'orgId' | 'createdBy' | 'createdAt'>,
    createdBy: string
  ): Promise<AssetMaintenanceRecord> {
    const collection = await this.getMaintenanceCollection();
    
    const now = new Date();
    const document: Omit<AssetMaintenanceRecord, '_id'> = {
      orgId,
      createdBy,
      createdAt: now,
      ...maintenanceData
    };

    const result = await collection.insertOne(document);
    
    // Update asset's next maintenance date if provided
    if (maintenanceData.nextScheduledDate) {
      await this.updateMaintenanceSchedule(
        maintenanceData.assetId,
        orgId,
        maintenanceData.nextScheduledDate,
        now
      );
    }

    // Add activity log to asset
    await this.addActivityLog(
      maintenanceData.assetId,
      orgId,
      `${maintenanceData.maintenanceType} maintenance completed: ${maintenanceData.description}`,
      maintenanceData.performedBy
    );
    
    return {
      _id: result.insertedId,
      ...document
    };
  }

  /**
   * Get maintenance records for an asset
   */
  static async getMaintenanceRecords(
    orgId: string,
    assetId: string
  ): Promise<AssetMaintenanceRecord[]> {
    const collection = await this.getMaintenanceCollection();
    
    const records = await collection
      .find({ orgId, assetId })
      .sort({ performedAt: -1 })
      .toArray();

    return records;
  }

  /**
   * Update asset maintenance schedule
   */
  private static async updateMaintenanceSchedule(
    assetId: string,
    orgId: string,
    nextMaintenanceDate: Date,
    lastMaintenanceDate: Date
  ): Promise<void> {
    const collection = await this.getAssetsCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(assetId), orgId },
      {
        $set: {
          'maintenanceSchedule.nextMaintenanceDate': nextMaintenanceDate,
          'maintenanceSchedule.lastMaintenanceDate': lastMaintenanceDate,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Get assets due for maintenance
   */
  static async getAssetsForMaintenance(orgId: string): Promise<AssetExtended[]> {
    const today = new Date();
    return this.getAll(orgId, { maintenanceDue: true });
  }

  /**
   * Get assets with expiring warranties
   */
  static async getAssetsWithExpiringWarranties(
    orgId: string,
    days: number = 30
  ): Promise<AssetExtended[]> {
    return this.getAll(orgId, { warrantyExpiring: days });
  }
}