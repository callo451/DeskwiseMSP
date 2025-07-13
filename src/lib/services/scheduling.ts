import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { ScheduleItem, RecurrencePattern } from '@/lib/types';
import { addDays, addWeeks, addMonths, addYears, format, parse, isAfter, isBefore } from 'date-fns';

export interface ScheduleItemDocument extends Omit<ScheduleItem, 'id'> {
  _id?: ObjectId;
  orgId: string; // Organization ID for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduleService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ScheduleItemDocument>('schedule_items');
  }

  static async getAll(orgId: string, filters?: {
    technicianId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId }; // Always filter by organization
    
    if (filters?.technicianId) {
      query.technicianId = filters.technicianId;
    }
    
    if (filters?.type) {
      query.type = filters.type;
    }
    
    // Date range filtering
    if (filters?.startDate || filters?.endDate) {
      query.$or = [];
      
      if (filters.startDate && filters.endDate) {
        // Items that start or end within the date range, or span across it
        query.$or = [
          { start: { $gte: filters.startDate, $lte: filters.endDate } },
          { end: { $gte: filters.startDate, $lte: filters.endDate } },
          { 
            start: { $lte: filters.startDate }, 
            end: { $gte: filters.endDate } 
          }
        ];
      } else if (filters.startDate) {
        query.start = { $gte: filters.startDate };
      } else if (filters.endDate) {
        query.end = { $lte: filters.endDate };
      }
    }

    const scheduleItems = await collection
      .find(query)
      .sort({ start: 1 })
      .toArray();

    return scheduleItems.map(this.documentToScheduleItem);
  }

  static async getById(id: string, orgId: string): Promise<ScheduleItem | null> {
    const collection = await this.getCollection();
    const scheduleItem = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!scheduleItem) return null;
    
    return this.documentToScheduleItem(scheduleItem);
  }

  static async getByDateRange(orgId: string, startDate: string, endDate: string, technicianIds?: string[]): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    const query: any = {
      orgId,
      $or: [
        { start: { $gte: startDate, $lte: endDate } },
        { end: { $gte: startDate, $lte: endDate } },
        { 
          start: { $lte: startDate }, 
          end: { $gte: endDate } 
        }
      ]
    };

    if (technicianIds && technicianIds.length > 0) {
      query.technicianId = { $in: technicianIds };
    }

    const scheduleItems = await collection
      .find(query)
      .sort({ start: 1 })
      .toArray();

    return scheduleItems.map(this.documentToScheduleItem);
  }

  static async getByTechnician(orgId: string, technicianId: string, startDate?: string, endDate?: string): Promise<ScheduleItem[]> {
    return this.getAll(orgId, { 
      technicianId,
      startDate,
      endDate
    });
  }

  static async create(orgId: string, scheduleItemData: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const scheduleItemDocument: Omit<ScheduleItemDocument, '_id'> = {
      ...scheduleItemData,
      orgId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(scheduleItemDocument);
    
    const createdScheduleItem = await collection.findOne({ _id: result.insertedId });
    if (!createdScheduleItem) throw new Error('Failed to create schedule item');
    
    return this.documentToScheduleItem(createdScheduleItem);
  }

  static async update(id: string, orgId: string, updates: Partial<Omit<ScheduleItem, 'id'>>): Promise<ScheduleItem | null> {
    const collection = await this.getCollection();
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToScheduleItem(result);
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    return result.deletedCount > 0;
  }

  static async getConflicts(
    orgId: string,
    technicianId: string, 
    start: string, 
    end: string, 
    excludeId?: string
  ): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    const query: any = {
      orgId,
      technicianId,
      $or: [
        // New item starts during existing item
        { start: { $lte: start }, end: { $gt: start } },
        // New item ends during existing item
        { start: { $lt: end }, end: { $gte: end } },
        // New item completely contains existing item
        { start: { $gte: start }, end: { $lte: end } },
        // Existing item completely contains new item
        { start: { $lte: start }, end: { $gte: end } }
      ]
    };

    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const conflicts = await collection.find(query).toArray();
    return conflicts.map(this.documentToScheduleItem);
  }

  static async getTechnicianSchedule(
    orgId: string,
    technicianId: string, 
    date: string
  ): Promise<ScheduleItem[]> {
    const startOfDay = `${date} 00:00`;
    const endOfDay = `${date} 23:59`;
    
    return this.getByDateRange(orgId, startOfDay, endOfDay, [technicianId]);
  }

  static async createRecurring(
    orgId: string,
    scheduleItemData: Omit<ScheduleItem, 'id'>,
    recurrencePattern: RecurrencePattern
  ): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    // Create the parent recurring item
    const parentItem = await this.create(orgId, {
      ...scheduleItemData,
      isRecurring: true,
      recurrencePattern,
    });

    // Generate recurring instances
    const instances = this.generateRecurringInstances(parentItem, recurrencePattern);
    
    if (instances.length > 0) {
      const instanceDocuments = instances.map(instance => ({
        ...instance,
        parentRecurrenceId: parentItem.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Remove the id field from instances before inserting
      const documentsToInsert = instanceDocuments.map(doc => {
        const { parentRecurrenceId, createdAt, updatedAt, ...rest } = doc;
        return {
          ...rest,
          orgId,
          parentRecurrenceId,
          createdAt,
          updatedAt,
        };
      });

      const result = await collection.insertMany(documentsToInsert);
      
      // Fetch the created instances
      const createdInstances = await collection
        .find({ _id: { $in: Object.values(result.insertedIds) } })
        .toArray();
      
      return [parentItem, ...createdInstances.map(this.documentToScheduleItem)];
    }

    return [parentItem];
  }

  static async updateRecurringSeries(
    orgId: string,
    parentId: string,
    updates: Partial<Omit<ScheduleItem, 'id'>>,
    updateType: 'this-only' | 'this-and-future' | 'all-instances'
  ): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    const parentItem = await this.getById(parentId, orgId);
    if (!parentItem || !parentItem.isRecurring) {
      throw new Error('Parent item not found or not recurring');
    }

    const updatedItems: ScheduleItem[] = [];

    switch (updateType) {
      case 'this-only':
        // Update only the parent item
        const updated = await this.update(parentId, orgId, updates);
        if (updated) updatedItems.push(updated);
        break;

      case 'all-instances':
        // Update parent and all instances
        await collection.updateMany(
          { 
            orgId,
            $or: [
              { _id: new ObjectId(parentId) },
              { parentRecurrenceId: parentId }
            ]
          },
          { $set: { ...updates, updatedAt: new Date() } }
        );
        
        const allUpdated = await collection
          .find({ 
            orgId,
            $or: [
              { _id: new ObjectId(parentId) },
              { parentRecurrenceId: parentId }
            ]
          })
          .toArray();
        
        updatedItems.push(...allUpdated.map(this.documentToScheduleItem));
        break;

      case 'this-and-future':
        // Update parent and future instances only
        const currentDate = new Date().toISOString();
        await collection.updateMany(
          { 
            orgId,
            $or: [
              { _id: new ObjectId(parentId) },
              { 
                parentRecurrenceId: parentId,
                start: { $gte: currentDate }
              }
            ]
          },
          { $set: { ...updates, updatedAt: new Date() } }
        );
        
        const futureUpdated = await collection
          .find({ 
            orgId,
            $or: [
              { _id: new ObjectId(parentId) },
              { 
                parentRecurrenceId: parentId,
                start: { $gte: currentDate }
              }
            ]
          })
          .toArray();
        
        updatedItems.push(...futureUpdated.map(this.documentToScheduleItem));
        break;
    }

    return updatedItems;
  }

  static async deleteRecurringSeries(
    orgId: string,
    parentId: string,
    deleteType: 'this-only' | 'this-and-future' | 'all-instances'
  ): Promise<number> {
    const collection = await this.getCollection();
    
    let deletedCount = 0;

    switch (deleteType) {
      case 'this-only':
        const result1 = await collection.deleteOne({ _id: new ObjectId(parentId), orgId });
        deletedCount = result1.deletedCount;
        break;

      case 'all-instances':
        const result2 = await collection.deleteMany({
          orgId,
          $or: [
            { _id: new ObjectId(parentId) },
            { parentRecurrenceId: parentId }
          ]
        });
        deletedCount = result2.deletedCount;
        break;

      case 'this-and-future':
        const currentDate = new Date().toISOString();
        const result3 = await collection.deleteMany({
          orgId,
          $or: [
            { _id: new ObjectId(parentId) },
            { 
              parentRecurrenceId: parentId,
              start: { $gte: currentDate }
            }
          ]
        });
        deletedCount = result3.deletedCount;
        break;
    }

    return deletedCount;
  }

  static async getRecurringSeries(orgId: string, parentId: string): Promise<ScheduleItem[]> {
    const collection = await this.getCollection();
    
    const items = await collection
      .find({
        orgId,
        $or: [
          { _id: new ObjectId(parentId) },
          { parentRecurrenceId: parentId }
        ]
      })
      .sort({ start: 1 })
      .toArray();

    return items.map(this.documentToScheduleItem);
  }

  static async getTechnicianWorkload(
    orgId: string,
    technicianId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalHours: number;
    scheduledHours: number;
    availableHours: number;
    items: ScheduleItem[];
    utilization: number;
  }> {
    const items = await this.getByDateRange(orgId, startDate, endDate, [technicianId]);
    
    let scheduledMinutes = 0;
    items.forEach(item => {
      const start = parse(item.start, 'yyyy-MM-dd HH:mm', new Date());
      const end = parse(item.end, 'yyyy-MM-dd HH:mm', new Date());
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      scheduledMinutes += duration;
      
      // Add travel time if specified
      if (item.travelTime) {
        scheduledMinutes += item.travelTime;
      }
    });

    const scheduledHours = scheduledMinutes / 60;
    const totalWorkingHours = 8 * 5; // Assuming 8 hours/day, 5 days/week
    const availableHours = Math.max(0, totalWorkingHours - scheduledHours);
    const utilization = (scheduledHours / totalWorkingHours) * 100;

    return {
      totalHours: totalWorkingHours,
      scheduledHours,
      availableHours,
      items,
      utilization: Math.min(100, utilization)
    };
  }

  static async findOptimalTimeSlot(
    orgId: string,
    technicianId: string,
    duration: number, // in minutes
    preferredDate: string,
    timePreference: 'morning' | 'afternoon' | 'any' = 'any'
  ): Promise<{ start: string; end: string } | null> {
    const startDate = preferredDate;
    const endDate = format(addDays(parse(preferredDate, 'yyyy-MM-dd', new Date()), 7), 'yyyy-MM-dd');
    
    const existingItems = await this.getByDateRange(
      orgId,
      `${startDate} 00:00`,
      `${endDate} 23:59`,
      [technicianId]
    );

    // Define working hours
    const workingHours = {
      start: timePreference === 'afternoon' ? 13 : 9,
      end: timePreference === 'morning' ? 12 : 17
    };

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = format(addDays(parse(preferredDate, 'yyyy-MM-dd', new Date()), dayOffset), 'yyyy-MM-dd');
      
      // Get items for this day
      const dayItems = existingItems.filter(item => 
        item.start.startsWith(checkDate)
      ).sort((a, b) => a.start.localeCompare(b.start));

      // Check for available slots
      let currentTime = workingHours.start * 60; // Convert to minutes
      const endTime = workingHours.end * 60;

      for (const item of dayItems) {
        const itemStart = parse(item.start, 'yyyy-MM-dd HH:mm', new Date());
        const itemEnd = parse(item.end, 'yyyy-MM-dd HH:mm', new Date());
        const itemStartMinutes = itemStart.getHours() * 60 + itemStart.getMinutes();
        
        // Check if there's a gap before this item
        if (itemStartMinutes - currentTime >= duration) {
          const startHour = Math.floor(currentTime / 60);
          const startMinute = currentTime % 60;
          const endMinutes = currentTime + duration;
          const endHour = Math.floor(endMinutes / 60);
          const endMinuteRemainder = endMinutes % 60;
          
          return {
            start: `${checkDate} ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
            end: `${checkDate} ${endHour.toString().padStart(2, '0')}:${endMinuteRemainder.toString().padStart(2, '0')}`
          };
        }
        
        currentTime = itemEnd.getHours() * 60 + itemEnd.getMinutes();
      }

      // Check if there's time at the end of the day
      if (endTime - currentTime >= duration) {
        const startHour = Math.floor(currentTime / 60);
        const startMinute = currentTime % 60;
        const endMinutes = currentTime + duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMinuteRemainder = endMinutes % 60;
        
        return {
          start: `${checkDate} ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          end: `${checkDate} ${endHour.toString().padStart(2, '0')}:${endMinuteRemainder.toString().padStart(2, '0')}`
        };
      }
    }

    return null; // No available slot found
  }

  private static generateRecurringInstances(
    parentItem: ScheduleItem,
    pattern: RecurrencePattern
  ): Omit<ScheduleItem, 'id'>[] {
    const instances: Omit<ScheduleItem, 'id'>[] = [];
    const startDate = parse(parentItem.start, 'yyyy-MM-dd HH:mm', new Date());
    const endDate = parse(parentItem.end, 'yyyy-MM-dd HH:mm', new Date());
    const duration = endDate.getTime() - startDate.getTime();
    
    let currentDate = startDate;
    let occurrenceCount = 0;
    const maxOccurrences = pattern.occurrences || 100; // Safety limit
    const patternEndDate = pattern.endDate ? parse(pattern.endDate, 'yyyy-MM-dd', new Date()) : null;

    while (occurrenceCount < maxOccurrences) {
      // Calculate next occurrence date
      switch (pattern.type) {
        case 'daily':
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, pattern.interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, pattern.interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, pattern.interval);
          break;
      }

      // Check if we've exceeded the end date
      if (patternEndDate && isAfter(currentDate, patternEndDate)) {
        break;
      }

      // Create instance
      const instanceEndDate = new Date(currentDate.getTime() + duration);
      
      instances.push({
        title: parentItem.title,
        technicianId: parentItem.technicianId,
        type: parentItem.type,
        start: format(currentDate, 'yyyy-MM-dd HH:mm'),
        end: format(instanceEndDate, 'yyyy-MM-dd HH:mm'),
        clientId: parentItem.clientId,
        participants: parentItem.participants,
        ticketId: parentItem.ticketId,
        notes: parentItem.notes,
        location: parentItem.location,
        isRecurring: false,
        recurrenceInstanceDate: format(currentDate, 'yyyy-MM-dd'),
        status: parentItem.status || 'scheduled',
        priority: parentItem.priority,
        estimatedDuration: parentItem.estimatedDuration,
        travelTime: parentItem.travelTime,
        requiredSkills: parentItem.requiredSkills,
        equipment: parentItem.equipment,
        reminders: parentItem.reminders,
      });

      occurrenceCount++;
    }

    return instances;
  }

  private static documentToScheduleItem(doc: ScheduleItemDocument): ScheduleItem {
    const { _id, createdAt, updatedAt, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }
}