import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Contract, ContractService, TimeLog } from '@/lib/types';

export interface ContractDocument extends Omit<Contract, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional billing-specific fields
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentTerms: number; // days
  notes?: string;
}

export interface SLAPolicyDocument {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  name: string;
  description: string;
  targets: Array<{
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    response_time_minutes: number;
    resolution_time_minutes: number;
  }>;
  isActive: boolean;
}

export interface TimeLogDocument extends Omit<TimeLog, 'id'> {
  _id?: ObjectId;
  orgId: string;
  contractId?: string;
  ticketId?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceDocument {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceNumber: string;
  contractId: string;
  clientId: string;
  clientName: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  timeLogIds?: string[];
}

export interface BillingStats {
  totalMRR: number;
  activeContracts: number;
  pendingRenewals: number;
  expiredContracts: number;
  totalAnnualValue: number;
  avgContractValue: number;
  billingAccuracy: number;
  unpaidInvoices: number;
  totalOutstanding: number;
}

export interface ContractMetrics {
  contractId: string;
  contractName: string;
  clientName: string;
  mrr: number;
  status: Contract['status'];
  daysToExpiry: number;
  serviceCount: number;
  billingAccuracy: number;
  lastInvoiceDate?: Date;
  totalBilled: number;
  totalTimeLogged: number;
}

export class BillingService {
  private static async getContractsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ContractDocument>('contracts');
  }

