import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Ticket Queue Settings
export interface TicketQueueSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description?: string;
  defaultAssignee?: string; // user ID
  autoAssignmentRules?: Array<{
    condition: 'client' | 'keyword' | 'priority';
    value: string;
    assignTo: string; // user ID
  }>;
  emailAddress?: string; // for email-to-ticket
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

export interface TicketQueueSettingExtended extends Omit<TicketQueueSettingDocument, '_id'> {
  id: string;
  ticketCount?: number;
}

export interface TicketQueueSettingCreateInput {
  name: string;
  description?: string;
  defaultAssignee?: string;
  autoAssignmentRules?: Array<{
    condition: 'client' | 'keyword' | 'priority';
    value: string;
    assignTo: string;
  }>;
  emailAddress?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface TicketQueueSettingUpdateInput {
  name?: string;
  description?: string;
  defaultAssignee?: string;
  autoAssignmentRules?: Array<{
    condition: 'client' | 'keyword' | 'priority';
    value: string;
    assignTo: string;
  }>;
  emailAddress?: string;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// Ticket Status Settings
export interface TicketStatusSettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  color: string;
  type: 'Open' | 'Closed' | 'Pending';
  isDefault: boolean;
  isSystem: boolean; // cannot be deleted
  sortOrder: number;
  isActive: boolean;
  allowedTransitions?: string[]; // status IDs this can transition to
  requiresComment?: boolean;
  autoCloseAfterDays?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface TicketStatusSettingExtended extends Omit<TicketStatusSettingDocument, '_id'> {
  id: string;
  ticketCount?: number;
}

export interface TicketStatusSettingCreateInput {
  name: string;
  color: string;
  type: 'Open' | 'Closed' | 'Pending';
  isDefault?: boolean;
  sortOrder?: number;
  allowedTransitions?: string[];
  requiresComment?: boolean;
  autoCloseAfterDays?: number;
}

export interface TicketStatusSettingUpdateInput {
  name?: string;
  color?: string;
  type?: 'Open' | 'Closed' | 'Pending';
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  allowedTransitions?: string[];
  requiresComment?: boolean;
  autoCloseAfterDays?: number;
}

// Ticket Priority Settings
export interface TicketPrioritySettingDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  color: string;
  level: number; // 1 = Low, 2 = Medium, 3 = High, 4 = Critical
  responseSlaMinutes: number;
  resolutionSlaMinutes: number;
  escalationRules?: Array<{
    afterMinutes: number;
    action: 'notify' | 'reassign' | 'escalate';
    target: string; // user ID or queue ID
  }>;
  isDefault: boolean;
  isSystem: boolean; // cannot be deleted
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface TicketPrioritySettingExtended extends Omit<TicketPrioritySettingDocument, '_id'> {
  id: string;
  ticketCount?: number;
  responseSla: string; // formatted string like "4 hours"
  resolutionSla: string; // formatted string like "24 hours"
}

export interface TicketPrioritySettingCreateInput {
  name: string;
  color: string;
  level: number;
  responseSlaMinutes: number;
  resolutionSlaMinutes: number;
  escalationRules?: Array<{
    afterMinutes: number;
    action: 'notify' | 'reassign' | 'escalate';
    target: string;
  }>;
  isDefault?: boolean;
}

export interface TicketPrioritySettingUpdateInput {
  name?: string;
  color?: string;
  level?: number;
  responseSlaMinutes?: number;
  resolutionSlaMinutes?: number;
  escalationRules?: Array<{
    afterMinutes: number;
    action: 'notify' | 'reassign' | 'escalate';
    target: string;
  }>;
  isDefault?: boolean;
  isActive?: boolean;
}

export class TicketSettingsService {
  // Queue Settings Methods
  private static async getQueueCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<TicketQueueSettingDocument>('ticket_queue_settings');
    } catch (error) {
      console.error('Failed to get queue collection:', error);
      throw error;
    }
  }

