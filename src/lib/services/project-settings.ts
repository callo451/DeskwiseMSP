import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Project Status Settings
export interface ProjectStatusSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface ProjectStatusSettingExtended extends Omit<ProjectStatusSettingDocument, '_id'> {
  id: string;
  projectCount?: number;
}

export interface ProjectStatusSettingCreateInput {
  name: string;
  color: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface ProjectStatusSettingUpdateInput {
  name?: string;
  color?: string;
  isDefault?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

// Project Template Settings
export interface ProjectTemplateTaskDocument {
  _id?: ObjectId;
  templateId: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  sortOrder: number;
  assigneeRole?: string;
  dependencies?: string[];
  isRequired: boolean;
}

export interface ProjectTemplateDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description: string;
  category?: string;
  isDefault: boolean;
  isActive: boolean;
  estimatedDuration?: number; // in days
  estimatedBudget?: number;
  tasks: ProjectTemplateTaskDocument[];
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface ProjectTemplateExtended extends Omit<ProjectTemplateDocument, '_id'> {
  id: string;
  taskCount: number;
  usageCount?: number;
}

export interface ProjectTemplateCreateInput {
  name: string;
  description: string;
  category?: string;
  isDefault?: boolean;
  estimatedDuration?: number;
  estimatedBudget?: number;
  tasks?: Array<{
    name: string;
    description?: string;
    estimatedHours?: number;
    assigneeRole?: string;
    isRequired?: boolean;
  }>;
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

export interface ProjectTemplateUpdateInput {
  name?: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  isActive?: boolean;
  estimatedDuration?: number;
  estimatedBudget?: number;
  tasks?: Array<{
    name: string;
    description?: string;
    estimatedHours?: number;
    assigneeRole?: string;
    isRequired?: boolean;
  }>;
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

export class ProjectSettingsService {
  // Status Settings Methods
  private static async getStatusCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ProjectStatusSettingDocument>('project_status_settings');
  }

  private static async getTemplateCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ProjectTemplateDocument>('project_template_settings');
  }

  /**
   * Get all project status settings for an organization
   */
  static async getAllStatuses(orgId: string): Promise<ProjectStatusSettingExtended[]> {
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
   * Get project status by ID
   */
  static async getStatusById(id: string, orgId: string): Promise<ProjectStatusSettingExtended | null> {
    const collection = await this.getStatusCollection();
    
    const status = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!status) return null;
    return this.transformStatusToExtended(status);
  }

  /**
   * Create new project status setting
   */
  static async createStatus(
    orgId: string,
    statusData: ProjectStatusSettingCreateInput,
    createdBy: string
  ): Promise<ProjectStatusSettingExtended> {
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
    const document: Omit<ProjectStatusSettingDocument, '_id'> = {
      orgId,
      name: statusData.name,
      color: statusData.color,
      isDefault: statusData.isDefault || false,
      sortOrder: statusData.sortOrder || nextSortOrder,
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
      throw new Error('Failed to retrieve created status setting');
    }

    return this.transformStatusToExtended(created);
  }

  /**
   * Update project status setting
   */
  static async updateStatus(
    id: string,
    orgId: string,
    updates: ProjectStatusSettingUpdateInput,
    updatedBy: string
  ): Promise<ProjectStatusSettingExtended | null> {
    const collection = await this.getStatusCollection();
    
    // Check if name conflicts with another status
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
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
   * Delete project status setting (soft delete)
   */
  static async deleteStatus(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getStatusCollection();
    
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
   * Get all project templates for an organization
   */
  static async getAllTemplates(orgId: string): Promise<ProjectTemplateExtended[]> {
    const collection = await this.getTemplateCollection();
    
    const templates = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ name: 1 })
      .toArray();

    return templates.map(template => this.transformTemplateToExtended(template));
  }

  /**
   * Get project template by ID
   */
  static async getTemplateById(id: string, orgId: string): Promise<ProjectTemplateExtended | null> {
    const collection = await this.getTemplateCollection();
    
    const template = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!template) return null;
    return this.transformTemplateToExtended(template);
  }

  /**
   * Create new project template
   */
  static async createTemplate(
    orgId: string,
    templateData: ProjectTemplateCreateInput,
    createdBy: string
  ): Promise<ProjectTemplateExtended> {
    const collection = await this.getTemplateCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: templateData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Template with name "${templateData.name}" already exists`);
    }

    const now = new Date();
    const templateId = new ObjectId().toString();
    
    // Process tasks
    const tasks: ProjectTemplateTaskDocument[] = (templateData.tasks || []).map((task, index) => ({
      _id: new ObjectId(),
      templateId,
      name: task.name,
      description: task.description,
      estimatedHours: task.estimatedHours,
      sortOrder: index + 1,
      assigneeRole: task.assigneeRole,
      dependencies: [],
      isRequired: task.isRequired || true
    }));

    const document: Omit<ProjectTemplateDocument, '_id'> = {
      orgId,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      isDefault: templateData.isDefault || false,
      isActive: true,
      estimatedDuration: templateData.estimatedDuration,
      estimatedBudget: templateData.estimatedBudget,
      tasks,
      customFields: templateData.customFields || [],
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created template');
    }

    return this.transformTemplateToExtended(created);
  }

  /**
   * Update project template
   */
  static async updateTemplate(
    id: string,
    orgId: string,
    updates: ProjectTemplateUpdateInput,
    updatedBy: string
  ): Promise<ProjectTemplateExtended | null> {
    const collection = await this.getTemplateCollection();
    
    // Check if name conflicts with another template
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Template with name "${updates.name}" already exists`);
      }
    }

    // Process tasks if provided
    let processedUpdates = { ...updates };
    if (updates.tasks) {
      const tasks: ProjectTemplateTaskDocument[] = updates.tasks.map((task, index) => ({
        _id: new ObjectId(),
        templateId: id,
        name: task.name,
        description: task.description,
        estimatedHours: task.estimatedHours,
        sortOrder: index + 1,
        assigneeRole: task.assigneeRole,
        dependencies: [],
        isRequired: task.isRequired || true
      }));
      processedUpdates = { ...updates, tasks };
    }

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id), 
        orgId, 
        isDeleted: { $ne: true } 
      },
      {
        $set: {
          ...processedUpdates,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    return this.transformTemplateToExtended(result);
  }

  /**
   * Delete project template (soft delete)
   */
  static async deleteTemplate(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getTemplateCollection();
    
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
   * Initialize default project settings for an organization
   */
  static async initializeDefaults(orgId: string, createdBy: string): Promise<{
    statuses: ProjectStatusSettingExtended[];
    templates: ProjectTemplateExtended[];
  }> {
    const defaultStatuses: ProjectStatusSettingCreateInput[] = [
      { name: 'Not Started', color: '#6b7280', sortOrder: 1 },
      { name: 'In Progress', color: '#3b82f6', sortOrder: 2, isDefault: true },
      { name: 'On Hold', color: '#f97316', sortOrder: 3 },
      { name: 'Completed', color: '#22c55e', sortOrder: 4 },
      { name: 'Cancelled', color: '#ef4444', sortOrder: 5 }
    ];

    const defaultTemplates: ProjectTemplateCreateInput[] = [
      {
        name: 'New Client Onboarding',
        description: 'Standard process for onboarding a new client.',
        category: 'Client Management',
        estimatedDuration: 10,
        estimatedBudget: 2500,
        tasks: [
          { name: 'Initial client discovery call', estimatedHours: 2, isRequired: true },
          { name: 'Document current infrastructure', estimatedHours: 4, isRequired: true },
          { name: 'Create service agreements', estimatedHours: 3, isRequired: true },
          { name: 'Setup monitoring and alerts', estimatedHours: 4, isRequired: true },
          { name: 'Client handoff and training', estimatedHours: 2, isRequired: true }
        ]
      },
      {
        name: 'Microsoft 365 Migration',
        description: 'Template for migrating a client to Microsoft 365.',
        category: 'Migrations',
        estimatedDuration: 15,
        estimatedBudget: 5000,
        tasks: [
          { name: 'Pre-migration assessment', estimatedHours: 4, isRequired: true },
          { name: 'Setup M365 tenant', estimatedHours: 2, isRequired: true },
          { name: 'Configure security settings', estimatedHours: 3, isRequired: true },
          { name: 'Migrate user mailboxes', estimatedHours: 8, isRequired: true },
          { name: 'Migrate file shares to SharePoint', estimatedHours: 6, isRequired: true },
          { name: 'User training and documentation', estimatedHours: 4, isRequired: true }
        ]
      },
      {
        name: 'Security Audit',
        description: 'Standard security audit checklist and process.',
        category: 'Security',
        estimatedDuration: 5,
        estimatedBudget: 3000,
        tasks: [
          { name: 'Network security assessment', estimatedHours: 6, isRequired: true },
          { name: 'User access review', estimatedHours: 4, isRequired: true },
          { name: 'Vulnerability scanning', estimatedHours: 4, isRequired: true },
          { name: 'Security policy review', estimatedHours: 3, isRequired: true },
          { name: 'Generate audit report', estimatedHours: 3, isRequired: true }
        ]
      }
    ];

    const createdStatuses = [];
    const createdTemplates = [];

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

    // Create default templates
    for (const templateData of defaultTemplates) {
      try {
        const existing = await this.getTemplateCollection().then(col =>
          col.findOne({ orgId, name: templateData.name, isDeleted: { $ne: true } })
        );

        if (!existing) {
          const created = await this.createTemplate(orgId, templateData, createdBy);
          createdTemplates.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default template ${templateData.name}:`, error);
      }
    }

    return {
      statuses: createdStatuses,
      templates: createdTemplates
    };
  }

  /**
   * Get project settings statistics
   */
  static async getStats(orgId: string): Promise<{
    totalStatuses: number;
    activeStatuses: number;
    totalTemplates: number;
    activeTemplates: number;
    mostUsedTemplate?: string;
  }> {
    const statusCollection = await this.getStatusCollection();
    const templateCollection = await this.getTemplateCollection();
    
    const [statusStats, templateStats] = await Promise.all([
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
      templateCollection.aggregate([
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
      totalStatuses: statusStats[0]?.total || 0,
      activeStatuses: statusStats[0]?.active || 0,
      totalTemplates: templateStats[0]?.total || 0,
      activeTemplates: templateStats[0]?.active || 0
    };
  }

  /**
   * Private helper methods
   */
  private static transformStatusToExtended(status: ProjectStatusSettingDocument): ProjectStatusSettingExtended {
    return {
      id: status._id!.toString(),
      orgId: status.orgId,
      name: status.name,
      color: status.color,
      isDefault: status.isDefault,
      sortOrder: status.sortOrder,
      isActive: status.isActive,
      createdBy: status.createdBy,
      updatedBy: status.updatedBy,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
      isDeleted: status.isDeleted,
      deletedAt: status.deletedAt
    };
  }

  private static transformTemplateToExtended(template: ProjectTemplateDocument): ProjectTemplateExtended {
    return {
      id: template._id!.toString(),
      orgId: template.orgId,
      name: template.name,
      description: template.description,
      category: template.category,
      isDefault: template.isDefault,
      isActive: template.isActive,
      estimatedDuration: template.estimatedDuration,
      estimatedBudget: template.estimatedBudget,
      tasks: template.tasks,
      customFields: template.customFields,
      taskCount: template.tasks.length,
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      isDeleted: template.isDeleted,
      deletedAt: template.deletedAt
    };
  }
}