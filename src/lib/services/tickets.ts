import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Ticket, TimeLog, DashboardStat } from '@/lib/types';
import { NumberingSchemesService } from './numbering-schemes';
import { TicketSettingsService } from './ticket-settings';

export interface TicketDocument extends Omit<Ticket, 'id'> {
  _id?: ObjectId;
  orgId: string; // Organization ID for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

export class TicketService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<TicketDocument>('tickets');
  }

  static async getAll(orgId: string, filters?: {
    status?: string[];
    priority?: string[];
    queue?: string[];
    assignee?: string;
    client?: string;
  }): Promise<Ticket[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId }; // Always filter by organization
    
    if (filters?.status?.length) {
      query.status = { $in: filters.status };
    }
    
    if (filters?.priority?.length) {
      query.priority = { $in: filters.priority };
    }
    
    if (filters?.queue?.length) {
      query.queue = { $in: filters.queue };
    }
    
    if (filters?.assignee) {
      query.assignee = filters.assignee;
    }
    
    if (filters?.client) {
      query.client = filters.client;
    }

    const tickets = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return tickets.map(this.documentToTicket);
  }

  static async getById(id: string, orgId: string): Promise<Ticket | null> {
    const collection = await this.getCollection();
    const ticket = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!ticket) return null;
    
    return this.documentToTicket(ticket);
  }

  /**
   * Get default settings for creating new tickets
   */
  static async getDefaults(orgId: string): Promise<{
    defaultQueue: string;
    defaultStatus: string;
    defaultPriority: string;
    availableQueues: Array<{ id: string; name: string }>;
    availableStatuses: Array<{ id: string; name: string; color: string; type: string }>;
    availablePriorities: Array<{ id: string; name: string; color: string; level: number }>;
  }> {
    const [queues, statuses, priorities] = await Promise.all([
      TicketSettingsService.getAllQueues(orgId),
      TicketSettingsService.getAllStatuses(orgId),
      TicketSettingsService.getAllPriorities(orgId)
    ]);

    const defaultQueue = queues.find(q => q.isDefault)?.name || queues[0]?.name || 'Unassigned';
    const defaultStatus = statuses.find(s => s.isDefault)?.name || statuses[0]?.name || 'Open';
    const defaultPriority = priorities.find(p => p.isDefault)?.name || priorities[0]?.name || 'Medium';

    return {
      defaultQueue,
      defaultStatus,
      defaultPriority,
      availableQueues: queues.map(q => ({ id: q.id, name: q.name })),
      availableStatuses: statuses.map(s => ({ id: s.id, name: s.name, color: s.color, type: s.type })),
      availablePriorities: priorities.map(p => ({ id: p.id, name: p.name, color: p.color, level: p.level }))
    };
  }

  static async create(orgId: string, ticketData: Omit<Ticket, 'id' | 'createdDate' | 'lastUpdate' | 'activity'>): Promise<Ticket> {
    const collection = await this.getCollection();
    
    // Generate the next ticket ID using numbering scheme
    const ticketId = await NumberingSchemesService.generateNextId(orgId, 'tickets');
    
    // Get defaults if not provided
    const defaults = await this.getDefaults(orgId);
    
    const now = new Date();
    const ticketDocument: Omit<TicketDocument, '_id'> = {
      ...ticketData,
      queue: ticketData.queue || defaults.defaultQueue,
      status: ticketData.status || defaults.defaultStatus,
      priority: ticketData.priority || defaults.defaultPriority,
      orgId,
      createdDate: now.toISOString().split('T')[0],
      lastUpdate: 'Just now',
      activity: [{
        timestamp: 'Just now',
        user: 'System',
        activity: 'Ticket created'
      }],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(ticketDocument);
    
    const createdTicket = await collection.findOne({ _id: result.insertedId });
    if (!createdTicket) throw new Error('Failed to create ticket');
    
    return this.documentToTicket(createdTicket);
  }

  static async update(id: string, orgId: string, updates: Partial<Omit<Ticket, 'id' | 'createdDate'>>): Promise<Ticket | null> {
    const collection = await this.getCollection();
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
      lastUpdate: 'Just now'
    };

    // If activity is being updated, ensure it's properly structured
    if (updates.activity) {
      updateData.activity = updates.activity;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToTicket(result);
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    return result.deletedCount > 0;
  }

  static async addActivity(id: string, orgId: string, activity: { user: string; activity: string }): Promise<Ticket | null> {
    const collection = await this.getCollection();
    
    const activityEntry = {
      timestamp: 'Just now',
      user: activity.user,
      activity: activity.activity
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { 
        $push: { activity: activityEntry },
        $set: { 
          updatedAt: new Date(),
          lastUpdate: 'Just now'
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToTicket(result);
  }

  static async addTimeLog(id: string, orgId: string, timeLog: Omit<TimeLog, 'id'>): Promise<Ticket | null> {
    const collection = await this.getCollection();
    
    const timeLogWithId = {
      ...timeLog,
      id: new ObjectId().toString()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { 
        $push: { timeLogs: timeLogWithId },
        $set: { 
          updatedAt: new Date(),
          lastUpdate: 'Just now'
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToTicket(result);
  }

  static async getStats(orgId: string): Promise<DashboardStat[]> {
    const collection = await this.getCollection();
    
    // Get current counts
    const [
      openCount,
      overdueCount,
      unassignedCount,
      closedTodayCount
    ] = await Promise.all([
      collection.countDocuments({ orgId, status: { $in: ['Open', 'In Progress', 'On Hold'] } }),
      collection.countDocuments({ 
        orgId,
        status: { $in: ['Open', 'In Progress'] },
        'sla.responseDue': { $lt: new Date().toISOString() },
        'sla.respondedAt': { $exists: false }
      }),
      collection.countDocuments({ orgId, assignee: 'Unassigned' }),
      collection.countDocuments({ 
        orgId,
        status: { $in: ['Resolved', 'Closed'] },
        updatedAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // For now, using static change values - in production you'd calculate these from historical data
    return [
      {
        title: "All Open Tickets",
        value: openCount.toString(),
        change: "+5",
        changeType: "increase" as const,
        description: "since last hour"
      },
      {
        title: "Overdue Tickets",
        value: overdueCount.toString(),
        change: "-2",
        changeType: "decrease" as const,
        description: "from yesterday"
      },
      {
        title: "Unassigned Tickets",
        value: unassignedCount.toString(),
        change: "+1",
        changeType: "increase" as const,
        description: "since last hour"
      },
      {
        title: "Tickets Closed Today",
        value: closedTodayCount.toString(),
        change: "+20%",
        changeType: "increase" as const,
        description: "from yesterday"
      }
    ];
  }

  static async getPersonalStats(orgId: string, assignee: string): Promise<DashboardStat[]> {
    const collection = await this.getCollection();
    
    const [
      myOpenCount,
      myOverdueCount,
      myClosedTodayCount,
      totalAssignedCount
    ] = await Promise.all([
      collection.countDocuments({ 
        orgId, 
        assignee, 
        status: { $in: ['Open', 'In Progress', 'On Hold'] } 
      }),
      collection.countDocuments({ 
        orgId,
        assignee,
        status: { $in: ['Open', 'In Progress'] },
        'sla.responseDue': { $lt: new Date().toISOString() },
        'sla.respondedAt': { $exists: false }
      }),
      collection.countDocuments({ 
        orgId,
        assignee,
        status: { $in: ['Resolved', 'Closed'] },
        updatedAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      collection.countDocuments({ orgId, assignee })
    ]);

    return [
      {
        title: "My Open Tickets",
        value: myOpenCount.toString(),
        change: "+2",
        changeType: "increase" as const,
        description: "since yesterday"
      },
      {
        title: "My Overdue Tickets",
        value: myOverdueCount.toString(),
        change: "-1",
        changeType: "decrease" as const,
        description: "from yesterday"
      },
      {
        title: "Closed by Me Today",
        value: myClosedTodayCount.toString(),
        change: "+3",
        changeType: "increase" as const,
        description: "from yesterday"
      },
      {
        title: "Total Assigned to Me",
        value: totalAssignedCount.toString(),
        change: "+1",
        changeType: "increase" as const,
        description: "since last week"
      }
    ];
  }

  private static documentToTicket(doc: TicketDocument): Ticket {
    const { _id, createdAt, updatedAt, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }
}