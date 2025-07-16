import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Asset Category Settings
export interface AssetCategorySettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  depreciationRate?: number; // percentage per year
  defaultWarrantyMonths?: number;
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

export interface AssetCategorySettingExtended extends Omit<AssetCategorySettingDocument, '_id'> {
  id: string;
  assetCount?: number;
}

export interface AssetCategorySettingCreateInput {
  name: string;
  description?: string;
  icon?: string;
  color: string;
  depreciationRate?: number;
  defaultWarrantyMonths?: number;
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }>;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface AssetCategorySettingUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  depreciationRate?: number;
  defaultWarrantyMonths?: number;
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

// Asset Status Settings
export interface AssetStatusSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  color: string;
  type: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  isDefault: boolean;
  isSystem: boolean; // cannot be deleted
  sortOrder: number;
  isActive: boolean;
  allowedTransitions?: string[]; // status IDs this can transition to
  requiresComment?: boolean;
  autoActions?: Array<{
    condition: 'on_enter' | 'on_exit' | 'after_days';
    action: 'notify' | 'create_ticket' | 'update_field';
    target: string;
    value?: string;
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface AssetStatusSettingExtended extends Omit<AssetStatusSettingDocument, '_id'> {
  id: string;
  assetCount?: number;
}

export interface AssetStatusSettingCreateInput {
  name: string;
  color: string;
  type: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  isDefault?: boolean;
  sortOrder?: number;
  allowedTransitions?: string[];
  requiresComment?: boolean;
  autoActions?: Array<{
    condition: 'on_enter' | 'on_exit' | 'after_days';
    action: 'notify' | 'create_ticket' | 'update_field';
    target: string;
    value?: string;
  }>;
}

export interface AssetStatusSettingUpdateInput {
  name?: string;
  color?: string;
  type?: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  allowedTransitions?: string[];
  requiresComment?: boolean;
  autoActions?: Array<{
    condition: 'on_enter' | 'on_exit' | 'after_days';
    action: 'notify' | 'create_ticket' | 'update_field';
    target: string;
    value?: string;
  }>;
}

// Asset Maintenance Schedule Settings
export interface AssetMaintenanceScheduleSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  categoryId?: string; // optional link to category
  type: 'Preventive' | 'Corrective' | 'Predictive';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Custom';
  customFrequencyDays?: number; // for custom frequency
  estimatedDuration: number; // in minutes
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  skillsRequired?: string[];
  partsRequired?: Array<{
    name: string;
    quantity: number;
    estimatedCost: number;
  }>;
  checklist?: Array<{
    task: string;
    required: boolean;
    estimatedMinutes: number;
  }>;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface AssetMaintenanceScheduleSettingExtended extends Omit<AssetMaintenanceScheduleSettingDocument, '_id'> {
  id: string;
  assignedAssetsCount?: number;
}

export interface AssetMaintenanceScheduleSettingCreateInput {
  name: string;
  description?: string;
  categoryId?: string;
  type: 'Preventive' | 'Corrective' | 'Predictive';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Custom';
  customFrequencyDays?: number;
  estimatedDuration: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  skillsRequired?: string[];
  partsRequired?: Array<{
    name: string;
    quantity: number;
    estimatedCost: number;
  }>;
  checklist?: Array<{
    task: string;
    required: boolean;
    estimatedMinutes: number;
  }>;
  isDefault?: boolean;
}

export interface AssetMaintenanceScheduleSettingUpdateInput {
  name?: string;
  description?: string;
  categoryId?: string;
  type?: 'Preventive' | 'Corrective' | 'Predictive';
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Custom';
  customFrequencyDays?: number;
  estimatedDuration?: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  skillsRequired?: string[];
  partsRequired?: Array<{
    name: string;
    quantity: number;
    estimatedCost: number;
  }>;
  checklist?: Array<{
    task: string;
    required: boolean;
    estimatedMinutes: number;
  }>;
  isDefault?: boolean;
  isActive?: boolean;
}

export class AssetSettingsService {
  // Category Settings Methods
  private static async getCategoryCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<AssetCategorySettingDocument>('asset_category_settings');
    } catch (error) {
      console.error('Failed to get category collection:', error);
      throw error;
    }
  }

  private static async getStatusCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<AssetStatusSettingDocument>('asset_status_settings');
    } catch (error) {
      console.error('Failed to get status collection:', error);
      throw error;
    }
  }

  private static async getMaintenanceScheduleCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<AssetMaintenanceScheduleSettingDocument>('asset_maintenance_schedule_settings');
    } catch (error) {
      console.error('Failed to get maintenance schedule collection:', error);
      throw error;
    }
  }

  /**
   * Get all asset categories for an organization
   */
  static async getAllCategories(orgId: string): Promise<AssetCategorySettingExtended[]> {
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
  static async getCategoryById(id: string, orgId: string): Promise<AssetCategorySettingExtended | null> {
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
   * Create new asset category
   */
  static async createCategory(
    orgId: string,
    categoryData: AssetCategorySettingCreateInput,
    createdBy: string
  ): Promise<AssetCategorySettingExtended> {
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
    const document: Omit<AssetCategorySettingDocument, '_id'> = {
      orgId,
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color,
      depreciationRate: categoryData.depreciationRate,
      defaultWarrantyMonths: categoryData.defaultWarrantyMonths,
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
   * Update asset category
   */
  static async updateCategory(
    id: string,
    orgId: string,
    updates: AssetCategorySettingUpdateInput,
    updatedBy: string
  ): Promise<AssetCategorySettingExtended | null> {
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
   * Delete asset category (soft delete)
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
   * Get all asset statuses for an organization
   */
  static async getAllStatuses(orgId: string): Promise<AssetStatusSettingExtended[]> {
    const collection = await this.getStatusCollection();
    
    const statuses = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    return statuses.map(status => this.transformStatusToExtended(status));
  }

  /**
   * Create new asset status
   */
  static async createStatus(
    orgId: string,
    statusData: AssetStatusSettingCreateInput,
    createdBy: string
  ): Promise<AssetStatusSettingExtended> {
    const collection = await this.getStatusCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: statusData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Status with name "${statusData.name}" already exists`);
    }

    // Get next sort order
    const lastStatus = await collection.findOne(
      { orgId, isDeleted: { $ne: true } },
      { sort: { sortOrder: -1 } }
    );
    const nextSortOrder = (lastStatus?.sortOrder || 0) + 1;

    const now = new Date();
    const document: Omit<AssetStatusSettingDocument, '_id'> = {
      orgId,
      name: statusData.name,
      color: statusData.color,
      type: statusData.type,
      isDefault: statusData.isDefault || false,
      isSystem: false,
      sortOrder: statusData.sortOrder || nextSortOrder,
      isActive: true,
      allowedTransitions: statusData.allowedTransitions,
      requiresComment: statusData.requiresComment,
      autoActions: statusData.autoActions,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created status');
    }

    return this.transformStatusToExtended(created);
  }

  /**
   * Update asset status
   */
  static async updateStatus(
    id: string,
    orgId: string,
    updates: AssetStatusSettingUpdateInput,
    updatedBy: string
  ): Promise<AssetStatusSettingExtended | null> {
    const collection = await this.getStatusCollection();
    
    // Check if this is a system status
    const existing = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (existing?.isSystem) {
      throw new Error('Cannot modify system status');
    }

    // Check if name conflicts with another status
    if (updates.name) {
      const nameConflict = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (nameConflict) {
        throw new Error(`Status with name "${updates.name}" already exists`);
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
    return this.transformStatusToExtended(result);
  }

  /**
   * Delete asset status (soft delete)
   */
  static async deleteStatus(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getStatusCollection();
    
    // Check if this is a system status
    const existing = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (existing?.isSystem) {
      throw new Error('Cannot delete system status');
    }

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
   * Get all maintenance schedules for an organization
   */
  static async getAllMaintenanceSchedules(orgId: string): Promise<AssetMaintenanceScheduleSettingExtended[]> {
    const collection = await this.getMaintenanceScheduleCollection();
    
    const schedules = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ name: 1 })
      .toArray();

    return schedules.map(schedule => this.transformMaintenanceScheduleToExtended(schedule));
  }

  /**
   * Create new maintenance schedule
   */
  static async createMaintenanceSchedule(
    orgId: string,
    scheduleData: AssetMaintenanceScheduleSettingCreateInput,
    createdBy: string
  ): Promise<AssetMaintenanceScheduleSettingExtended> {
    const collection = await this.getMaintenanceScheduleCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: scheduleData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Maintenance schedule with name "${scheduleData.name}" already exists`);
    }

    const now = new Date();
    const document: Omit<AssetMaintenanceScheduleSettingDocument, '_id'> = {
      orgId,
      name: scheduleData.name,
      description: scheduleData.description,
      categoryId: scheduleData.categoryId,
      type: scheduleData.type,
      frequency: scheduleData.frequency,
      customFrequencyDays: scheduleData.customFrequencyDays,
      estimatedDuration: scheduleData.estimatedDuration,
      priority: scheduleData.priority,
      skillsRequired: scheduleData.skillsRequired || [],
      partsRequired: scheduleData.partsRequired || [],
      checklist: scheduleData.checklist || [],
      isDefault: scheduleData.isDefault || false,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created maintenance schedule');
    }

    return this.transformMaintenanceScheduleToExtended(created);
  }

  /**
   * Update maintenance schedule
   */
  static async updateMaintenanceSchedule(
    id: string,
    orgId: string,
    updates: AssetMaintenanceScheduleSettingUpdateInput,
    updatedBy: string
  ): Promise<AssetMaintenanceScheduleSettingExtended | null> {
    const collection = await this.getMaintenanceScheduleCollection();
    
    // Check if name conflicts with another schedule
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Maintenance schedule with name "${updates.name}" already exists`);
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
    return this.transformMaintenanceScheduleToExtended(result);
  }

  /**
   * Delete maintenance schedule (soft delete)
   */
  static async deleteMaintenanceSchedule(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getMaintenanceScheduleCollection();
    
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
   * Initialize default asset settings for an organization
   */
  static async initializeDefaults(orgId: string, createdBy: string): Promise<{
    categories: AssetCategorySettingExtended[];
    statuses: AssetStatusSettingExtended[];
    maintenanceSchedules: AssetMaintenanceScheduleSettingExtended[];
  }> {
    const defaultCategories: AssetCategorySettingCreateInput[] = [
      { 
        name: 'Servers', 
        description: 'Physical and virtual servers',
        color: '#3b82f6',
        icon: 'server',
        depreciationRate: 33.33,
        defaultWarrantyMonths: 36,
        isDefault: true,
        sortOrder: 1
      },
      { 
        name: 'Workstations', 
        description: 'Desktop computers and laptops',
        color: '#10b981',
        icon: 'monitor',
        depreciationRate: 25,
        defaultWarrantyMonths: 24,
        sortOrder: 2
      },
      { 
        name: 'Network Equipment', 
        description: 'Switches, routers, and network devices',
        color: '#f97316',
        icon: 'network',
        depreciationRate: 20,
        defaultWarrantyMonths: 60,
        sortOrder: 3
      },
      { 
        name: 'Peripherals', 
        description: 'Printers, scanners, and other peripherals',
        color: '#8b5cf6',
        icon: 'printer',
        depreciationRate: 20,
        defaultWarrantyMonths: 12,
        sortOrder: 4
      },
      { 
        name: 'Mobile Devices', 
        description: 'Smartphones, tablets, and mobile equipment',
        color: '#ef4444',
        icon: 'smartphone',
        depreciationRate: 33.33,
        defaultWarrantyMonths: 12,
        sortOrder: 5
      }
    ];

    const defaultStatuses: AssetStatusSettingCreateInput[] = [
      { name: 'Active', color: '#22c55e', type: 'Active', isDefault: true, sortOrder: 1 },
      { name: 'In Use', color: '#3b82f6', type: 'Active', sortOrder: 2 },
      { name: 'Available', color: '#06b6d4', type: 'Active', sortOrder: 3 },
      { name: 'Under Maintenance', color: '#f97316', type: 'Maintenance', sortOrder: 4 },
      { name: 'Out of Service', color: '#ef4444', type: 'Inactive', sortOrder: 5 },
      { name: 'Retired', color: '#6b7280', type: 'Retired', sortOrder: 6 }
    ];

    const defaultMaintenanceSchedules: AssetMaintenanceScheduleSettingCreateInput[] = [
      {
        name: 'Server Health Check',
        description: 'Monthly server health and performance check',
        type: 'Preventive',
        frequency: 'Monthly',
        estimatedDuration: 60,
        priority: 'Medium',
        isDefault: true,
        checklist: [
          { task: 'Check system logs', required: true, estimatedMinutes: 15 },
          { task: 'Verify backup completion', required: true, estimatedMinutes: 10 },
          { task: 'Check disk space', required: true, estimatedMinutes: 5 },
          { task: 'Review performance metrics', required: true, estimatedMinutes: 20 },
          { task: 'Update security patches', required: false, estimatedMinutes: 30 }
        ]
      },
      {
        name: 'Workstation Maintenance',
        description: 'Quarterly workstation maintenance and updates',
        type: 'Preventive',
        frequency: 'Quarterly',
        estimatedDuration: 90,
        priority: 'Low',
        checklist: [
          { task: 'Clean system physically', required: true, estimatedMinutes: 15 },
          { task: 'Update software', required: true, estimatedMinutes: 30 },
          { task: 'Run antivirus scan', required: true, estimatedMinutes: 20 },
          { task: 'Check hardware health', required: true, estimatedMinutes: 25 }
        ]
      },
      {
        name: 'Network Equipment Check',
        description: 'Monthly network equipment health verification',
        type: 'Preventive',
        frequency: 'Monthly',
        estimatedDuration: 45,
        priority: 'High',
        checklist: [
          { task: 'Check port status', required: true, estimatedMinutes: 10 },
          { task: 'Verify connectivity', required: true, estimatedMinutes: 15 },
          { task: 'Review logs', required: true, estimatedMinutes: 10 },
          { task: 'Update firmware if needed', required: false, estimatedMinutes: 30 }
        ]
      }
    ];

    const createdCategories = [];
    const createdStatuses = [];
    const createdMaintenanceSchedules = [];

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

    // Create default statuses
    for (const statusData of defaultStatuses) {
      try {
        const existing = await this.getStatusCollection().then(col => 
          col.findOne({ orgId, name: statusData.name, isDeleted: { $ne: true } })
        );
        
        if (!existing) {
          const created = await this.createStatus(orgId, statusData, createdBy);
          createdStatuses.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default status ${statusData.name}:`, error);
      }
    }

    // Create default maintenance schedules
    for (const scheduleData of defaultMaintenanceSchedules) {
      try {
        const existing = await this.getMaintenanceScheduleCollection().then(col =>
          col.findOne({ orgId, name: scheduleData.name, isDeleted: { $ne: true } })
        );

        if (!existing) {
          const created = await this.createMaintenanceSchedule(orgId, scheduleData, createdBy);
          createdMaintenanceSchedules.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default maintenance schedule ${scheduleData.name}:`, error);
      }
    }

    return {
      categories: createdCategories,
      statuses: createdStatuses,
      maintenanceSchedules: createdMaintenanceSchedules
    };
  }

  /**
   * Get asset settings statistics
   */
  static async getStats(orgId: string): Promise<{
    totalCategories: number;
    activeCategories: number;
    totalStatuses: number;
    activeStatuses: number;
    totalMaintenanceSchedules: number;
    activeMaintenanceSchedules: number;
  }> {
    const categoryCollection = await this.getCategoryCollection();
    const statusCollection = await this.getStatusCollection();
    const maintenanceScheduleCollection = await this.getMaintenanceScheduleCollection();
    
    const [categoryStats, statusStats, maintenanceScheduleStats] = await Promise.all([
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
      statusCollection.aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]).toArray(),
      maintenanceScheduleCollection.aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]).toArray()
    ]);

    return {
      totalCategories: categoryStats[0]?.total || 0,
      activeCategories: categoryStats[0]?.active || 0,
      totalStatuses: statusStats[0]?.total || 0,
      activeStatuses: statusStats[0]?.active || 0,
      totalMaintenanceSchedules: maintenanceScheduleStats[0]?.total || 0,
      activeMaintenanceSchedules: maintenanceScheduleStats[0]?.active || 0
    };
  }

  /**
   * Private helper methods
   */
  private static transformCategoryToExtended(category: AssetCategorySettingDocument): AssetCategorySettingExtended {
    return {
      id: category._id!.toString(),
      orgId: category.orgId,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      depreciationRate: category.depreciationRate,
      defaultWarrantyMonths: category.defaultWarrantyMonths,
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

  private static transformStatusToExtended(status: AssetStatusSettingDocument): AssetStatusSettingExtended {
    return {
      id: status._id!.toString(),
      orgId: status.orgId,
      name: status.name,
      color: status.color,
      type: status.type,
      isDefault: status.isDefault,
      isSystem: status.isSystem,
      sortOrder: status.sortOrder,
      isActive: status.isActive,
      allowedTransitions: status.allowedTransitions,
      requiresComment: status.requiresComment,
      autoActions: status.autoActions,
      createdBy: status.createdBy,
      updatedBy: status.updatedBy,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
      isDeleted: status.isDeleted,
      deletedAt: status.deletedAt
    };
  }

  private static transformMaintenanceScheduleToExtended(schedule: AssetMaintenanceScheduleSettingDocument): AssetMaintenanceScheduleSettingExtended {
    return {
      id: schedule._id!.toString(),
      orgId: schedule.orgId,
      name: schedule.name,
      description: schedule.description,
      categoryId: schedule.categoryId,
      type: schedule.type,
      frequency: schedule.frequency,
      customFrequencyDays: schedule.customFrequencyDays,
      estimatedDuration: schedule.estimatedDuration,
      priority: schedule.priority,
      skillsRequired: schedule.skillsRequired,
      partsRequired: schedule.partsRequired,
      checklist: schedule.checklist,
      isDefault: schedule.isDefault,
      isActive: schedule.isActive,
      createdBy: schedule.createdBy,
      updatedBy: schedule.updatedBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      isDeleted: schedule.isDeleted,
      deletedAt: schedule.deletedAt
    };
  }
}