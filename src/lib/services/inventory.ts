import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { InventoryItem } from '@/lib/types';

export interface InventoryDocument extends Omit<InventoryItem, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Enhanced inventory tracking fields
  unitCost?: number;
  totalValue?: number;
  supplier?: string;
  supplierSku?: string;
  barcode?: string;
  serialNumbers?: string[]; // For tracked items
  warrantyInfo?: {
    startDate?: Date;
    endDate?: Date;
    provider?: string;
  };
  purchaseInfo?: {
    purchaseOrderNumber?: string;
    purchaseDate?: Date;
    vendor?: string;
    invoiceNumber?: string;
  };
  deploymentHistory?: Array<{
    deployedTo?: string; // Asset ID or Client ID
    deployedBy: string;
    deployedAt: Date;
    returnedAt?: Date;
    notes?: string;
  }>;
  stockMovements?: Array<{
    type: 'in' | 'out' | 'adjustment' | 'deployment' | 'return';
    quantity: number;
    reason?: string;
    performedBy: string;
    performedAt: Date;
    reference?: string; // PO number, asset ID, etc.
  }>;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalCategories: number;
  totalLocations: number;
  avgItemValue: number;
  recentMovements: number;
  pendingOrders: number;
  mspOwnedItems: number;
  clientOwnedItems: number;
}

