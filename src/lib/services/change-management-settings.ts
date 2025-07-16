import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Base document interface
export interface ChangeManagementSettingDocument {
  _id?: ObjectId;
  orgId: string;
  type: 'approval_workflow' | 'risk_matrix' | 'change_category';
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Approval Workflow Settings
export interface ApprovalWorkflowSettingDocument extends ChangeManagementSettingDocument {
  type: 'approval_workflow';
  name: string;
  description?: string;
  triggerConditions: {
    riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
    impactLevel?: ('low' | 'medium' | 'high' | 'critical')[];
    changeTypes?: string[];
    businessHours?: boolean;
    emergencyOverride?: boolean;
  };
  approvalSteps: Array<{
    stepNumber: number;
    name: string;
    description?: string;
    requiredApprovers: number;
    approverRoles: string[];
    timeoutHours?: number;
    parallelApproval?: boolean;
    conditionalSkip?: {
      condition: string;
      skipIf: boolean;
    };
  }>;
  escalationRules: {
    timeoutAction: 'auto_approve' | 'auto_reject' | 'escalate';
    escalationPath?: string[];
    notificationFrequency: number; // hours
  };
  isActive: boolean;
  isDefault: boolean;
  priority: number; // Lower number = higher priority
}

// Risk Matrix Settings
export interface RiskMatrixSettingDocument extends ChangeManagementSettingDocument {
  type: 'risk_matrix';
  name: string;
  description?: string;
  riskLevels: Array<{
    level: 'low' | 'medium' | 'high' | 'critical';
    label: string;
    color: string;
    description?: string;
    autoApprovalAllowed: boolean;
    requiredApprovers: number;
    maxDowntime?: number; // minutes
    rollbackRequired: boolean;
    testingRequired: boolean;
    documentationRequired: boolean;
    communicationRequired: boolean;
  }>;
  impactCategories: Array<{
    category: string;
    label: string;
    description?: string;
    weight: number; // For risk calculation
    thresholds: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  }>;
  calculationMethod: 'weighted_average' | 'highest_impact' | 'custom';
  customFormula?: string;
  isActive: boolean;
  isDefault: boolean;
}

// Change Category Settings
export interface ChangeCategorySettingDocument extends ChangeManagementSettingDocument {
  type: 'change_category';
  name: string;
  description?: string;
  color: string;
  icon: string;
  defaultRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  defaultImpactLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  requiresTesting: boolean;
  requiresRollback: boolean;
  requiresDocumentation: boolean;
  requiresCommunication: boolean;
  defaultMaintenanceWindow: {
    duration: number; // minutes
    preferredTimes: string[]; // e.g., ['00:00', '02:00']
    blackoutPeriods?: Array<{
      start: string;
      end: string;
      reason: string;
    }>;
  };
  approvalWorkflow?: string; // Reference to approval workflow
  notifications: {
    stakeholders: string[];
    channels: ('email' | 'sms' | 'slack' | 'teams')[];
    timing: ('created' | 'approved' | 'rejected' | 'implemented' | 'completed')[];
  };
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

// Extended interfaces for frontend
export interface ApprovalWorkflowSettingExtended extends Omit<ApprovalWorkflowSettingDocument, '_id'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskMatrixSettingExtended extends Omit<RiskMatrixSettingDocument, '_id'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeCategorySettingExtended extends Omit<ChangeCategorySettingDocument, '_id'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Statistics interface
export interface ChangeManagementSettingsStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalRiskMatrices: number;
  activeRiskMatrices: number;
  totalCategories: number;
  activeCategories: number;
  avgApprovalSteps: number;
  avgApprovalTime: number; // hours
  automatedApprovalRate: number; // percentage
  mostUsedCategory: string;
  highestRiskLevel: string;
}

export class ChangeManagementSettingsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ChangeManagementSettingDocument>('change_management_settings');
  }

  // Approval Workflow Methods
  static async getAllWorkflows(orgId: string): Promise<ApprovalWorkflowSettingExtended[]> {
    const collection = await this.getCollection();
    
    const workflows = await collection
      .find({ orgId, type: 'approval_workflow' })
      .sort({ priority: 1, name: 1 })
      .toArray();

    return workflows.map(workflow => {
      const wf = workflow as ApprovalWorkflowSettingDocument;
      return {
        id: workflow._id!.toString(),
        orgId: workflow.orgId,
        type: 'approval_workflow' as const,
        name: wf.name,
        description: wf.description,
        triggerConditions: wf.triggerConditions,
        approvalSteps: wf.approvalSteps,
        escalationRules: wf.escalationRules,
        isActive: wf.isActive,
        isDefault: wf.isDefault,
        priority: wf.priority,
        createdBy: workflow.createdBy,
        updatedBy: workflow.updatedBy,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      };
    });
  }

  static async createWorkflow(
    orgId: string,
    workflowData: Omit<ApprovalWorkflowSettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ApprovalWorkflowSettingExtended> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<ApprovalWorkflowSettingDocument, '_id'> = {
      orgId,
      type: 'approval_workflow',
      ...workflowData,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      ...document
    };
  }

  static async updateWorkflow(
    id: string,
    orgId: string,
    updates: Partial<Omit<ApprovalWorkflowSettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'createdAt'>>,
    updatedBy: string
  ): Promise<ApprovalWorkflowSettingExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, type: 'approval_workflow' },
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

    const wf = result as ApprovalWorkflowSettingDocument;
    return {
      id: result._id!.toString(),
      orgId: result.orgId,
      type: 'approval_workflow' as const,
      name: wf.name,
      description: wf.description,
      triggerConditions: wf.triggerConditions,
      approvalSteps: wf.approvalSteps,
      escalationRules: wf.escalationRules,
      isActive: wf.isActive,
      isDefault: wf.isDefault,
      priority: wf.priority,
      createdBy: result.createdBy,
      updatedBy: result.updatedBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  static async deleteWorkflow(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId,
      type: 'approval_workflow'
    });

    return result.deletedCount > 0;
  }

  // Risk Matrix Methods
  static async getAllRiskMatrices(orgId: string): Promise<RiskMatrixSettingExtended[]> {
    const collection = await this.getCollection();
    
    const matrices = await collection
      .find({ orgId, type: 'risk_matrix' })
      .sort({ name: 1 })
      .toArray();

    return matrices.map(matrix => {
      const rm = matrix as RiskMatrixSettingDocument;
      return {
        id: matrix._id!.toString(),
        orgId: matrix.orgId,
        type: 'risk_matrix' as const,
        name: rm.name,
        description: rm.description,
        riskLevels: rm.riskLevels,
        impactCategories: rm.impactCategories,
        calculationMethod: rm.calculationMethod,
        customFormula: rm.customFormula,
        isActive: rm.isActive,
        isDefault: rm.isDefault,
        createdBy: matrix.createdBy,
        updatedBy: matrix.updatedBy,
        createdAt: matrix.createdAt,
        updatedAt: matrix.updatedAt
      };
    });
  }

  static async createRiskMatrix(
    orgId: string,
    matrixData: Omit<RiskMatrixSettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<RiskMatrixSettingExtended> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<RiskMatrixSettingDocument, '_id'> = {
      orgId,
      type: 'risk_matrix',
      ...matrixData,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      ...document
    };
  }

  static async updateRiskMatrix(
    id: string,
    orgId: string,
    updates: Partial<Omit<RiskMatrixSettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'createdAt'>>,
    updatedBy: string
  ): Promise<RiskMatrixSettingExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, type: 'risk_matrix' },
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

    const rm = result as RiskMatrixSettingDocument;
    return {
      id: result._id!.toString(),
      orgId: result.orgId,
      type: 'risk_matrix' as const,
      name: rm.name,
      description: rm.description,
      riskLevels: rm.riskLevels,
      impactCategories: rm.impactCategories,
      calculationMethod: rm.calculationMethod,
      customFormula: rm.customFormula,
      isActive: rm.isActive,
      isDefault: rm.isDefault,
      createdBy: result.createdBy,
      updatedBy: result.updatedBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  static async deleteRiskMatrix(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId,
      type: 'risk_matrix'
    });

    return result.deletedCount > 0;
  }

  // Change Category Methods
  static async getAllCategories(orgId: string): Promise<ChangeCategorySettingExtended[]> {
    const collection = await this.getCollection();
    
    const categories = await collection
      .find({ orgId, type: 'change_category' })
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    return categories.map(category => {
      const cat = category as ChangeCategorySettingDocument;
      return {
        id: category._id!.toString(),
        orgId: category.orgId,
        type: 'change_category' as const,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        defaultRiskLevel: cat.defaultRiskLevel,
        defaultImpactLevel: cat.defaultImpactLevel,
        requiresApproval: cat.requiresApproval,
        requiresTesting: cat.requiresTesting,
        requiresRollback: cat.requiresRollback,
        requiresDocumentation: cat.requiresDocumentation,
        requiresCommunication: cat.requiresCommunication,
        defaultMaintenanceWindow: cat.defaultMaintenanceWindow,
        approvalWorkflow: cat.approvalWorkflow,
        notifications: cat.notifications,
        isActive: cat.isActive,
        isDefault: cat.isDefault,
        sortOrder: cat.sortOrder,
        createdBy: category.createdBy,
        updatedBy: category.updatedBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
    });
  }

  static async createCategory(
    orgId: string,
    categoryData: Omit<ChangeCategorySettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ChangeCategorySettingExtended> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<ChangeCategorySettingDocument, '_id'> = {
      orgId,
      type: 'change_category',
      ...categoryData,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      ...document
    };
  }

  static async updateCategory(
    id: string,
    orgId: string,
    updates: Partial<Omit<ChangeCategorySettingDocument, '_id' | 'orgId' | 'type' | 'createdBy' | 'createdAt'>>,
    updatedBy: string
  ): Promise<ChangeCategorySettingExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId, type: 'change_category' },
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

    const cat = result as ChangeCategorySettingDocument;
    return {
      id: result._id!.toString(),
      orgId: result.orgId,
      type: 'change_category' as const,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      defaultRiskLevel: cat.defaultRiskLevel,
      defaultImpactLevel: cat.defaultImpactLevel,
      requiresApproval: cat.requiresApproval,
      requiresTesting: cat.requiresTesting,
      requiresRollback: cat.requiresRollback,
      requiresDocumentation: cat.requiresDocumentation,
      requiresCommunication: cat.requiresCommunication,
      defaultMaintenanceWindow: cat.defaultMaintenanceWindow,
      approvalWorkflow: cat.approvalWorkflow,
      notifications: cat.notifications,
      isActive: cat.isActive,
      isDefault: cat.isDefault,
      sortOrder: cat.sortOrder,
      createdBy: result.createdBy,
      updatedBy: result.updatedBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  static async deleteCategory(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId,
      type: 'change_category'
    });

    return result.deletedCount > 0;
  }

  // Utility Methods
  static async getStats(orgId: string): Promise<ChangeManagementSettingsStats> {
    const collection = await this.getCollection();
    
    const [workflowStats, riskMatrixStats, categoryStats] = await Promise.all([
      collection.aggregate([
        { $match: { orgId, type: 'approval_workflow' } },
        {
          $group: {
            _id: null,
            totalWorkflows: { $sum: 1 },
            activeWorkflows: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            avgApprovalSteps: { $avg: { $size: '$approvalSteps' } }
          }
        }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId, type: 'risk_matrix' } },
        {
          $group: {
            _id: null,
            totalRiskMatrices: { $sum: 1 },
            activeRiskMatrices: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
          }
        }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId, type: 'change_category' } },
        {
          $group: {
            _id: null,
            totalCategories: { $sum: 1 },
            activeCategories: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
          }
        }
      ]).toArray()
    ]);

    return {
      totalWorkflows: workflowStats[0]?.totalWorkflows || 0,
      activeWorkflows: workflowStats[0]?.activeWorkflows || 0,
      totalRiskMatrices: riskMatrixStats[0]?.totalRiskMatrices || 0,
      activeRiskMatrices: riskMatrixStats[0]?.activeRiskMatrices || 0,
      totalCategories: categoryStats[0]?.totalCategories || 0,
      activeCategories: categoryStats[0]?.activeCategories || 0,
      avgApprovalSteps: Math.round(workflowStats[0]?.avgApprovalSteps || 0),
      avgApprovalTime: 24, // TODO: Calculate from actual data
      automatedApprovalRate: 15, // TODO: Calculate from actual data
      mostUsedCategory: 'Infrastructure', // TODO: Calculate from actual data
      highestRiskLevel: 'Medium' // TODO: Calculate from actual data
    };
  }

  // Initialize default settings
  static async initializeDefaults(orgId: string, createdBy: string): Promise<{
    workflows: ApprovalWorkflowSettingExtended[];
    riskMatrices: RiskMatrixSettingExtended[];
    categories: ChangeCategorySettingExtended[];
  }> {
    const collection = await this.getCollection();
    
    // Check if defaults already exist
    const existingCount = await collection.countDocuments({ orgId });
    if (existingCount > 0) {
      throw new Error('Default change management settings already exist for this organization');
    }

    const now = new Date();
    const defaultDocuments: Omit<ChangeManagementSettingDocument, '_id'>[] = [];

    // Default Risk Matrix
    const defaultRiskMatrix: Omit<RiskMatrixSettingDocument, '_id'> = {
      orgId,
      type: 'risk_matrix',
      name: 'Standard Risk Matrix',
      description: 'Default risk assessment matrix for change management',
      riskLevels: [
        {
          level: 'low',
          label: 'Low Risk',
          color: '#10b981',
          description: 'Minimal impact, low likelihood of issues',
          autoApprovalAllowed: true,
          requiredApprovers: 1,
          maxDowntime: 30,
          rollbackRequired: false,
          testingRequired: false,
          documentationRequired: true,
          communicationRequired: false
        },
        {
          level: 'medium',
          label: 'Medium Risk',
          color: '#f59e0b',
          description: 'Moderate impact, some likelihood of issues',
          autoApprovalAllowed: false,
          requiredApprovers: 2,
          maxDowntime: 120,
          rollbackRequired: true,
          testingRequired: true,
          documentationRequired: true,
          communicationRequired: true
        },
        {
          level: 'high',
          label: 'High Risk',
          color: '#ef4444',
          description: 'Significant impact, high likelihood of issues',
          autoApprovalAllowed: false,
          requiredApprovers: 3,
          maxDowntime: 240,
          rollbackRequired: true,
          testingRequired: true,
          documentationRequired: true,
          communicationRequired: true
        },
        {
          level: 'critical',
          label: 'Critical Risk',
          color: '#dc2626',
          description: 'Severe impact, very high likelihood of issues',
          autoApprovalAllowed: false,
          requiredApprovers: 4,
          rollbackRequired: true,
          testingRequired: true,
          documentationRequired: true,
          communicationRequired: true
        }
      ],
      impactCategories: [
        {
          category: 'business_impact',
          label: 'Business Impact',
          description: 'Effect on business operations and revenue',
          weight: 0.4,
          thresholds: { low: 25, medium: 50, high: 75, critical: 100 }
        },
        {
          category: 'technical_complexity',
          label: 'Technical Complexity',
          description: 'Complexity of the technical implementation',
          weight: 0.3,
          thresholds: { low: 25, medium: 50, high: 75, critical: 100 }
        },
        {
          category: 'user_impact',
          label: 'User Impact',
          description: 'Impact on end users and customer experience',
          weight: 0.2,
          thresholds: { low: 25, medium: 50, high: 75, critical: 100 }
        },
        {
          category: 'regulatory_compliance',
          label: 'Regulatory Compliance',
          description: 'Impact on regulatory compliance and audit requirements',
          weight: 0.1,
          thresholds: { low: 25, medium: 50, high: 75, critical: 100 }
        }
      ],
      calculationMethod: 'weighted_average',
      isActive: true,
      isDefault: true,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    };

    // Default Approval Workflows
    const defaultWorkflows: Omit<ApprovalWorkflowSettingDocument, '_id'>[] = [
      {
        orgId,
        type: 'approval_workflow',
        name: 'Standard Approval Workflow',
        description: 'Default approval workflow for most change requests',
        triggerConditions: {
          riskLevel: ['medium', 'high'],
          impactLevel: ['medium', 'high'],
          businessHours: false,
          emergencyOverride: false
        },
        approvalSteps: [
          {
            stepNumber: 1,
            name: 'Technical Review',
            description: 'Technical team reviews implementation plan',
            requiredApprovers: 1,
            approverRoles: ['Technical Lead', 'Senior Engineer'],
            timeoutHours: 24,
            parallelApproval: false
          },
          {
            stepNumber: 2,
            name: 'Management Approval',
            description: 'Management approval for resource allocation',
            requiredApprovers: 1,
            approverRoles: ['Manager', 'Director'],
            timeoutHours: 48,
            parallelApproval: false
          }
        ],
        escalationRules: {
          timeoutAction: 'escalate',
          escalationPath: ['Director', 'CTO'],
          notificationFrequency: 8
        },
        isActive: true,
        isDefault: true,
        priority: 1,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      },
      {
        orgId,
        type: 'approval_workflow',
        name: 'Emergency Change Workflow',
        description: 'Fast-track approval for emergency changes',
        triggerConditions: {
          riskLevel: ['critical'],
          impactLevel: ['critical'],
          businessHours: false,
          emergencyOverride: true
        },
        approvalSteps: [
          {
            stepNumber: 1,
            name: 'Emergency Approval',
            description: 'Emergency approval by senior staff',
            requiredApprovers: 1,
            approverRoles: ['Director', 'CTO', 'VP Engineering'],
            timeoutHours: 2,
            parallelApproval: true
          }
        ],
        escalationRules: {
          timeoutAction: 'auto_approve',
          notificationFrequency: 1
        },
        isActive: true,
        isDefault: false,
        priority: 0,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      }
    ];

    // Default Change Categories
    const defaultCategories: Omit<ChangeCategorySettingDocument, '_id'>[] = [
      {
        orgId,
        type: 'change_category',
        name: 'Infrastructure',
        description: 'Changes to infrastructure components and systems',
        color: '#3b82f6',
        icon: 'server',
        defaultRiskLevel: 'medium',
        defaultImpactLevel: 'medium',
        requiresApproval: true,
        requiresTesting: true,
        requiresRollback: true,
        requiresDocumentation: true,
        requiresCommunication: true,
        defaultMaintenanceWindow: {
          duration: 120,
          preferredTimes: ['02:00', '03:00', '04:00'],
          blackoutPeriods: [
            { start: '08:00', end: '18:00', reason: 'Business hours' },
            { start: '12:00', end: '13:00', reason: 'Lunch break' }
          ]
        },
        notifications: {
          stakeholders: ['IT Team', 'Operations'],
          channels: ['email', 'slack'],
          timing: ['created', 'approved', 'implemented', 'completed']
        },
        isActive: true,
        isDefault: true,
        sortOrder: 1,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      },
      {
        orgId,
        type: 'change_category',
        name: 'Application',
        description: 'Changes to application software and configurations',
        color: '#10b981',
        icon: 'code',
        defaultRiskLevel: 'medium',
        defaultImpactLevel: 'medium',
        requiresApproval: true,
        requiresTesting: true,
        requiresRollback: true,
        requiresDocumentation: true,
        requiresCommunication: true,
        defaultMaintenanceWindow: {
          duration: 60,
          preferredTimes: ['01:00', '02:00', '03:00']
        },
        notifications: {
          stakeholders: ['Development Team', 'QA Team'],
          channels: ['email', 'slack'],
          timing: ['created', 'approved', 'implemented']
        },
        isActive: true,
        isDefault: false,
        sortOrder: 2,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      },
      {
        orgId,
        type: 'change_category',
        name: 'Security',
        description: 'Security-related changes and updates',
        color: '#ef4444',
        icon: 'shield',
        defaultRiskLevel: 'high',
        defaultImpactLevel: 'high',
        requiresApproval: true,
        requiresTesting: true,
        requiresRollback: true,
        requiresDocumentation: true,
        requiresCommunication: true,
        defaultMaintenanceWindow: {
          duration: 180,
          preferredTimes: ['00:00', '01:00', '02:00']
        },
        notifications: {
          stakeholders: ['Security Team', 'Compliance Team'],
          channels: ['email', 'sms'],
          timing: ['created', 'approved', 'rejected', 'implemented', 'completed']
        },
        isActive: true,
        isDefault: false,
        sortOrder: 3,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      },
      {
        orgId,
        type: 'change_category',
        name: 'Emergency',
        description: 'Emergency changes requiring immediate implementation',
        color: '#dc2626',
        icon: 'alert-triangle',
        defaultRiskLevel: 'critical',
        defaultImpactLevel: 'critical',
        requiresApproval: true,
        requiresTesting: false,
        requiresRollback: true,
        requiresDocumentation: true,
        requiresCommunication: true,
        defaultMaintenanceWindow: {
          duration: 240,
          preferredTimes: [] // Can be implemented anytime
        },
        notifications: {
          stakeholders: ['All Teams', 'Management'],
          channels: ['email', 'sms', 'slack'],
          timing: ['created', 'approved', 'implemented', 'completed']
        },
        isActive: true,
        isDefault: false,
        sortOrder: 4,
        createdBy,
        updatedBy: createdBy,
        createdAt: now,
        updatedAt: now
      }
    ];

    // Insert all default documents
    defaultDocuments.push(defaultRiskMatrix, ...defaultWorkflows, ...defaultCategories);
    const result = await collection.insertMany(defaultDocuments);

    // Return the created documents
    return {
      workflows: defaultWorkflows.map((doc, index) => ({
        id: result.insertedIds[index + 1].toString(), // Skip risk matrix
        ...doc
      })) as ApprovalWorkflowSettingExtended[],
      riskMatrices: [{
        id: result.insertedIds[0].toString(),
        ...defaultRiskMatrix
      }] as RiskMatrixSettingExtended[],
      categories: defaultCategories.map((doc, index) => ({
        id: result.insertedIds[index + 3].toString(), // Skip risk matrix + workflows
        ...doc
      })) as ChangeCategorySettingExtended[]
    };
  }

  // Integration methods for change management module
  static async getCategoriesForChangeCreation(orgId: string): Promise<Array<{
    id: string;
    name: string;
    color: string;
    defaultRiskLevel: string;
    defaultImpactLevel: string;
    requiresApproval: boolean;
    requiresTesting: boolean;
    requiresRollback: boolean;
    requiresDocumentation: boolean;
    requiresCommunication: boolean;
    defaultMaintenanceWindow: {
      duration: number;
      preferredTimes: string[];
    };
  }>> {
    const categories = await this.getAllCategories(orgId);
    return categories.filter(cat => cat.isActive).map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      defaultRiskLevel: cat.defaultRiskLevel,
      defaultImpactLevel: cat.defaultImpactLevel,
      requiresApproval: cat.requiresApproval,
      requiresTesting: cat.requiresTesting,
      requiresRollback: cat.requiresRollback,
      requiresDocumentation: cat.requiresDocumentation,
      requiresCommunication: cat.requiresCommunication,
      defaultMaintenanceWindow: cat.defaultMaintenanceWindow
    }));
  }

  static async getWorkflowsForChangeCreation(orgId: string): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    triggerConditions: any;
    approvalSteps: any[];
  }>> {
    const workflows = await this.getAllWorkflows(orgId);
    return workflows.filter(wf => wf.isActive).map(wf => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      triggerConditions: wf.triggerConditions,
      approvalSteps: wf.approvalSteps
    }));
  }

  static async getRiskMatrixForChangeCreation(orgId: string): Promise<{
    id: string;
    name: string;
    riskLevels: any[];
    impactCategories: any[];
    calculationMethod: string;
  } | null> {
    const matrices = await this.getAllRiskMatrices(orgId);
    const defaultMatrix = matrices.find(matrix => matrix.isDefault && matrix.isActive);
    
    if (!defaultMatrix) return null;

    return {
      id: defaultMatrix.id,
      name: defaultMatrix.name,
      riskLevels: defaultMatrix.riskLevels,
      impactCategories: defaultMatrix.impactCategories,
      calculationMethod: defaultMatrix.calculationMethod
    };
  }
}