  private static async getStatusCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<TicketStatusSettingDocument>('ticket_status_settings');
    } catch (error) {
      console.error('Failed to get status collection:', error);
      throw error;
    }
  }

  private static async getPriorityCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('deskwise');
      return db.collection<TicketPrioritySettingDocument>('ticket_priority_settings');
    } catch (error) {
      console.error('Failed to get priority collection:', error);
      throw error;
    }
  }

  /**
   * Get all ticket queues for an organization
   */
  static async getAllQueues(orgId: string): Promise<TicketQueueSettingExtended[]> {
    const collection = await this.getQueueCollection();
    
    const queues = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    return queues.map(queue => this.transformQueueToExtended(queue));
  }

  /**
   * Get queue by ID
   */
  static async getQueueById(id: string, orgId: string): Promise<TicketQueueSettingExtended | null> {
    const collection = await this.getQueueCollection();
    
    const queue = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (!queue) return null;
    return this.transformQueueToExtended(queue);
  }

  /**
   * Create new ticket queue
   */
  static async createQueue(
    orgId: string,
    queueData: TicketQueueSettingCreateInput,
    createdBy: string
  ): Promise<TicketQueueSettingExtended> {
    const collection = await this.getQueueCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: queueData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Queue with name "${queueData.name}" already exists`);
    }

    // Get next sort order
    const lastQueue = await collection.findOne(
      { orgId, isDeleted: { $ne: true } },
      { sort: { sortOrder: -1 } }
    );
    const nextSortOrder = (lastQueue?.sortOrder || 0) + 1;

    const now = new Date();
    const document: Omit<TicketQueueSettingDocument, '_id'> = {
      orgId,
      name: queueData.name,
      description: queueData.description,
      defaultAssignee: queueData.defaultAssignee,
      autoAssignmentRules: queueData.autoAssignmentRules || [],
      emailAddress: queueData.emailAddress,
      isDefault: queueData.isDefault || false,
      isActive: true,
      sortOrder: queueData.sortOrder || nextSortOrder,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    const result = await collection.insertOne(document);
    
    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to retrieve created queue');
    }

    return this.transformQueueToExtended(created);
  }

  /**
   * Update ticket queue
   */
  static async updateQueue(
    id: string,
    orgId: string,
    updates: TicketQueueSettingUpdateInput,
    updatedBy: string
  ): Promise<TicketQueueSettingExtended | null> {
    const collection = await this.getQueueCollection();
    
    // Check if name conflicts with another queue
    if (updates.name) {
      const existing = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (existing) {
        throw new Error(`Queue with name "${updates.name}" already exists`);
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
    return this.transformQueueToExtended(result);
  }

  /**
   * Delete ticket queue (soft delete)
   */
  static async deleteQueue(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getQueueCollection();
    
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
   * Get all ticket statuses for an organization
   */
  static async getAllStatuses(orgId: string): Promise<TicketStatusSettingExtended[]> {
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
   * Create new ticket status
   */
  static async createStatus(
    orgId: string,
    statusData: TicketStatusSettingCreateInput,
    createdBy: string
  ): Promise<TicketStatusSettingExtended> {
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
    const document: Omit<TicketStatusSettingDocument, '_id'> = {
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
      autoCloseAfterDays: statusData.autoCloseAfterDays,
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
   * Update ticket status
   */
  static async updateStatus(
    id: string,
    orgId: string,
    updates: TicketStatusSettingUpdateInput,
    updatedBy: string
  ): Promise<TicketStatusSettingExtended | null> {
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
   * Delete ticket status (soft delete)
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
   * Get all ticket priorities for an organization
   */
  static async getAllPriorities(orgId: string): Promise<TicketPrioritySettingExtended[]> {
    const collection = await this.getPriorityCollection();
    
    const priorities = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ level: 1 })
      .toArray();

    return priorities.map(priority => this.transformPriorityToExtended(priority));
  }

  /**
   * Create new ticket priority
   */
  static async createPriority(
    orgId: string,
    priorityData: TicketPrioritySettingCreateInput,
    createdBy: string
  ): Promise<TicketPrioritySettingExtended> {
    const collection = await this.getPriorityCollection();
    
    // Check if name already exists
    const existing = await collection.findOne({
      orgId,
      name: priorityData.name,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Priority with name "${priorityData.name}" already exists`);
    }

    // Check if level already exists
    const levelExists = await collection.findOne({
      orgId,
      level: priorityData.level,
      isDeleted: { $ne: true }
    });

    if (levelExists) {
      throw new Error(`Priority level ${priorityData.level} already exists`);
    }

    const now = new Date();
    const document: Omit<TicketPrioritySettingDocument, '_id'> = {
      orgId,
      name: priorityData.name,
      color: priorityData.color,
      level: priorityData.level,
      responseSlaMinutes: priorityData.responseSlaMinutes,
      resolutionSlaMinutes: priorityData.resolutionSlaMinutes,
      escalationRules: priorityData.escalationRules || [],
      isDefault: priorityData.isDefault || false,
      isSystem: false,
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
      throw new Error('Failed to retrieve created priority');
    }

    return this.transformPriorityToExtended(created);
  }

  /**
   * Update ticket priority
   */
  static async updatePriority(
    id: string,
    orgId: string,
    updates: TicketPrioritySettingUpdateInput,
    updatedBy: string
  ): Promise<TicketPrioritySettingExtended | null> {
    const collection = await this.getPriorityCollection();
    
    // Check if this is a system priority
    const existing = await collection.findOne({
      _id: new ObjectId(id),
      orgId,
      isDeleted: { $ne: true }
    });

    if (existing?.isSystem) {
      throw new Error('Cannot modify system priority');
    }

    // Check if name conflicts with another priority
    if (updates.name) {
      const nameConflict = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        name: updates.name,
        isDeleted: { $ne: true }
      });

      if (nameConflict) {
        throw new Error(`Priority with name "${updates.name}" already exists`);
      }
    }

    // Check if level conflicts with another priority
    if (updates.level) {
      const levelConflict = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        orgId,
        level: updates.level,
        isDeleted: { $ne: true }
      });

      if (levelConflict) {
        throw new Error(`Priority level ${updates.level} already exists`);
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
    return this.transformPriorityToExtended(result);
  }

  /**
   * Delete ticket priority (soft delete)
   */
  static async deletePriority(id: string, orgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getPriorityCollection();
    
    // Check if this is a system priority
    const existing = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (existing?.isSystem) {
      throw new Error('Cannot delete system priority');
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
   * Initialize default ticket settings for an organization
   */
  static async initializeDefaults(orgId: string, createdBy: string): Promise<{
    queues: TicketQueueSettingExtended[];
    statuses: TicketStatusSettingExtended[];
    priorities: TicketPrioritySettingExtended[];
  }> {
    const defaultQueues: TicketQueueSettingCreateInput[] = [
      { name: 'Tier 1 Support', description: 'General support requests', isDefault: true, sortOrder: 1 },
      { name: 'Network Ops', description: 'Network and infrastructure issues', sortOrder: 2 },
      { name: 'Billing', description: 'Billing and account issues', sortOrder: 3 },
      { name: 'Unassigned', description: 'Tickets awaiting assignment', sortOrder: 4 }
    ];

    const defaultStatuses: TicketStatusSettingCreateInput[] = [
      { name: 'Open', color: '#3b82f6', type: 'Open', isDefault: true, sortOrder: 1 },
      { name: 'In Progress', color: '#f97316', type: 'Open', sortOrder: 2 },
      { name: 'On Hold', color: '#a855f7', type: 'Pending', sortOrder: 3 },
      { name: 'Resolved', color: '#22c55e', type: 'Closed', sortOrder: 4 },
      { name: 'Closed', color: '#6b7280', type: 'Closed', sortOrder: 5 }
    ];

    const defaultPriorities: TicketPrioritySettingCreateInput[] = [
      { 
        name: 'Low', 
        color: '#6b7280', 
        level: 1, 
        responseSlaMinutes: 24 * 60, // 24 hours
        resolutionSlaMinutes: 5 * 24 * 60 // 5 days
      },
      { 
        name: 'Medium', 
        color: '#3b82f6', 
        level: 2, 
        responseSlaMinutes: 8 * 60, // 8 hours
        resolutionSlaMinutes: 3 * 24 * 60, // 3 days
        isDefault: true
      },
      { 
        name: 'High', 
        color: '#f97316', 
        level: 3, 
        responseSlaMinutes: 4 * 60, // 4 hours
        resolutionSlaMinutes: 24 * 60 // 24 hours
      },
      { 
        name: 'Critical', 
        color: '#ef4444', 
        level: 4, 
        responseSlaMinutes: 60, // 1 hour
        resolutionSlaMinutes: 8 * 60 // 8 hours
      }
    ];

    const createdQueues = [];
    const createdStatuses = [];
    const createdPriorities = [];

    // Create default queues
    for (const queueData of defaultQueues) {
      try {
        const existing = await this.getQueueCollection().then(col => 
          col.findOne({ orgId, name: queueData.name, isDeleted: { $ne: true } })
        );
        
        if (!existing) {
          const created = await this.createQueue(orgId, queueData, createdBy);
          createdQueues.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default queue ${queueData.name}:`, error);
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

    // Create default priorities
    for (const priorityData of defaultPriorities) {
      try {
        const existing = await this.getPriorityCollection().then(col =>
          col.findOne({ orgId, name: priorityData.name, isDeleted: { $ne: true } })
        );

        if (!existing) {
          const created = await this.createPriority(orgId, priorityData, createdBy);
          createdPriorities.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default priority ${priorityData.name}:`, error);
      }
    }

    return {
      queues: createdQueues,
      statuses: createdStatuses,
      priorities: createdPriorities
    };
  }

  /**
   * Get ticket settings statistics
   */
  static async getStats(orgId: string): Promise<{
    totalQueues: number;
    activeQueues: number;
    totalStatuses: number;
    activeStatuses: number;
    totalPriorities: number;
    activePriorities: number;
  }> {
    const queueCollection = await this.getQueueCollection();
    const statusCollection = await this.getStatusCollection();
    const priorityCollection = await this.getPriorityCollection();
    
    const [queueStats, statusStats, priorityStats] = await Promise.all([
      queueCollection.aggregate([
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
      priorityCollection.aggregate([
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
      totalQueues: queueStats[0]?.total || 0,
      activeQueues: queueStats[0]?.active || 0,
      totalStatuses: statusStats[0]?.total || 0,
      activeStatuses: statusStats[0]?.active || 0,
      totalPriorities: priorityStats[0]?.total || 0,
      activePriorities: priorityStats[0]?.active || 0
    };
  }

  /**
   * Helper method to format SLA minutes to human readable string
   */
  private static formatSlaMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / (24 * 60));
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Private helper methods
   */
  private static transformQueueToExtended(queue: TicketQueueSettingDocument): TicketQueueSettingExtended {
    return {
      id: queue._id!.toString(),
      orgId: queue.orgId,
      name: queue.name,
      description: queue.description,
      defaultAssignee: queue.defaultAssignee,
      autoAssignmentRules: queue.autoAssignmentRules,
      emailAddress: queue.emailAddress,
      isDefault: queue.isDefault,
      isActive: queue.isActive,
      sortOrder: queue.sortOrder,
      createdBy: queue.createdBy,
      updatedBy: queue.updatedBy,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
      isDeleted: queue.isDeleted,
      deletedAt: queue.deletedAt
    };
  }

  private static transformStatusToExtended(status: TicketStatusSettingDocument): TicketStatusSettingExtended {
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
      autoCloseAfterDays: status.autoCloseAfterDays,
      createdBy: status.createdBy,
      updatedBy: status.updatedBy,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
      isDeleted: status.isDeleted,
      deletedAt: status.deletedAt
    };
  }

  private static transformPriorityToExtended(priority: TicketPrioritySettingDocument): TicketPrioritySettingExtended {
    return {
      id: priority._id!.toString(),
      orgId: priority.orgId,
      name: priority.name,
      color: priority.color,
      level: priority.level,
      responseSlaMinutes: priority.responseSlaMinutes,
      resolutionSlaMinutes: priority.resolutionSlaMinutes,
      responseSla: this.formatSlaMinutes(priority.responseSlaMinutes),
      resolutionSla: this.formatSlaMinutes(priority.resolutionSlaMinutes),
      escalationRules: priority.escalationRules,
      isDefault: priority.isDefault,
      isSystem: priority.isSystem,
      isActive: priority.isActive,
      createdBy: priority.createdBy,
      updatedBy: priority.updatedBy,
      createdAt: priority.createdAt,
      updatedAt: priority.updatedAt,
      isDeleted: priority.isDeleted,
      deletedAt: priority.deletedAt
    };
  }
}