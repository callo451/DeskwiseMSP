import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Quote, QuoteLineItem, ServiceCatalogueItem } from '@/lib/types';

export interface QuoteDocument extends Omit<Quote, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCatalogueDocument extends Omit<ServiceCatalogueItem, 'id'> {
  _id?: ObjectId;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuoteStats {
  totalQuotes: number;
  draftQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  totalValue: number;
  acceptedValue: number;
  avgQuoteValue: number;
  conversionRate: number;
}

export interface QuoteMetrics {
  quoteId: string;
  subject: string;
  clientName: string;
  status: Quote['status'];
  total: number;
  createdDate: string;
  expiryDate: string;
  daysToExpiry: number;
  lineItemCount: number;
}

export class QuotesService {
  private static async getQuotesCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<QuoteDocument>('quotes');
  }

  private static async getServiceCatalogueCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ServiceCatalogueDocument>('service_catalogue');
  }

  private static async getClientsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('clients');
  }

  /**
   * Get all quotes for an organization
   */
  static async getAll(orgId: string, filters?: {
    status?: string[];
    clientId?: string;
    clientName?: string;
  }): Promise<Quote[]> {
    const collection = await this.getQuotesCollection();
    
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

    const quotes = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return quotes.map(quote => ({
      id: quote._id!.toString(),
      subject: quote.subject,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: quote.status,
      createdDate: quote.createdDate,
      expiryDate: quote.expiryDate,
      total: quote.total,
      lineItems: quote.lineItems
    }));
  }

  /**
   * Get quote by ID
   */
  static async getById(id: string, orgId: string): Promise<Quote | null> {
    const collection = await this.getQuotesCollection();
    
    const quote = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (!quote) return null;

    return {
      id: quote._id!.toString(),
      subject: quote.subject,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: quote.status,
      createdDate: quote.createdDate,
      expiryDate: quote.expiryDate,
      total: quote.total,
      lineItems: quote.lineItems
    };
  }

  /**
   * Create a new quote
   */
  static async create(
    orgId: string,
    quoteData: Omit<Quote, 'id'>,
    createdBy: string
  ): Promise<Quote> {
    const collection = await this.getQuotesCollection();
    
    const now = new Date();
    const document: Omit<QuoteDocument, '_id'> = {
      orgId,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      subject: quoteData.subject,
      clientId: quoteData.clientId,
      clientName: quoteData.clientName,
      status: quoteData.status,
      createdDate: quoteData.createdDate,
      expiryDate: quoteData.expiryDate,
      total: quoteData.total,
      lineItems: quoteData.lineItems
    };

    const result = await collection.insertOne(document);
    
    // Track service usage for popularity analytics
    await this.trackServiceUsageInQuote(orgId, quoteData.lineItems);
    
    return {
      id: result.insertedId.toString(),
      subject: document.subject,
      clientId: document.clientId,
      clientName: document.clientName,
      status: document.status,
      createdDate: document.createdDate,
      expiryDate: document.expiryDate,
      total: document.total,
      lineItems: document.lineItems
    };
  }

  /**
   * Update a quote
   */
  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<Quote, 'id'>>,
    updatedBy: string
  ): Promise<Quote | null> {
    const collection = await this.getQuotesCollection();
    
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
      subject: result.subject,
      clientId: result.clientId,
      clientName: result.clientName,
      status: result.status,
      createdDate: result.createdDate,
      expiryDate: result.expiryDate,
      total: result.total,
      lineItems: result.lineItems
    };
  }

  /**
   * Delete a quote
   */
  static async delete(id: string, orgId: string): Promise<boolean> {
    const collection = await this.getQuotesCollection();
    
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      orgId
    });

    return result.deletedCount > 0;
  }

  /**
   * Get quote statistics for organization
   */
  static async getStats(orgId: string): Promise<QuoteStats> {
    const collection = await this.getQuotesCollection();

    const stats = await collection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalQuotes: { $sum: 1 },
          draftQuotes: {
            $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] }
          },
          sentQuotes: {
            $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] }
          },
          acceptedQuotes: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          },
          rejectedQuotes: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          totalValue: { $sum: '$total' },
          acceptedValue: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, '$total', 0] }
          },
          avgQuoteValue: { $avg: '$total' }
        }
      }
    ]).toArray();

    const result = stats[0] || {
      totalQuotes: 0,
      draftQuotes: 0,
      sentQuotes: 0,
      acceptedQuotes: 0,
      rejectedQuotes: 0,
      totalValue: 0,
      acceptedValue: 0,
      avgQuoteValue: 0
    };

    const conversionRate = result.sentQuotes > 0 
      ? (result.acceptedQuotes / result.sentQuotes) * 100 
      : 0;

    return {
      totalQuotes: result.totalQuotes,
      draftQuotes: result.draftQuotes,
      sentQuotes: result.sentQuotes,
      acceptedQuotes: result.acceptedQuotes,
      rejectedQuotes: result.rejectedQuotes,
      totalValue: result.totalValue,
      acceptedValue: result.acceptedValue,
      avgQuoteValue: result.avgQuoteValue || 0,
      conversionRate
    };
  }

  /**
   * Get quote metrics with additional calculated fields
   */
  static async getQuoteMetrics(orgId: string): Promise<QuoteMetrics[]> {
    const collection = await this.getQuotesCollection();

    const quotes = await collection.find({ orgId }).toArray();

    return quotes.map(quote => {
      const expiryDate = new Date(quote.expiryDate);
      const today = new Date();
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        quoteId: quote._id!.toString(),
        subject: quote.subject,
        clientName: quote.clientName,
        status: quote.status,
        total: quote.total,
        createdDate: quote.createdDate,
        expiryDate: quote.expiryDate,
        daysToExpiry,
        lineItemCount: quote.lineItems.length
      };
    });
  }

  /**
   * Search quotes by subject or client name
   */
  static async search(orgId: string, query: string): Promise<Quote[]> {
    const collection = await this.getQuotesCollection();
    
    const quotes = await collection
      .find({
        orgId,
        $or: [
          { subject: { $regex: query, $options: 'i' } },
          { clientName: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    return quotes.map(quote => ({
      id: quote._id!.toString(),
      subject: quote.subject,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: quote.status,
      createdDate: quote.createdDate,
      expiryDate: quote.expiryDate,
      total: quote.total,
      lineItems: quote.lineItems
    }));
  }

  /**
   * Get quotes by status
   */
  static async getByStatus(orgId: string, status: Quote['status']): Promise<Quote[]> {
    const collection = await this.getQuotesCollection();
    
    const quotes = await collection
      .find({ orgId, status })
      .sort({ createdAt: -1 })
      .toArray();

    return quotes.map(quote => ({
      id: quote._id!.toString(),
      subject: quote.subject,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: quote.status,
      createdDate: quote.createdDate,
      expiryDate: quote.expiryDate,
      total: quote.total,
      lineItems: quote.lineItems
    }));
  }

  /**
   * Get quotes by client
   */
  static async getByClient(orgId: string, clientId: string): Promise<Quote[]> {
    const collection = await this.getQuotesCollection();
    
    const quotes = await collection
      .find({ orgId, clientId })
      .sort({ createdAt: -1 })
      .toArray();

    return quotes.map(quote => ({
      id: quote._id!.toString(),
      subject: quote.subject,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: quote.status,
      createdDate: quote.createdDate,
      expiryDate: quote.expiryDate,
      total: quote.total,
      lineItems: quote.lineItems
    }));
  }

  /**
   * Update quote status
   */
  static async updateStatus(
    id: string,
    orgId: string,
    status: Quote['status'],
    updatedBy: string
  ): Promise<Quote | null> {
    const collection = await this.getQuotesCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      {
        $set: {
          status,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id!.toString(),
      subject: result.subject,
      clientId: result.clientId,
      clientName: result.clientName,
      status: result.status,
      createdDate: result.createdDate,
      expiryDate: result.expiryDate,
      total: result.total,
      lineItems: result.lineItems
    };
  }

  // Service Catalogue Methods (delegated to ServiceCatalogueService)

  /**
   * Get all service catalogue items for an organization
   */
  static async getServiceCatalogue(orgId: string): Promise<ServiceCatalogueItem[]> {
    // Import here to avoid circular dependency
    const { ServiceCatalogueService } = await import('./service-catalogue');
    return ServiceCatalogueService.getActive(orgId);
  }

  /**
   * Create a service catalogue item
   */
  static async createService(
    orgId: string,
    serviceData: Omit<ServiceCatalogueItem, 'id'>,
    createdBy: string
  ): Promise<ServiceCatalogueItem> {
    // Import here to avoid circular dependency
    const { ServiceCatalogueService } = await import('./service-catalogue');
    const result = await ServiceCatalogueService.create(orgId, serviceData, createdBy);
    
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      category: result.category,
      price: result.price,
      type: result.type
    };
  }

  /**
   * Update a service catalogue item
   */
  static async updateService(
    id: string,
    orgId: string,
    updates: Partial<Omit<ServiceCatalogueItem, 'id'>>,
    updatedBy: string
  ): Promise<ServiceCatalogueItem | null> {
    // Import here to avoid circular dependency
    const { ServiceCatalogueService } = await import('./service-catalogue');
    const result = await ServiceCatalogueService.update(id, orgId, updates, updatedBy);
    
    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      category: result.category,
      price: result.price,
      type: result.type
    };
  }

  /**
   * Delete a service catalogue item (soft delete)
   */
  static async deleteService(id: string, orgId: string, updatedBy: string): Promise<boolean> {
    // Import here to avoid circular dependency
    const { ServiceCatalogueService } = await import('./service-catalogue');
    return ServiceCatalogueService.delete(id, orgId, updatedBy);
  }

  /**
   * Get service catalogue item by ID
   */
  static async getServiceById(id: string, orgId: string): Promise<ServiceCatalogueItem | null> {
    // Import here to avoid circular dependency
    const { ServiceCatalogueService } = await import('./service-catalogue');
    const result = await ServiceCatalogueService.getById(id, orgId);
    
    if (!result || !result.isActive) return null;

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      category: result.category,
      price: result.price,
      type: result.type
    };
  }

  /**
   * Track service usage for popularity
   */
  static async trackServiceUsage(serviceId: string, orgId: string): Promise<void> {
    try {
      // Import here to avoid circular dependency
      const { ServiceCatalogueService } = await import('./service-catalogue');
      await ServiceCatalogueService.incrementPopularity(serviceId, orgId);
    } catch (error) {
      console.error('Failed to track service usage:', error);
      // Don't throw - this is not critical to quote creation
    }
  }

  /**
   * Track service usage in quote line items
   */
  private static async trackServiceUsageInQuote(orgId: string, lineItems: any[]): Promise<void> {
    // Track usage for each service in the quote line items
    for (const item of lineItems) {
      if (item.serviceId) {
        await this.trackServiceUsage(item.serviceId, orgId);
      }
    }
  }
}