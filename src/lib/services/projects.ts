import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Project, ProjectTask, ProjectMilestone, ProjectStatus } from '@/lib/types';

export interface ProjectDocument extends Omit<Project, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  actualStartDate?: string;
  actualEndDate?: string;
  description?: string;
  teamMembers?: string[];
  tags?: string[];
}

export interface ProjectTaskDocument extends Omit<ProjectTask, 'id'> {
  _id?: ObjectId;
  orgId: string;
  projectId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  description?: string;
}

export interface ProjectMilestoneDocument extends Omit<ProjectMilestone, 'id'> {
  _id?: ObjectId;
  orgId: string;
  projectId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedDate?: string;
  description?: string;
}

export class ProjectsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ProjectDocument>('projects');
  }

  private static async getTasksCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ProjectTaskDocument>('project_tasks');
  }

  private static async getMilestonesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ProjectMilestoneDocument>('project_milestones');
  }

  static async getAll(orgId: string, filters?: {
    status?: string;
    client?: string;
    clientId?: string;
    teamMember?: string;
    startDate?: string;
    endDate?: string;
    tag?: string;
  }): Promise<Project[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId };
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.client) {
      query.client = filters.client;
    }
    
    if (filters?.clientId) {
      query.clientId = filters.clientId;
    }
    
    if (filters?.teamMember) {
      query.teamMembers = { $in: [filters.teamMember] };
    }
    
    if (filters?.tag) {
      query.tags = { $in: [filters.tag] };
    }
    
    if (filters?.startDate || filters?.endDate) {
      query.startDate = {};
      if (filters.startDate) {
        query.startDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.startDate.$lte = filters.endDate;
      }
    }

    const projects = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const tasks = await this.getProjectTasks(orgId, project._id!.toString());
        const milestones = await this.getProjectMilestones(orgId, project._id!.toString());
        return this.documentToProject(project, tasks, milestones);
      })
    );

    return projectsWithDetails;
  }

  static async getById(orgId: string, id: string): Promise<Project | null> {
    const collection = await this.getCollection();
    const project = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!project) return null;
    
    const tasks = await this.getProjectTasks(orgId, id);
    const milestones = await this.getProjectMilestones(orgId, id);
    return this.documentToProject(project, tasks, milestones);
  }

  static async getByClient(orgId: string, clientId: string): Promise<Project[]> {
    return this.getAll(orgId, { clientId });
  }

  static async getByStatus(orgId: string, status: ProjectStatus): Promise<Project[]> {
    return this.getAll(orgId, { status });
  }

  static async getActive(orgId: string): Promise<Project[]> {
    return this.getAll(orgId, { status: 'In Progress' });
  }

  static async getUpcoming(orgId: string, days: number = 30): Promise<Project[]> {
    const collection = await this.getCollection();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const projects = await collection
      .find({
        orgId,
        status: { $in: ['Not Started', 'In Progress'] },
        startDate: {
          $gte: new Date().toISOString(),
          $lte: futureDate.toISOString()
        }
      })
      .sort({ startDate: 1 })
      .toArray();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const tasks = await this.getProjectTasks(orgId, project._id!.toString());
        const milestones = await this.getProjectMilestones(orgId, project._id!.toString());
        return this.documentToProject(project, tasks, milestones);
      })
    );

    return projectsWithDetails;
  }

  static async create(
    orgId: string,
    projectData: Omit<Project, 'id' | 'tasks' | 'milestones'>,
    createdBy: string,
    initialTasks?: Omit<ProjectTask, 'id'>[],
    initialMilestones?: Omit<ProjectMilestone, 'id'>[]
  ): Promise<Project> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const projectDocument: Omit<ProjectDocument, '_id'> = {
      ...projectData,
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      teamMembers: projectData.teamMembers || [],
      tags: projectData.tags || [],
    };

    const result = await collection.insertOne(projectDocument);
    const projectId = result.insertedId.toString();
    
    let tasks: ProjectTask[] = [];
    let milestones: ProjectMilestone[] = [];
    
    // Add initial tasks if provided
    if (initialTasks && initialTasks.length > 0) {
      tasks = await Promise.all(
        initialTasks.map(task => 
          this.addTask(orgId, projectId, task, createdBy)
        )
      );
    }
    
    // Add initial milestones if provided
    if (initialMilestones && initialMilestones.length > 0) {
      milestones = await Promise.all(
        initialMilestones.map(milestone => 
          this.addMilestone(orgId, projectId, milestone, createdBy)
        )
      );
    }
    
    const createdProject = await collection.findOne({ _id: result.insertedId });
    if (!createdProject) throw new Error('Failed to create project');
    
    return this.documentToProject(createdProject, tasks, milestones);
  }

  static async update(
    orgId: string,
    id: string,
    updates: Partial<Omit<Project, 'id' | 'tasks' | 'milestones'>>,
    updatedBy: string
  ): Promise<Project | null> {
    const collection = await this.getCollection();
    
    const updateData: any = {
      ...updates,
      updatedBy,
      updatedAt: new Date()
    };

    // Handle status transitions
    if (updates.status) {
      switch (updates.status) {
        case 'In Progress':
          if (!updateData.actualStartDate) {
            updateData.actualStartDate = new Date().toISOString();
          }
          break;
        case 'Completed':
          updateData.actualEndDate = new Date().toISOString();
          updateData.progress = 100;
          break;
        case 'Cancelled':
          updateData.actualEndDate = new Date().toISOString();
          break;
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    const tasks = await this.getProjectTasks(orgId, id);
    const milestones = await this.getProjectMilestones(orgId, id);
    return this.documentToProject(result, tasks, milestones);
  }

  static async delete(orgId: string, id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const tasksCollection = await this.getTasksCollection();
    const milestonesCollection = await this.getMilestonesCollection();
    
    // Delete all related tasks and milestones first
    await Promise.all([
      tasksCollection.deleteMany({ orgId, projectId: id }),
      milestonesCollection.deleteMany({ orgId, projectId: id })
    ]);
    
    // Delete the project
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    return result.deletedCount > 0;
  }

  // Task Management
  static async getProjectTasks(orgId: string, projectId: string): Promise<ProjectTask[]> {
    const tasksCollection = await this.getTasksCollection();
    
    const tasks = await tasksCollection
      .find({ orgId, projectId })
      .sort({ createdAt: 1 })
      .toArray();

    return tasks.map(this.taskDocumentToTask);
  }

  static async addTask(
    orgId: string,
    projectId: string,
    taskData: Omit<ProjectTask, 'id'>,
    createdBy: string
  ): Promise<ProjectTask> {
    const tasksCollection = await this.getTasksCollection();
    
    const taskDocument: Omit<ProjectTaskDocument, '_id'> = {
      ...taskData,
      orgId,
      projectId,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await tasksCollection.insertOne(taskDocument);
    
    // Update project progress
    await this.updateProjectProgress(orgId, projectId);
    
    const createdTask = await tasksCollection.findOne({ _id: result.insertedId });
    if (!createdTask) throw new Error('Failed to create task');
    
    return this.taskDocumentToTask(createdTask);
  }

  static async updateTask(
    orgId: string,
    projectId: string,
    taskId: string,
    updates: Partial<Omit<ProjectTask, 'id'>>,
    updatedBy: string
  ): Promise<ProjectTask | null> {
    const tasksCollection = await this.getTasksCollection();
    
    const updateData: any = {
      ...updates,
      updatedBy,
      updatedAt: new Date()
    };

    const result = await tasksCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(taskId),
        orgId,
        projectId: projectId 
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    // Update project progress
    await this.updateProjectProgress(orgId, projectId);
    
    return this.taskDocumentToTask(result);
  }

  static async deleteTask(orgId: string, projectId: string, taskId: string): Promise<boolean> {
    const tasksCollection = await this.getTasksCollection();
    
    const result = await tasksCollection.deleteOne({ 
      _id: new ObjectId(taskId),
      orgId,
      projectId: projectId 
    });
    
    if (result.deletedCount > 0) {
      // Update project progress
      await this.updateProjectProgress(orgId, projectId);
      return true;
    }
    
    return false;
  }

  // Milestone Management
  static async getProjectMilestones(orgId: string, projectId: string): Promise<ProjectMilestone[]> {
    const milestonesCollection = await this.getMilestonesCollection();
    
    const milestones = await milestonesCollection
      .find({ orgId, projectId })
      .sort({ dueDate: 1 })
      .toArray();

    return milestones.map(this.milestoneDocumentToMilestone);
  }

  static async addMilestone(
    orgId: string,
    projectId: string,
    milestoneData: Omit<ProjectMilestone, 'id'>,
    createdBy: string
  ): Promise<ProjectMilestone> {
    const milestonesCollection = await this.getMilestonesCollection();
    
    const milestoneDocument: Omit<ProjectMilestoneDocument, '_id'> = {
      ...milestoneData,
      orgId,
      projectId,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await milestonesCollection.insertOne(milestoneDocument);
    
    const createdMilestone = await milestonesCollection.findOne({ _id: result.insertedId });
    if (!createdMilestone) throw new Error('Failed to create milestone');
    
    return this.milestoneDocumentToMilestone(createdMilestone);
  }

  static async updateMilestone(
    orgId: string,
    projectId: string,
    milestoneId: string,
    updates: Partial<Omit<ProjectMilestone, 'id'>>,
    updatedBy: string
  ): Promise<ProjectMilestone | null> {
    const milestonesCollection = await this.getMilestonesCollection();
    
    const updateData: any = {
      ...updates,
      updatedBy,
      updatedAt: new Date()
    };

    // Handle completion
    if (updates.status === 'Completed' && !updateData.completedDate) {
      updateData.completedDate = new Date().toISOString();
    }

    const result = await milestonesCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(milestoneId),
        orgId,
        projectId: projectId 
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.milestoneDocumentToMilestone(result);
  }

  static async deleteMilestone(orgId: string, projectId: string, milestoneId: string): Promise<boolean> {
    const milestonesCollection = await this.getMilestonesCollection();
    
    const result = await milestonesCollection.deleteOne({ 
      _id: new ObjectId(milestoneId),
      orgId,
      projectId: projectId 
    });
    
    return result.deletedCount > 0;
  }

  static async getStats(orgId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    notStarted: number;
    cancelled: number;
    byStatus: Record<string, number>;
    byClient: Record<string, number>;
    totalBudget: number;
    usedBudget: number;
    averageProgress: number;
  }> {
    const collection = await this.getCollection();
    
    const [
      total,
      active,
      completed,
      onHold,
      notStarted,
      cancelled,
      statusCounts,
      clientCounts,
      budgetStats
    ] = await Promise.all([
      collection.countDocuments({ orgId }),
      collection.countDocuments({ orgId, status: 'In Progress' }),
      collection.countDocuments({ orgId, status: 'Completed' }),
      collection.countDocuments({ orgId, status: 'On Hold' }),
      collection.countDocuments({ orgId, status: 'Not Started' }),
      collection.countDocuments({ orgId, status: 'Cancelled' }),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$client', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId } },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget.total' },
            usedBudget: { $sum: '$budget.used' },
            averageProgress: { $avg: '$progress' }
          }
        }
      ]).toArray()
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((item: any) => {
      byStatus[item._id] = item.count;
    });

    const byClient: Record<string, number> = {};
    clientCounts.forEach((item: any) => {
      byClient[item._id] = item.count;
    });

    const budgetData = budgetStats[0] || { totalBudget: 0, usedBudget: 0, averageProgress: 0 };

    return {
      total,
      active,
      completed,
      onHold,
      notStarted,
      cancelled,
      byStatus,
      byClient,
      totalBudget: budgetData.totalBudget,
      usedBudget: budgetData.usedBudget,
      averageProgress: Math.round(budgetData.averageProgress || 0)
    };
  }

  private static async updateProjectProgress(orgId: string, projectId: string): Promise<void> {
    const tasks = await this.getProjectTasks(orgId, projectId);
    
    if (tasks.length === 0) return;
    
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);
    
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(projectId), orgId },
      { $set: { progress, updatedAt: new Date() } }
    );
  }

  private static documentToProject(
    doc: ProjectDocument, 
    tasks: ProjectTask[],
    milestones: ProjectMilestone[]
  ): Project {
    const { _id, createdBy, updatedBy, createdAt, updatedAt, actualStartDate, actualEndDate, description, teamMembers, tags, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest,
      tasks,
      milestones
    };
  }

  private static taskDocumentToTask(doc: ProjectTaskDocument): ProjectTask {
    const { _id, projectId, createdBy, updatedBy, createdAt, updatedAt, startDate, estimatedHours, actualHours, description, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }

  private static milestoneDocumentToMilestone(doc: ProjectMilestoneDocument): ProjectMilestone {
    const { _id, projectId, createdBy, updatedBy, createdAt, updatedAt, completedDate, description, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }
}