  private static async getSLAPoliciesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<SLAPolicyDocument>('sla_policies');
  }

  private static async getTimeLogsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<TimeLogDocument>('time_logs');
  }

  private static async getInvoicesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<InvoiceDocument>('invoices');
  }

  // Contract Management

  /**
   * Get all contracts for an organization
   */
  static async getAllContracts(orgId: string, filters?: {
    status?: string[];
    clientId?: string;
    clientName?: string;
    expiringInDays?: number;
  }): Promise<Contract[]> {
    const collection = await this.getContractsCollection();
    
    const query: any = { orgId };
    
    if (filters?.status?.length) {
      query.status = { $in: filters.status };
    }
    
    if (filters?.clientId) {
      query.clientId = filters.clientId;
    }
    
    if (filters?.clientName) {
      query.clientName = { $regex: filters.clientName, $options: 'i' };
    }

    if (filters?.expiringInDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.expiringInDays);
      query.endDate = { $lte: futureDate.toISOString() };
      query.status = 'Active';
    }

    const contracts = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return contracts.map(contract => ({
      id: contract._id!.toString(),
      name: contract.name,
      clientId: contract.clientId,
      clientName: contract.clientName,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      mrr: contract.mrr,
      services: contract.services
    }));
  }

  /**
   * Get contract by ID
   */
  static async getContractById(id: string, orgId: string): Promise<Contract | null> {
    const collection = await this.getContractsCollection();
    
    const contract = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (!contract) return null;

    return {
      id: contract._id!.toString(),
      name: contract.name,
      clientId: contract.clientId,
      clientName: contract.clientName,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      mrr: contract.mrr,
      services: contract.services
    };
  }

  /**
   * Create a new contract
   */
  static async createContract(
    orgId: string,
    contractData: Omit<Contract, 'id'> & {
      billingCycle?: 'monthly' | 'quarterly' | 'annually';
      autoRenew?: boolean;
      paymentTerms?: number;
      notes?: string;
    },
    createdBy: string
  ): Promise<Contract> {
    const collection = await this.getContractsCollection();
    
    const now = new Date();
    const nextBillingDate = new Date(contractData.startDate);
    
    // Calculate next billing date based on cycle
    switch (contractData.billingCycle || 'monthly') {
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'annually':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
    }

    const document: Omit<ContractDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      name: contractData.name,
      clientId: contractData.clientId,
      clientName: contractData.clientName,
      status: contractData.status,
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      mrr: contractData.mrr,
      services: contractData.services,
      billingCycle: contractData.billingCycle || 'monthly',
      nextBillingDate,
      autoRenew: contractData.autoRenew ?? true,
      paymentTerms: contractData.paymentTerms || 30,
      notes: contractData.notes
    };

    const result = await collection.insertOne(document);
    
    // Track service usage for popularity analytics
    await this.trackServiceUsageInContract(orgId, contractData.services);
    
    return {
      id: result.insertedId.toString(),
      name: document.name,
      clientId: document.clientId,
      clientName: document.clientName,
      status: document.status,
      startDate: document.startDate,
      endDate: document.endDate,
      mrr: document.mrr,
      services: document.services
    };
  }

  /**
   * Update a contract
   */
  static async updateContract(
    id: string,
    orgId: string,
    updates: Partial<Omit<Contract, 'id'> & {
      billingCycle?: 'monthly' | 'quarterly' | 'annually';
      autoRenew?: boolean;
      paymentTerms?: number;
      notes?: string;
    }>,
    updatedBy: string
  ): Promise<Contract | null> {
    const collection = await this.getContractsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
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
      name: result.name,
      clientId: result.clientId,
      clientName: result.clientName,
      status: result.status,
      startDate: result.startDate,
      endDate: result.endDate,
      mrr: result.mrr,
      services: result.services
    };
  }

  /**
   * Delete a contract
   */
  static async deleteContract(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getContractsCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId
    });

    return result.deletedCount > 0;
  }

  /**
   * Get billing statistics for organization
   */
  static async getBillingStats(orgId: string): Promise<BillingStats> {
    const contractsCollection = await this.getContractsCollection();
    const invoicesCollection = await this.getInvoicesCollection();

    // Get contract stats
    const contractStats = await contractsCollection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalMRR: { $sum: '$mrr' },
          activeContracts: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          expiredContracts: {
            $sum: { $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0] }
          },
          avgContractValue: { $avg: '$mrr' },
          totalAnnualValue: { $sum: { $multiply: ['$mrr', 12] } }
        }
      }
    ]).toArray();

    // Get pending renewals (contracts expiring in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const pendingRenewals = await contractsCollection.countDocuments({
      orgId,
      status: 'Active',
      endDate: { $lte: thirtyDaysFromNow.toISOString() }
    });

    // Get invoice stats
    const invoiceStats = await invoicesCollection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          unpaidInvoices: {
            $sum: { $cond: [{ $in: ['$status', ['sent', 'overdue']] }, 1, 0] }
          },
          totalOutstanding: {
            $sum: { $cond: [{ $in: ['$status', ['sent', 'overdue']] }, '$total', 0] }
          }
        }
      }
    ]).toArray();

    const contractResult = contractStats[0] || {
      totalMRR: 0,
      activeContracts: 0,
      expiredContracts: 0,
      avgContractValue: 0,
      totalAnnualValue: 0
    };

    const invoiceResult = invoiceStats[0] || {
      unpaidInvoices: 0,
      totalOutstanding: 0
    };

    return {
      totalMRR: contractResult.totalMRR,
      activeContracts: contractResult.activeContracts,
      pendingRenewals,
      expiredContracts: contractResult.expiredContracts,
      totalAnnualValue: contractResult.totalAnnualValue,
      avgContractValue: contractResult.avgContractValue || 0,
      billingAccuracy: 95, // TODO: Calculate based on actual vs billed amounts
      unpaidInvoices: invoiceResult.unpaidInvoices,
      totalOutstanding: invoiceResult.totalOutstanding
    };
  }

  /**
   * Get contracts by client
   */
  static async getContractsByClient(orgId: string, clientId: string): Promise<Contract[]> {
    const collection = await this.getContractsCollection();
    
    const contracts = await collection
      .find({ orgId, clientId })
      .sort({ createdAt: -1 })
      .toArray();

    return contracts.map(contract => ({
      id: contract._id!.toString(),
      name: contract.name,
      clientId: contract.clientId,
      clientName: contract.clientName,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      mrr: contract.mrr,
      services: contract.services
    }));
  }

  // Time Logging

  /**
   * Create a time log entry
   */
  static async createTimeLog(
    orgId: string,
    timeLogData: Omit<TimeLog, 'id'> & {
      contractId?: string;
      ticketId?: string;
    },
    createdBy: string
  ): Promise<TimeLog> {
    const collection = await this.getTimeLogsCollection();
    
    const now = new Date();
    const document: Omit<TimeLogDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      contractId: timeLogData.contractId,
      ticketId: timeLogData.ticketId,
      technician: timeLogData.technician,
      hours: timeLogData.hours,
      description: timeLogData.description,
      date: timeLogData.date,
      isBillable: timeLogData.isBillable
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      technician: document.technician,
      hours: document.hours,
      description: document.description,
      date: document.date,
      isBillable: document.isBillable
    };
  }

  /**
   * Get time logs for a contract
   */
  static async getTimeLogsByContract(
    orgId: string,
    contractId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeLog[]> {
    const collection = await this.getTimeLogsCollection();
    
    const query: any = { orgId, contractId };
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const timeLogs = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return timeLogs.map(log => ({
      id: log._id!.toString(),
      technician: log.technician,
      hours: log.hours,
      description: log.description,
      date: log.date,
      isBillable: log.isBillable
    }));
  }

  // SLA Management

  /**
   * Get all SLA policies for an organization
   */
  static async getSLAPolicies(orgId: string): Promise<SLAPolicyDocument[]> {
    const collection = await this.getSLAPoliciesCollection();
    
    const policies = await collection
      .find({ orgId, isActive: true })
      .sort({ name: 1 })
      .toArray();

    return policies;
  }

  /**
   * Create an SLA policy
   */
  static async createSLAPolicy(
    orgId: string,
    policyData: Omit<SLAPolicyDocument, '_id' | 'orgId' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<SLAPolicyDocument> {
    const collection = await this.getSLAPoliciesCollection();
    
    const now = new Date();
    const document: Omit<SLAPolicyDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      ...policyData,
      isActive: true
    };

    const result = await collection.insertOne(document);
    
    return {
      _id: result.insertedId,
      ...document
    };
  }

  // Invoice Management

  /**
   * Generate invoice for a contract
   */
  static async generateInvoice(
    orgId: string,
    contractId: string,
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    createdBy: string
  ): Promise<InvoiceDocument> {
    const contractsCollection = await this.getContractsCollection();
    const invoicesCollection = await this.getInvoicesCollection();
    
    // Get contract details
    const contract = await contractsCollection.findOne({
      _id: new ObjectId(contractId),
      orgId
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Generate invoice number
    const invoiceCount = await invoicesCollection.countDocuments({ orgId });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (contract.paymentTerms || 30));

    // Calculate line items from contract services
    const lineItems = contract.services.map(service => ({
      description: `${service.name} - ${service.description}`,
      quantity: service.quantity,
      rate: service.rate,
      total: service.total
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax rate - should be configurable
    const total = subtotal + tax;

    const document: Omit<InvoiceDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      invoiceNumber,
      contractId: contract._id!.toString(),
      clientId: contract.clientId,
      clientName: contract.clientName,
      billingPeriodStart,
      billingPeriodEnd,
      issueDate: now,
      dueDate,
      subtotal,
      tax,
      total,
      status: 'draft',
      lineItems
    };

    const result = await invoicesCollection.insertOne(document);
    
    return {
      _id: result.insertedId,
      ...document
    };
  }

  /**
   * Get invoices for a contract
   */
  static async getInvoicesByContract(orgId: string, contractId: string): Promise<InvoiceDocument[]> {
    const collection = await this.getInvoicesCollection();
    
    const invoices = await collection
      .find({ orgId, contractId })
      .sort({ issueDate: -1 })
      .toArray();

    return invoices;
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(
    orgId: string,
    invoiceId: string,
    status: InvoiceDocument['status'],
    updatedBy: string
  ): Promise<InvoiceDocument | null> {
    const collection = await this.getInvoicesCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(invoiceId), orgId },
      {
        $set: {
          status,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Track service usage in contract services
   */
  private static async trackServiceUsageInContract(orgId: string, services: any[]): Promise<void> {
    try {
      // Import here to avoid circular dependency
      const { ServiceCatalogueService } = await import('./service-catalogue');
      
      // Track usage for each service in the contract
      for (const service of services) {
        if (service.serviceId) {
          await ServiceCatalogueService.incrementPopularity(service.serviceId, orgId);
        }
      }
    } catch (error) {
      console.error('Failed to track service usage in contract:', error);
      // Don't throw - this is not critical to contract creation
    }
  }
}