export interface InventoryExtended extends InventoryItem {
  unitCost?: number;
  totalValue?: number;
  supplier?: string;
  supplierSku?: string;
  barcode?: string;
  serialNumbers?: string[];
  warrantyInfo?: {
    startDate?: Date;
    endDate?: Date;
    provider?: string;
  };
  purchaseInfo?: {
    purchaseOrderNumber?: string;
    purchaseDate?: Date;
    vendor?: string;
    invoiceNumber?: string;
  };
  deploymentHistory?: Array<{
    deployedTo?: string;
    deployedBy: string;
    deployedAt: Date;
    returnedAt?: Date;
    notes?: string;
  }>;
  stockMovements?: Array<{
    type: 'in' | 'out' | 'adjustment' | 'deployment' | 'return';
    quantity: number;
    reason?: string;
    performedBy: string;
    performedAt: Date;
    reference?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryStats {
  category: InventoryItem['category'];
  itemCount: number;
  totalValue: number;
  lowStockCount: number;
  avgQuantity: number;
}

export interface LocationStats {
  location: string;
  itemCount: number;
  totalValue: number;
  lowStockCount: number;
  categories: string[];
}

export interface StockMovement {
  _id?: ObjectId;
  orgId: string;
  inventoryItemId: string;
  type: 'in' | 'out' | 'adjustment' | 'deployment' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  performedBy: string;
  performedAt: Date;
  reference?: string; // PO number, asset ID, etc.
  createdAt: Date;
}

export interface PurchaseOrder {
  _id?: ObjectId;
  orgId: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'shipped' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  items: Array<{
    inventoryItemId?: string; // For existing items
    sku: string;
    name: string;
    category: InventoryItem['category'];
    quantity: number;
    unitCost: number;
    totalCost: number;
    received?: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryService {
  private static async getInventoryCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<InventoryDocument>('inventory');
  }

  private static async getStockMovementsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<StockMovement>('stock_movements');
  }

  private static async getPurchaseOrdersCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<PurchaseOrder>('purchase_orders');
  }

  /**
   * Get all inventory items for an organization
   */
  static async getAll(orgId: string, filters?: {
    category?: string[];
    owner?: string[];
    location?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    includeDeleted?: boolean;
  }): Promise<InventoryExtended[]> {
    const collection = await this.getInventoryCollection();
    
    const query: any = { orgId };
    
    if (!filters?.includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    if (filters?.category?.length) {
      query.category = { $in: filters.category };
    }
    
    if (filters?.owner?.length) {
      query.owner = { $in: filters.owner };
    }
    
    if (filters?.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    const items = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    let filteredItems = items;

    if (filters?.lowStock) {
      filteredItems = filteredItems.filter(item => item.quantity <= item.reorderPoint);
    }

    if (filters?.outOfStock) {
      filteredItems = filteredItems.filter(item => item.quantity <= 0);
    }

    return filteredItems.map(item => ({
      id: item._id!.toString(),
      sku: item.sku,
      name: item.name,
      category: item.category,
      owner: item.owner,
      location: item.location,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      notes: item.notes,
      unitCost: item.unitCost,
      totalValue: item.totalValue,
      supplier: item.supplier,
      supplierSku: item.supplierSku,
      barcode: item.barcode,
      serialNumbers: item.serialNumbers,
      warrantyInfo: item.warrantyInfo,
      purchaseInfo: item.purchaseInfo,
      deploymentHistory: item.deploymentHistory,
      stockMovements: item.stockMovements,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  /**
   * Get inventory item by ID
   */
  static async getById(id: string, orgId: string): Promise<InventoryExtended | null> {
    const collection = await this.getInventoryCollection();
    
    const item = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!item) return null;

    return {
      id: item._id!.toString(),
      sku: item.sku,
      name: item.name,
      category: item.category,
      owner: item.owner,
      location: item.location,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      notes: item.notes,
      unitCost: item.unitCost,
      totalValue: item.totalValue,
      supplier: item.supplier,
      supplierSku: item.supplierSku,
      barcode: item.barcode,
      serialNumbers: item.serialNumbers,
      warrantyInfo: item.warrantyInfo,
      purchaseInfo: item.purchaseInfo,
      deploymentHistory: item.deploymentHistory,
      stockMovements: item.stockMovements,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  /**
   * Create a new inventory item
   */
  static async create(
    orgId: string,
    itemData: Omit<InventoryItem, 'id'> & {
      unitCost?: number;
      supplier?: string;
      supplierSku?: string;
      barcode?: string;
      serialNumbers?: string[];
      warrantyInfo?: {
        startDate?: Date;
        endDate?: Date;
        provider?: string;
      };
      purchaseInfo?: {
        purchaseOrderNumber?: string;
        purchaseDate?: Date;
        vendor?: string;
        invoiceNumber?: string;
      };
    },
    createdBy: string
  ): Promise<InventoryExtended> {
    const collection = await this.getInventoryCollection();
    
    const now = new Date();
    const totalValue = itemData.unitCost ? itemData.unitCost * itemData.quantity : undefined;
    
    const document: Omit<InventoryDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      sku: itemData.sku,
      name: itemData.name,
      category: itemData.category,
      owner: itemData.owner,
      location: itemData.location,
      quantity: itemData.quantity,
      reorderPoint: itemData.reorderPoint,
      notes: itemData.notes,
      unitCost: itemData.unitCost,
      totalValue,
      supplier: itemData.supplier,
      supplierSku: itemData.supplierSku,
      barcode: itemData.barcode,
      serialNumbers: itemData.serialNumbers,
      warrantyInfo: itemData.warrantyInfo,
      purchaseInfo: itemData.purchaseInfo,
      deploymentHistory: [],
      stockMovements: [],
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    // Add initial stock movement if quantity > 0
    if (itemData.quantity > 0) {
      await this.addStockMovement(
        result.insertedId.toString(),
        orgId,
        'in',
        itemData.quantity,
        0,
        'Initial stock',
        createdBy,
        itemData.purchaseInfo?.purchaseOrderNumber
      );
    }
    
    return {
      id: result.insertedId.toString(),
      sku: document.sku,
      name: document.name,
      category: document.category,
      owner: document.owner,
      location: document.location,
      quantity: document.quantity,
      reorderPoint: document.reorderPoint,
      notes: document.notes,
      unitCost: document.unitCost,
      totalValue: document.totalValue,
      supplier: document.supplier,
      supplierSku: document.supplierSku,
      barcode: document.barcode,
      serialNumbers: document.serialNumbers,
      warrantyInfo: document.warrantyInfo,
      purchaseInfo: document.purchaseInfo,
      deploymentHistory: document.deploymentHistory,
      stockMovements: document.stockMovements,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }

  /**
   * Update an inventory item
   */
  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<InventoryItem, 'id'> & {
      unitCost?: number;
      supplier?: string;
      supplierSku?: string;
      barcode?: string;
      serialNumbers?: string[];
      warrantyInfo?: {
        startDate?: Date;
        endDate?: Date;
        provider?: string;
      };
      purchaseInfo?: {
        purchaseOrderNumber?: string;
        purchaseDate?: Date;
        vendor?: string;
        invoiceNumber?: string;
      };
    }>,
    updatedBy: string
  ): Promise<InventoryExtended | null> {
    const collection = await this.getInventoryCollection();
    
    // Calculate new total value if unitCost or quantity changed
    if (updates.unitCost !== undefined || updates.quantity !== undefined) {
      const currentItem = await collection.findOne({ _id: new ObjectId(id), orgId });
      if (currentItem) {
        const unitCost = updates.unitCost ?? currentItem.unitCost ?? 0;
        const quantity = updates.quantity ?? currentItem.quantity;
        updates.totalValue = unitCost * quantity;
      }
    }
    
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

    return {
      id: result._id!.toString(),
      sku: result.sku,
      name: result.name,
      category: result.category,
      owner: result.owner,
      location: result.location,
      quantity: result.quantity,
      reorderPoint: result.reorderPoint,
      notes: result.notes,
      unitCost: result.unitCost,
      totalValue: result.totalValue,
      supplier: result.supplier,
      supplierSku: result.supplierSku,
      barcode: result.barcode,
      serialNumbers: result.serialNumbers,
      warrantyInfo: result.warrantyInfo,
      purchaseInfo: result.purchaseInfo,
      deploymentHistory: result.deploymentHistory,
      stockMovements: result.stockMovements,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Soft delete an inventory item
   */
  static async delete(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getInventoryCollection();
    
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

    return !!result;
  }

  /**
   * Restore a soft-deleted inventory item
   */
  static async restore(id: string, orgId: string, restoredBy: string): Promise<InventoryExtended | null> {
    const collection = await this.getInventoryCollection();
    
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

    return {
      id: result._id!.toString(),
      sku: result.sku,
      name: result.name,
      category: result.category,
      owner: result.owner,
      location: result.location,
      quantity: result.quantity,
      reorderPoint: result.reorderPoint,
      notes: result.notes,
      unitCost: result.unitCost,
      totalValue: result.totalValue,
      supplier: result.supplier,
      supplierSku: result.supplierSku,
      barcode: result.barcode,
      serialNumbers: result.serialNumbers,
      warrantyInfo: result.warrantyInfo,
      purchaseInfo: result.purchaseInfo,
      deploymentHistory: result.deploymentHistory,
      stockMovements: result.stockMovements,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Get inventory statistics for organization
   */
  static async getStats(orgId: string): Promise<InventoryStats> {
    const collection = await this.getInventoryCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          lowStockItems: {
            $sum: { $cond: [{ $lte: ['$quantity', '$reorderPoint'] }, 1, 0] }
          },
          outOfStockItems: {
            $sum: { $cond: [{ $lte: ['$quantity', 0] }, 1, 0] }
          },
          mspOwnedItems: {
            $sum: { $cond: [{ $eq: ['$owner', 'MSP'] }, 1, 0] }
          },
          clientOwnedItems: {
            $sum: { $cond: [{ $ne: ['$owner', 'MSP'] }, 1, 0] }
          },
          avgItemValue: { $avg: '$totalValue' },
          totalCategories: { $addToSet: '$category' },
          totalLocations: { $addToSet: '$location' }
        }
      }
    ]).toArray();

    // Get recent movements count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const movementsCollection = await this.getStockMovementsCollection();
    const recentMovements = await movementsCollection.countDocuments({
      orgId,
      performedAt: { $gte: thirtyDaysAgo }
    });

    // Get pending purchase orders
    const purchaseOrdersCollection = await this.getPurchaseOrdersCollection();
    const pendingOrders = await purchaseOrdersCollection.countDocuments({
      orgId,
      status: { $in: ['sent', 'acknowledged', 'shipped'] }
    });

    const result = stats[0] || {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      mspOwnedItems: 0,
      clientOwnedItems: 0,
      avgItemValue: 0,
      totalCategories: [],
      totalLocations: []
    };

    return {
      totalItems: result.totalItems,
      totalValue: result.totalValue || 0,
      lowStockItems: result.lowStockItems,
      outOfStockItems: result.outOfStockItems,
      totalCategories: result.totalCategories?.length || 0,
      totalLocations: result.totalLocations?.length || 0,
      avgItemValue: result.avgItemValue || 0,
      recentMovements,
      pendingOrders,
      mspOwnedItems: result.mspOwnedItems,
      clientOwnedItems: result.clientOwnedItems
    };
  }

  /**
   * Adjust stock quantity
   */
  static async adjustStock(
    id: string,
    orgId: string,
    newQuantity: number,
    reason: string,
    performedBy: string,
    reference?: string
  ): Promise<InventoryExtended | null> {
    const collection = await this.getInventoryCollection();
    
    // Get current item to track previous quantity
    const currentItem = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!currentItem) return null;

    const previousQuantity = currentItem.quantity;
    const quantityDiff = newQuantity - previousQuantity;
    
    // Update the inventory item
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, isDeleted: { $ne: true } },
      {
        $set: {
          quantity: newQuantity,
          totalValue: currentItem.unitCost ? currentItem.unitCost * newQuantity : currentItem.totalValue,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    // Add stock movement record
    await this.addStockMovement(
      id,
      orgId,
      'adjustment',
      Math.abs(quantityDiff),
      previousQuantity,
      reason,
      performedBy,
      reference
    );

    return {
      id: result._id!.toString(),
      sku: result.sku,
      name: result.name,
      category: result.category,
      owner: result.owner,
      location: result.location,
      quantity: result.quantity,
      reorderPoint: result.reorderPoint,
      notes: result.notes,
      unitCost: result.unitCost,
      totalValue: result.totalValue,
      supplier: result.supplier,
      supplierSku: result.supplierSku,
      barcode: result.barcode,
      serialNumbers: result.serialNumbers,
      warrantyInfo: result.warrantyInfo,
      purchaseInfo: result.purchaseInfo,
      deploymentHistory: result.deploymentHistory,
      stockMovements: result.stockMovements,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Deploy inventory item as asset
   */
  static async deployAsset(
    id: string,
    orgId: string,
    deployedTo: string,
    deployedBy: string,
    notes?: string
  ): Promise<InventoryExtended | null> {
    const collection = await this.getInventoryCollection();
    
    // Get current item
    const currentItem = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!currentItem || currentItem.quantity <= 0) return null;

    const newQuantity = currentItem.quantity - 1;
    const deploymentRecord = {
      deployedTo,
      deployedBy,
      deployedAt: new Date(),
      notes
    };

    // Update inventory and add deployment record
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, isDeleted: { $ne: true } },
      {
        $set: {
          quantity: newQuantity,
          totalValue: currentItem.unitCost ? currentItem.unitCost * newQuantity : currentItem.totalValue,
          updatedAt: new Date()
        },
        $push: {
          deploymentHistory: deploymentRecord
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    // Add stock movement record
    await this.addStockMovement(
      id,
      orgId,
      'deployment',
      1,
      currentItem.quantity,
      `Deployed as asset to ${deployedTo}`,
      deployedBy,
      deployedTo
    );

    return {
      id: result._id!.toString(),
      sku: result.sku,
      name: result.name,
      category: result.category,
      owner: result.owner,
      location: result.location,
      quantity: result.quantity,
      reorderPoint: result.reorderPoint,
      notes: result.notes,
      unitCost: result.unitCost,
      totalValue: result.totalValue,
      supplier: result.supplier,
      supplierSku: result.supplierSku,
      barcode: result.barcode,
      serialNumbers: result.serialNumbers,
      warrantyInfo: result.warrantyInfo,
      purchaseInfo: result.purchaseInfo,
      deploymentHistory: result.deploymentHistory,
      stockMovements: result.stockMovements,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  /**
   * Add stock movement record
   */
  private static async addStockMovement(
    inventoryItemId: string,
    orgId: string,
    type: StockMovement['type'],
    quantity: number,
    previousQuantity: number,
    reason?: string,
    performedBy?: string,
    reference?: string
  ): Promise<void> {
    const collection = await this.getStockMovementsCollection();
    
    const movement: Omit<StockMovement, '_id'> = {
      orgId,
      inventoryItemId,
      type,
      quantity,
      previousQuantity,
      newQuantity: type === 'out' || type === 'deployment' 
        ? previousQuantity - quantity 
        : previousQuantity + quantity,
      reason,
      performedBy: performedBy || 'system',
      performedAt: new Date(),
      reference,
      createdAt: new Date()
    };

    await collection.insertOne(movement);
  }

  /**
   * Get stock movements for an item
   */
  static async getStockMovements(
    orgId: string,
    inventoryItemId?: string,
    limit: number = 50
  ): Promise<StockMovement[]> {
    const collection = await this.getStockMovementsCollection();
    
    const query: any = { orgId };
    if (inventoryItemId) {
      query.inventoryItemId = inventoryItemId;
    }

    const movements = await collection
      .find(query)
      .sort({ performedAt: -1 })
      .limit(limit)
      .toArray();

    return movements;
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(orgId: string): Promise<CategoryStats[]> {
    const collection = await this.getInventoryCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$category',
          itemCount: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$quantity', '$reorderPoint'] }, 1, 0] }
          },
          avgQuantity: { $avg: '$quantity' }
        }
      },
      { $sort: { itemCount: -1 } }
    ]).toArray();

    return stats.map(stat => ({
      category: stat._id as InventoryItem['category'],
      itemCount: stat.itemCount,
      totalValue: stat.totalValue || 0,
      lowStockCount: stat.lowStockCount,
      avgQuantity: Math.round(stat.avgQuantity || 0)
    }));
  }

  /**
   * Get location statistics
   */
  static async getLocationStats(orgId: string): Promise<LocationStats[]> {
    const collection = await this.getInventoryCollection();

    const stats = await collection.aggregate([
      { $match: { orgId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$location',
          itemCount: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$quantity', '$reorderPoint'] }, 1, 0] }
          },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { itemCount: -1 } }
    ]).toArray();

    return stats.map(stat => ({
      location: stat._id || 'Unknown',
      itemCount: stat.itemCount,
      totalValue: stat.totalValue || 0,
      lowStockCount: stat.lowStockCount,
      categories: stat.categories || []
    }));
  }

  /**
   * Search inventory items
   */
  static async search(orgId: string, query: string): Promise<InventoryExtended[]> {
    const collection = await this.getInventoryCollection();
    
    const items = await collection
      .find({
        orgId,
        isDeleted: { $ne: true },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { supplier: { $regex: query, $options: 'i' } },
          { supplierSku: { $regex: query, $options: 'i' } },
          { barcode: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ name: 1 })
      .toArray();

    return items.map(item => ({
      id: item._id!.toString(),
      sku: item.sku,
      name: item.name,
      category: item.category,
      owner: item.owner,
      location: item.location,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      notes: item.notes,
      unitCost: item.unitCost,
      totalValue: item.totalValue,
      supplier: item.supplier,
      supplierSku: item.supplierSku,
      barcode: item.barcode,
      serialNumbers: item.serialNumbers,
      warrantyInfo: item.warrantyInfo,
      purchaseInfo: item.purchaseInfo,
      deploymentHistory: item.deploymentHistory,
      stockMovements: item.stockMovements,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  /**
   * Get low stock items
   */
  static async getLowStockItems(orgId: string): Promise<InventoryExtended[]> {
    return this.getAll(orgId, { lowStock: true });
  }

  /**
   * Get out of stock items
   */
  static async getOutOfStockItems(orgId: string): Promise<InventoryExtended[]> {
    return this.getAll(orgId, { outOfStock: true });
  }
}