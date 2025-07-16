import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { ChangeRequest } from '@/lib/types';
import { ChangeManagementSettingsService } from './change-management-settings';

export interface ChangeRequestDocument extends Omit<ChangeRequest, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  actualStartDate?: string;
  actualEndDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Enhanced fields from settings
  requiresApproval?: boolean;
  requiresTesting?: boolean;
  requiresRollback?: boolean;
  requiresDocumentation?: boolean;
  requiresCommunication?: boolean;
  defaultMaintenanceWindow?: {
    duration: number;
    preferredTimes: string[];
  };
  riskScore?: number;
  riskMatrix?: string;
  approvalWorkflow?: string;
  approvalSteps?: Array<{
    stepNumber: number;
    name: string;
    description?: string;
    requiredApprovers: number;
    approverRoles: string[];
    timeoutHours?: number;
    parallelApproval?: boolean;
  }>;
}

export interface ChangeApprovalDocument {
  id: string;
  changeRequestId: string;
  orgId: string;
  approver: string;
  decision: 'approved' | 'rejected';
  reason?: string;
  timestamp: string;
}

export class ChangeManagementService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ChangeRequestDocument>('change_requests');
  }

  private static async getApprovalsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ChangeApprovalDocument>('change_approvals');
  }

  static async getAll(orgId: string, filters?: {
    status?: string;
    riskLevel?: string;
    impact?: string;
    client?: string;
    submittedBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ChangeRequest[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId };
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.riskLevel) {
      query.riskLevel = filters.riskLevel;
    }
    
    if (filters?.impact) {
      query.impact = filters.impact;
    }
    
    if (filters?.client) {
      query.client = filters.client;
    }
    
    if (filters?.submittedBy) {
      query.submittedBy = filters.submittedBy;
    }
    
    if (filters?.startDate || filters?.endDate) {
      query.plannedStartDate = {};
      if (filters.startDate) {
        query.plannedStartDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.plannedStartDate.$lte = filters.endDate;
      }
    }

    const changeRequests = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return changeRequests.map(this.documentToChangeRequest);
  }

  static async getById(id: string, orgId: string): Promise<ChangeRequest | null> {
    const collection = await this.getCollection();
    const changeRequest = await collection.findOne({ _id: new ObjectId(id), orgId });
    
    if (!changeRequest) return null;
    
    return this.documentToChangeRequest(changeRequest);
  }

  static async getByClient(clientId: string, orgId: string): Promise<ChangeRequest[]> {
    return this.getAll(orgId, { client: clientId });
  }

  static async getPendingApproval(orgId: string): Promise<ChangeRequest[]> {
    return this.getAll(orgId, { status: 'Pending Approval' });
  }

  static async getInProgress(orgId: string): Promise<ChangeRequest[]> {
    return this.getAll(orgId, { status: 'In Progress' });
  }

  static async create(
    changeData: Omit<ChangeRequest, 'id'>,
    orgId: string,
    createdBy: string
  ): Promise<ChangeRequest> {
    const collection = await this.getCollection();
    
    // Get category settings for enhanced change request processing
    const categories = await ChangeManagementSettingsService.getCategoriesForChangeCreation(orgId);
    const selectedCategory = categories.find(cat => cat.name === changeData.category);
    
    // Get risk matrix for risk assessment
    const riskMatrix = await ChangeManagementSettingsService.getRiskMatrixForChangeCreation(orgId);
    
    // Calculate risk score based on matrix
    let calculatedRiskScore = 0;
    if (riskMatrix && selectedCategory) {
      const riskLevel = riskMatrix.riskLevels.find(level => level.level === changeData.riskLevel);
      if (riskLevel) {
        calculatedRiskScore = riskLevel.requiredApprovers * 25; // Simple scoring
      }
    }
    
    // Get applicable workflows
    const workflows = await ChangeManagementSettingsService.getWorkflowsForChangeCreation(orgId);
    const applicableWorkflow = workflows.find(wf => 
      wf.triggerConditions.riskLevel?.includes(changeData.riskLevel as any)
    );
    
    const now = new Date();
    const changeDocument: Omit<ChangeRequestDocument, '_id'> = {
      ...changeData,
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      // Add enhanced fields from settings
      ...(selectedCategory && {
        requiresApproval: selectedCategory.requiresApproval,
        requiresTesting: selectedCategory.requiresTesting,
        requiresRollback: selectedCategory.requiresRollback,
        requiresDocumentation: selectedCategory.requiresDocumentation,
        requiresCommunication: selectedCategory.requiresCommunication,
        defaultMaintenanceWindow: selectedCategory.defaultMaintenanceWindow
      }),
      ...(riskMatrix && {
        riskScore: calculatedRiskScore,
        riskMatrix: riskMatrix.name
      }),
      ...(applicableWorkflow && {
        approvalWorkflow: applicableWorkflow.name,
        approvalSteps: applicableWorkflow.approvalSteps
      })
    };

    const result = await collection.insertOne(changeDocument);
    
    const createdChange = await collection.findOne({ _id: result.insertedId });
    if (!createdChange) throw new Error('Failed to create change request');
    
    return this.documentToChangeRequest(createdChange);
  }

  static async update(
    id: string,
    updates: Partial<Omit<ChangeRequest, 'id'>>,
    orgId: string,
    updatedBy: string
  ): Promise<ChangeRequest | null> {
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
          if (!updates.plannedStartDate) {
            updateData.actualStartDate = new Date().toISOString();
          }
          break;
        case 'Completed':
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
    
    return this.documentToChangeRequest(result);
  }

  static async approve(
    id: string,
    orgId: string,
    approvedBy: string,
    reason?: string
  ): Promise<ChangeRequest | null> {
    const collection = await this.getCollection();
    const approvalsCollection = await this.getApprovalsCollection();
    
    const now = new Date();
    
    // Record the approval
    await approvalsCollection.insertOne({
      id: new ObjectId().toString(),
      changeRequestId: id,
      orgId,
      approver: approvedBy,
      decision: 'approved',
      reason,
      timestamp: now.toISOString(),
    });

    // Update the change request status
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { 
        $set: { 
          status: 'Approved',
          approvedBy,
          approvedAt: now.toISOString(),
          updatedBy: approvedBy,
          updatedAt: now
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToChangeRequest(result);
  }

  static async reject(
    id: string,
    orgId: string,
    rejectedBy: string,
    reason: string
  ): Promise<ChangeRequest | null> {
    const collection = await this.getCollection();
    const approvalsCollection = await this.getApprovalsCollection();
    
    const now = new Date();
    
    // Record the rejection
    await approvalsCollection.insertOne({
      id: new ObjectId().toString(),
      changeRequestId: id,
      orgId,
      approver: rejectedBy,
      decision: 'rejected',
      reason,
      timestamp: now.toISOString(),
    });

    // Update the change request status
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { 
        $set: { 
          status: 'Rejected',
          rejectedBy,
          rejectedAt: now.toISOString(),
          rejectionReason: reason,
          updatedBy: rejectedBy,
          updatedAt: now
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return this.documentToChangeRequest(result);
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const approvalsCollection = await this.getApprovalsCollection();
    
    // Delete related approvals first
    await approvalsCollection.deleteMany({ changeRequestId: id, orgId });
    
    // Delete the change request
    const result = await collection.deleteOne({ _id: new ObjectId(id), orgId });
    return result.deletedCount > 0;
  }

  static async getStats(orgId: string): Promise<{
    total: number;
    pendingApproval: number;
    approved: number;
    inProgress: number;
    completed: number;
    rejected: number;
    byStatus: Record<string, number>;
    byRiskLevel: Record<string, number>;
    byImpact: Record<string, number>;
  }> {
    const collection = await this.getCollection();
    
    const [
      total,
      pendingApproval,
      approved,
      inProgress,
      completed,
      rejected,
      statusCounts,
      riskCounts,
      impactCounts
    ] = await Promise.all([
      collection.countDocuments({ orgId }),
      collection.countDocuments({ orgId, status: 'Pending Approval' }),
      collection.countDocuments({ orgId, status: 'Approved' }),
      collection.countDocuments({ orgId, status: 'In Progress' }),
      collection.countDocuments({ orgId, status: 'Completed' }),
      collection.countDocuments({ orgId, status: 'Rejected' }),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { orgId } },
        { $group: { _id: '$impact', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((item: any) => {
      byStatus[item._id] = item.count;
    });

    const byRiskLevel: Record<string, number> = {};
    riskCounts.forEach((item: any) => {
      byRiskLevel[item._id] = item.count;
    });

    const byImpact: Record<string, number> = {};
    impactCounts.forEach((item: any) => {
      byImpact[item._id] = item.count;
    });

    return {
      total,
      pendingApproval,
      approved,
      inProgress,
      completed,
      rejected,
      byStatus,
      byRiskLevel,
      byImpact
    };
  }

  static async getApprovals(changeRequestId: string, orgId: string): Promise<ChangeApprovalDocument[]> {
    const approvalsCollection = await this.getApprovalsCollection();
    
    const approvals = await approvalsCollection
      .find({ changeRequestId, orgId })
      .sort({ timestamp: -1 })
      .toArray();

    return approvals;
  }

  static async getBySubmitter(submittedBy: string, orgId: string): Promise<ChangeRequest[]> {
    return this.getAll(orgId, { submittedBy });
  }

  static async getByRiskLevel(riskLevel: string, orgId: string): Promise<ChangeRequest[]> {
    return this.getAll(orgId, { riskLevel });
  }

  static async getUpcoming(orgId: string, days: number = 7): Promise<ChangeRequest[]> {
    const collection = await this.getCollection();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const changes = await collection
      .find({
        orgId,
        status: { $in: ['Approved', 'In Progress'] },
        plannedStartDate: {
          $gte: new Date().toISOString(),
          $lte: futureDate.toISOString()
        }
      })
      .sort({ plannedStartDate: 1 })
      .toArray();

    return changes.map(this.documentToChangeRequest);
  }

  private static documentToChangeRequest(doc: ChangeRequestDocument): ChangeRequest {
    const { _id, orgId, createdBy, updatedBy, createdAt, updatedAt, actualStartDate, actualEndDate, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason, ...rest } = doc;
    return {
      id: _id!.toString(),
      ...rest
    };
  }
}