import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Inventory Category Settings
export interface InventoryCategorySettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  trackingMethod: 'serial' | 'batch' | 'simple'; // How to track this category
  requiresApproval: boolean; // Require approval for stock movements
  autoReorderEnabled: boolean; // Enable automatic reorder suggestions
  defaultReorderPoint?: number; // Default minimum stock level
  defaultReorderQuantity?: number; // Default quantity to reorder
  defaultLeadTimeDays?: number; // Default supplier lead time
  costMethod: 'fifo' | 'lifo' | 'average'; // Cost calculation method
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required: boolean;
    options?: string[]; // for select type
  }>;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface InventoryCategorySettingExtended extends Omit<InventoryCategorySettingDocument, '_id'> {
  id: string;
  itemCount?: number;
  totalValue?: number;
}

export interface InventoryCategorySettingCreateInput {
  name: string;
  description?: string;
  icon?: string;
  color: string;
  trackingMethod: 'serial' | 'batch' | 'simple';
  requiresApproval?: boolean;
  autoReorderEnabled?: boolean;
  defaultReorderPoint?: number;
  defaultReorderQuantity?: number;
  defaultLeadTimeDays?: number;
  costMethod: 'fifo' | 'lifo' | 'average';
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }>;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface InventoryCategorySettingUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  trackingMethod?: 'serial' | 'batch' | 'simple';
  requiresApproval?: boolean;
  autoReorderEnabled?: boolean;
  defaultReorderPoint?: number;
  defaultReorderQuantity?: number;
  defaultLeadTimeDays?: number;
  costMethod?: 'fifo' | 'lifo' | 'average';
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }>;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// Inventory Location Settings
export interface InventoryLocationSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  type: 'warehouse' | 'office' | 'vehicle' | 'client_site' | 'supplier' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  allowNegativeStock: boolean; // Allow items to go below zero
  requiresApproval: boolean; // Require approval for stock movements
  zoneSettings?: Array<{
    name: string;
    description?: string;
    capacity?: number;
    currentUtilization?: number;
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface InventoryLocationSettingExtended extends Omit<InventoryLocationSettingDocument, '_id'> {
  id: string;
  itemCount?: number;
  totalValue?: number;
}

export interface InventoryLocationSettingCreateInput {
  name: string;
  description?: string;
  type: 'warehouse' | 'office' | 'vehicle' | 'client_site' | 'supplier' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isDefault?: boolean;
  allowNegativeStock?: boolean;
  requiresApproval?: boolean;
  zoneSettings?: Array<{
    name: string;
    description?: string;
    capacity?: number;
    currentUtilization?: number;
  }>;
}

export interface InventoryLocationSettingUpdateInput {
  name?: string;
  description?: string;
  type?: 'warehouse' | 'office' | 'vehicle' | 'client_site' | 'supplier' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isDefault?: boolean;
  isActive?: boolean;
  allowNegativeStock?: boolean;
  requiresApproval?: boolean;
  zoneSettings?: Array<{
    name: string;
    description?: string;
    capacity?: number;
    currentUtilization?: number;
  }>;
}

// Inventory Supplier Settings
export interface InventorySupplierSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  contactInfo: {
    primaryContact?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessInfo?: {
    taxId?: string;
    accountNumber?: string;
    paymentTerms?: string; // e.g., "Net 30", "COD"
    currency?: string;
  };
  performance?: {
    rating: number; // 1-5 star rating
    onTimeDeliveryRate?: number; // percentage
    qualityRating?: number; // 1-5 stars
    responseTime?: number; // hours
  };
  isPreferred: boolean;
  isActive: boolean;
  minimumOrderAmount?: number;
  leadTimeDays?: number;
  categories?: string[]; // Category IDs this supplier serves
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface InventorySupplierSettingExtended extends Omit<InventorySupplierSettingDocument, '_id'> {
  id: string;
  itemCount?: number;
  totalOrderValue?: number;
}

export interface InventorySupplierSettingCreateInput {
  name: string;
  description?: string;
  contactInfo: {
    primaryContact?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessInfo?: {
    taxId?: string;
    accountNumber?: string;
    paymentTerms?: string;
    currency?: string;
  };
  performance?: {
    rating: number;
    onTimeDeliveryRate?: number;
    qualityRating?: number;
    responseTime?: number;
  };
  isPreferred?: boolean;
  minimumOrderAmount?: number;
  leadTimeDays?: number;
  categories?: string[];
}

export interface InventorySupplierSettingUpdateInput {
  name?: string;
  description?: string;
  contactInfo?: {
    primaryContact?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessInfo?: {
    taxId?: string;
    accountNumber?: string;
    paymentTerms?: string;
    currency?: string;
  };
  performance?: {
    rating: number;
    onTimeDeliveryRate?: number;
    qualityRating?: number;
    responseTime?: number;
  };
  isPreferred?: boolean;
  isActive?: boolean;
  minimumOrderAmount?: number;
  leadTimeDays?: number;
  categories?: string[];
}

export class InventorySettingsService {
  // Category Settings Methods
  private static async getCategoryCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<InventoryCategorySettingDocument>('inventory_category_settings');
    } catch (error) {
      console.error('Failed to get category collection:', error);
      throw error;
    }
  }

  private static async getLocationCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<InventoryLocationSettingDocument>('inventory_location_settings');
    } catch (error) {
      console.error('Failed to get location collection:', error);
      throw error;
    }
  }

  private static async getSupplierCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<InventorySupplierSettingDocument>('inventory_supplier_settings');
    } catch (error) {
      console.error('Failed to get supplier collection:', error);
      throw error;
    }
  }

  /**
   * Get all inventory categories for an organization
   */
  static async getAllCategories(orgId: string): Promise<InventoryCategorySettingExtended[]> {
    const collection = await this.getCategoryCollection();
    
    const categories = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    return categories.map(category => this.transformCategoryToExtended(category));
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string, orgId: string): Promise<InventoryCategorySettingExtended | null> {
    const collection = await this.getCategoryCollection();
    
    const category = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!category) return null;
    return this.transformCategoryToExtended(category);
  }

  /**
   * Create new inventory category
   */
  static async createCategory(
    orgId: string,
    categoryData: InventoryCategorySettingCreateInput,
    createdBy: string
  ): Promise<InventoryCategorySettingExtended> {
    const collection = await this.getCategoryCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: categoryData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Category with name "${categoryData.name}" already exists`);
    }

    // Get next sort order
    const lastCategory = await collection.findOne(
      { orgId, isDeleted: { $ne: true } },
      { sort: { sortOrder: -1 } }
    );
    const nextSortOrder = (lastCategory?.sortOrder || 0) + 1;

    const now = new Date();
    const document: Omit<InventoryCategorySettingDocument, '_id'> = {
      orgId,
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color,
      trackingMethod: categoryData.trackingMethod,
      requiresApproval: categoryData.requiresApproval || false,
      autoReorderEnabled: categoryData.autoReorderEnabled || false,
      defaultReorderPoint: categoryData.defaultReorderPoint,
      defaultReorderQuantity: categoryData.defaultReorderQuantity,
      defaultLeadTimeDays: categoryData.defaultLeadTimeDays,
      costMethod: categoryData.costMethod,
      customFields: categoryData.customFields || [],
      isDefault: categoryData.isDefault || false,
      isActive: true,
      sortOrder: categoryData.sortOrder || nextSortOrder,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created category');
    }

    return this.transformCategoryToExtended(created);
  }

  /**
   * Update inventory category
   */
  static async updateCategory(
    id: string,
    orgId: string,
    updates: InventoryCategorySettingUpdateInput,
    updatedBy: string
  ): Promise<InventoryCategorySettingExtended | null> {
    const collection = await this.getCategoryCollection();
    
    // Check if name conflicts with another category
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Category with name "${updates.name}" already exists`);
      }
    }

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id), 
        orgId, 
        isDeleted: { $ne: true } 
      },
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
    return this.transformCategoryToExtended(result);
  }

  /**
   * Delete inventory category (soft delete)
   */
  static async deleteCategory(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getCategoryCollection();
    
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
   * Get all inventory locations for an organization
   */
  static async getAllLocations(orgId: string): Promise<InventoryLocationSettingExtended[]> {
    const collection = await this.getLocationCollection();
    
    const locations = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ name: 1 })
      .toArray();

    return locations.map(location => this.transformLocationToExtended(location));
  }

  /**
   * Create new inventory location
   */
  static async createLocation(
    orgId: string,
    locationData: InventoryLocationSettingCreateInput,
    createdBy: string
  ): Promise<InventoryLocationSettingExtended> {
    const collection = await this.getLocationCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: locationData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Location with name "${locationData.name}" already exists`);
    }

    const now = new Date();
    const document: Omit<InventoryLocationSettingDocument, '_id'> = {
      orgId,
      name: locationData.name,
      description: locationData.description,
      type: locationData.type,
      address: locationData.address,
      contact: locationData.contact,
      isDefault: locationData.isDefault || false,
      isActive: true,
      allowNegativeStock: locationData.allowNegativeStock || false,
      requiresApproval: locationData.requiresApproval || false,
      zoneSettings: locationData.zoneSettings || [],
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created location');
    }

    return this.transformLocationToExtended(created);
  }

  /**
   * Update inventory location
   */
  static async updateLocation(
    id: string,
    orgId: string,
    updates: InventoryLocationSettingUpdateInput,
    updatedBy: string
  ): Promise<InventoryLocationSettingExtended | null> {
    const collection = await this.getLocationCollection();
    
    // Check if name conflicts with another location
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Location with name "${updates.name}" already exists`);
      }
    }

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id), 
        orgId, 
        isDeleted: { $ne: true } 
      },
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
    return this.transformLocationToExtended(result);
  }

  /**
   * Delete inventory location (soft delete)
   */
  static async deleteLocation(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getLocationCollection();
    
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
   * Get all inventory suppliers for an organization
   */
  static async getAllSuppliers(orgId: string): Promise<InventorySupplierSettingExtended[]> {
    const collection = await this.getSupplierCollection();
    
    const suppliers = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ name: 1 })
      .toArray();

    return suppliers.map(supplier => this.transformSupplierToExtended(supplier));
  }

  /**
   * Create new inventory supplier
   */
  static async createSupplier(
    orgId: string,
    supplierData: InventorySupplierSettingCreateInput,
    createdBy: string
  ): Promise<InventorySupplierSettingExtended> {
    const collection = await this.getSupplierCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: supplierData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Supplier with name "${supplierData.name}" already exists`);
    }

    const now = new Date();
    const document: Omit<InventorySupplierSettingDocument, '_id'> = {
      orgId,
      name: supplierData.name,
      description: supplierData.description,
      contactInfo: supplierData.contactInfo,
      address: supplierData.address,
      businessInfo: supplierData.businessInfo,
      performance: supplierData.performance || { rating: 3 },
      isPreferred: supplierData.isPreferred || false,
      isActive: true,
      minimumOrderAmount: supplierData.minimumOrderAmount,
      leadTimeDays: supplierData.leadTimeDays,
      categories: supplierData.categories || [],
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created supplier');
    }

    return this.transformSupplierToExtended(created);
  }

  /**
   * Update inventory supplier
   */
  static async updateSupplier(
    id: string,
    orgId: string,
    updates: InventorySupplierSettingUpdateInput,
    updatedBy: string
  ): Promise<InventorySupplierSettingExtended | null> {
    const collection = await this.getSupplierCollection();
    
    // Check if name conflicts with another supplier
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Supplier with name "${updates.name}" already exists`);
      }
    }

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id), 
        orgId, 
        isDeleted: { $ne: true } 
      },
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
    return this.transformSupplierToExtended(result);
  }

  /**
   * Delete inventory supplier (soft delete)
   */
  static async deleteSupplier(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getSupplierCollection();
    
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
   * Initialize default inventory settings for an organization
   */
  static async initializeDefaults(orgId: string, createdBy: string): Promise<{
    categories: InventoryCategorySettingExtended[];
    locations: InventoryLocationSettingExtended[];
    suppliers: InventorySupplierSettingExtended[];
  }> {
    const defaultCategories: InventoryCategorySettingCreateInput[] = [
      {
        name: 'Hardware',
        description: 'Computer hardware and equipment',
        color: '#3b82f6',
        icon: 'cpu',
        trackingMethod: 'serial',
        requiresApproval: true,
        autoReorderEnabled: true,
        defaultReorderPoint: 5,
        defaultReorderQuantity: 10,
        defaultLeadTimeDays: 14,
        costMethod: 'fifo',
        isDefault: true,
        sortOrder: 1
      },
      {
        name: 'Software',
        description: 'Software licenses and subscriptions',
        color: '#10b981',
        icon: 'code',
        trackingMethod: 'simple',
        requiresApproval: true,
        autoReorderEnabled: false,
        costMethod: 'average',
        sortOrder: 2
      },
      {
        name: 'Consumables',
        description: 'Cables, batteries, and other consumables',
        color: '#f59e0b',
        icon: 'package',
        trackingMethod: 'simple',
        requiresApproval: false,
        autoReorderEnabled: true,
        defaultReorderPoint: 20,
        defaultReorderQuantity: 50,
        defaultLeadTimeDays: 7,
        costMethod: 'fifo',
        sortOrder: 3
      },
      {
        name: 'Tools',
        description: 'IT tools and testing equipment',
        color: '#8b5cf6',
        icon: 'wrench',
        trackingMethod: 'simple',
        requiresApproval: false,
        autoReorderEnabled: false,
        costMethod: 'average',
        sortOrder: 4
      },
      {
        name: 'Spare Parts',
        description: 'Replacement parts and components',
        color: '#ef4444',
        icon: 'gear',
        trackingMethod: 'batch',
        requiresApproval: true,
        autoReorderEnabled: true,
        defaultReorderPoint: 3,
        defaultReorderQuantity: 5,
        defaultLeadTimeDays: 21,
        costMethod: 'fifo',
        sortOrder: 5
      }
    ];

    const defaultLocations: InventoryLocationSettingCreateInput[] = [
      {
        name: 'Main Warehouse',
        description: 'Primary inventory storage location',
        type: 'warehouse',
        isDefault: true,
        allowNegativeStock: false,
        requiresApproval: false,
        zoneSettings: [
          { name: 'Zone A', description: 'Hardware storage', capacity: 1000, currentUtilization: 0 },
          { name: 'Zone B', description: 'Software storage', capacity: 500, currentUtilization: 0 },
          { name: 'Zone C', description: 'Consumables', capacity: 2000, currentUtilization: 0 }
        ]
      },
      {
        name: 'Office Storage',
        description: 'Office supply storage room',
        type: 'office',
        allowNegativeStock: true,
        requiresApproval: false
      },
      {
        name: 'Field Technician Van',
        description: 'Mobile inventory for field technicians',
        type: 'vehicle',
        allowNegativeStock: false,
        requiresApproval: true
      },
      {
        name: 'Client Deployment Site',
        description: 'Temporary storage at client location',
        type: 'client_site',
        allowNegativeStock: false,
        requiresApproval: true
      }
    ];

    const defaultSuppliers: InventorySupplierSettingCreateInput[] = [
      {
        name: 'Dell Technologies',
        description: 'Computer hardware and enterprise solutions',
        contactInfo: {
          primaryContact: 'Account Manager',
          email: 'orders@dell.com',
          phone: '1-800-DELL-1000',
          website: 'https://www.dell.com'
        },
        businessInfo: {
          paymentTerms: 'Net 30',
          currency: 'USD'
        },
        performance: {
          rating: 4,
          onTimeDeliveryRate: 95,
          qualityRating: 5,
          responseTime: 2
        },
        isPreferred: true,
        minimumOrderAmount: 500,
        leadTimeDays: 10,
        categories: []
      },
      {
        name: 'CDW',
        description: 'Technology solutions and services',
        contactInfo: {
          primaryContact: 'Sales Representative',
          email: 'orders@cdw.com',
          phone: '1-800-800-4239',
          website: 'https://www.cdw.com'
        },
        businessInfo: {
          paymentTerms: 'Net 30',
          currency: 'USD'
        },
        performance: {
          rating: 4,
          onTimeDeliveryRate: 92,
          qualityRating: 4,
          responseTime: 4
        },
        isPreferred: true,
        minimumOrderAmount: 250,
        leadTimeDays: 7,
        categories: []
      },
      {
        name: 'Amazon Business',
        description: 'Office supplies and consumables',
        contactInfo: {
          primaryContact: 'Customer Service',
          email: 'business@amazon.com',
          phone: '1-888-281-3747',
          website: 'https://business.amazon.com'
        },
        businessInfo: {
          paymentTerms: 'Credit Card',
          currency: 'USD'
        },
        performance: {
          rating: 3,
          onTimeDeliveryRate: 88,
          qualityRating: 3,
          responseTime: 24
        },
        isPreferred: false,
        minimumOrderAmount: 25,
        leadTimeDays: 2,
        categories: []
      }
    ];

    const createdCategories = [];
    const createdLocations = [];
    const createdSuppliers = [];

    // Create default categories
    for (const categoryData of defaultCategories) {
      try {
        const existing = await this.getCategoryCollection().then(col => 
          col.findOne({ orgId, name: categoryData.name, isDeleted: { $ne: true } })
        );
        
        if (!existing) {
          const created = await this.createCategory(orgId, categoryData, createdBy);
          createdCategories.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default category ${categoryData.name}:`, error);
      }
    }

    // Create default locations
    for (const locationData of defaultLocations) {
      try {
        const existing = await this.getLocationCollection().then(col => 
          col.findOne({ orgId, name: locationData.name, isDeleted: { $ne: true } })
        );
        
        if (!existing) {
          const created = await this.createLocation(orgId, locationData, createdBy);
          createdLocations.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default location ${locationData.name}:`, error);
      }
    }

    // Create default suppliers
    for (const supplierData of defaultSuppliers) {
      try {
        const existing = await this.getSupplierCollection().then(col =>
          col.findOne({ orgId, name: supplierData.name, isDeleted: { $ne: true } })
        );

        if (!existing) {
          const created = await this.createSupplier(orgId, supplierData, createdBy);
          createdSuppliers.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default supplier ${supplierData.name}:`, error);
      }
    }

    return {
      categories: createdCategories,
      locations: createdLocations,
      suppliers: createdSuppliers
    };
  }

  /**
   * Get inventory settings statistics
   */
  static async getStats(orgId: string): Promise<{
    totalCategories: number;
    activeCategories: number;
    totalLocations: number;
    activeLocations: number;
    totalSuppliers: number;
    activeSuppliers: number;
    preferredSuppliers: number;
  }> {
    const categoryCollection = await this.getCategoryCollection();
    const locationCollection = await this.getLocationCollection();
    const supplierCollection = await this.getSupplierCollection();
    
    const [categoryStats, locationStats, supplierStats] = await Promise.all([
      categoryCollection.aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]).toArray(),
      locationCollection.aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]).toArray(),
      supplierCollection.aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            preferred: { $sum: { $cond: ['$isPreferred', 1, 0] } }
          }
        }
      ]).toArray()
    ]);

    return {
      totalCategories: categoryStats[0]?.total || 0,
      activeCategories: categoryStats[0]?.active || 0,
      totalLocations: locationStats[0]?.total || 0,
      activeLocations: locationStats[0]?.active || 0,
      totalSuppliers: supplierStats[0]?.total || 0,
      activeSuppliers: supplierStats[0]?.active || 0,
      preferredSuppliers: supplierStats[0]?.preferred || 0
    };
  }

  /**
   * Get categories that can be used for asset creation
   */
  static async getCategoriesForAssetCreation(orgId: string): Promise<Array<{
    id: string;
    name: string;
    color: string;
    defaultWarrantyMonths?: number;
    depreciationRate?: number;
  }>> {
    const categories = await this.getAllCategories(orgId);
    
    // Filter and map categories that are suitable for asset creation
    return categories
      .filter(cat => cat.isActive && ['Hardware', 'Software', 'Tools'].includes(cat.name))
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        defaultWarrantyMonths: cat.defaultLeadTimeDays ? cat.defaultLeadTimeDays * 30 : undefined,
        depreciationRate: cat.trackingMethod === 'serial' ? 25 : 20 // Default based on tracking method
      }));
  }

  /**
   * Private helper methods
   */
  private static transformCategoryToExtended(category: InventoryCategorySettingDocument): InventoryCategorySettingExtended {
    return {
      id: category._id!.toString(),
      orgId: category.orgId,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      trackingMethod: category.trackingMethod,
      requiresApproval: category.requiresApproval,
      autoReorderEnabled: category.autoReorderEnabled,
      defaultReorderPoint: category.defaultReorderPoint,
      defaultReorderQuantity: category.defaultReorderQuantity,
      defaultLeadTimeDays: category.defaultLeadTimeDays,
      costMethod: category.costMethod,
      customFields: category.customFields,
      isDefault: category.isDefault,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      isDeleted: category.isDeleted,
      deletedAt: category.deletedAt
    };
  }

  private static transformLocationToExtended(location: InventoryLocationSettingDocument): InventoryLocationSettingExtended {
    return {
      id: location._id!.toString(),
      orgId: location.orgId,
      name: location.name,
      description: location.description,
      type: location.type,
      address: location.address,
      contact: location.contact,
      isDefault: location.isDefault,
      isActive: location.isActive,
      allowNegativeStock: location.allowNegativeStock,
      requiresApproval: location.requiresApproval,
      zoneSettings: location.zoneSettings,
      createdBy: location.createdBy,
      updatedBy: location.updatedBy,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      isDeleted: location.isDeleted,
      deletedAt: location.deletedAt
    };
  }

  private static transformSupplierToExtended(supplier: InventorySupplierSettingDocument): InventorySupplierSettingExtended {
    return {
      id: supplier._id!.toString(),
      orgId: supplier.orgId,
      name: supplier.name,
      description: supplier.description,
      contactInfo: supplier.contactInfo,
      address: supplier.address,
      businessInfo: supplier.businessInfo,
      performance: supplier.performance,
      isPreferred: supplier.isPreferred,
      isActive: supplier.isActive,
      minimumOrderAmount: supplier.minimumOrderAmount,
      leadTimeDays: supplier.leadTimeDays,
      categories: supplier.categories,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      isDeleted: supplier.isDeleted,
      deletedAt: supplier.deletedAt
    };
  }
}