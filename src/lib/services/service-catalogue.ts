import clientPromise from '@/lib/mongodb';
import { Collection, ObjectId } from 'mongodb';
import type { ServiceCatalogueItem } from '@/lib/types';

// MongoDB Document Interface
interface ServiceCatalogueDocument {
  _id?: ObjectId;
  orgId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  type: 'Fixed' | 'Recurring' | 'Hourly';
  isActive: boolean;
  tags?: string[];
  billingFrequency?: 'Monthly' | 'Quarterly' | 'Annually'; // For recurring services
  minimumHours?: number; // For hourly services
  setupFee?: number; // One-time setup cost
  popularity: number; // Usage count for recommendations
  lastUsedAt?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Service Catalogue Item with additional metadata
export interface ServiceCatalogueItemExtended extends ServiceCatalogueItem {
  tags?: string[];
  billingFrequency?: 'Monthly' | 'Quarterly' | 'Annually';
  minimumHours?: number;
  setupFee?: number;
  popularity: number;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service Catalogue Statistics
export interface ServiceCatalogueStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  categoryCounts: { category: string; count: number }[];
  typeCounts: { type: string; count: number }[];
  averagePrice: number;
  totalRevenuePotential: number; // Sum of all recurring service prices
  mostPopularServices: { name: string; popularity: number }[];
}

// Service Category Statistics
export interface ServiceCategoryStats {
  category: string;
  serviceCount: number;
  averagePrice: number;
  totalRevenue: number;
  popularityScore: number;
}

export class ServiceCatalogueService {
  /**
   * Get service catalogue collection
   */
  private static async getCollection(): Promise<Collection<ServiceCatalogueDocument>> {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<ServiceCatalogueDocument>('service_catalogue');
  }

  /**
   * Get all service catalogue items for an organization
   */
  static async getAll(
    orgId: string,
    filters?: {
      category?: string;
      type?: string;
      isActive?: boolean;
      tags?: string[];
    }
  ): Promise<ServiceCatalogueItemExtended[]> {
    const collection = await this.getCollection();
    
    const query: any = { orgId };
    
    if (filters?.category) {
      query.category = filters.category;
    }
    
    if (filters?.type) {
      query.type = filters.type;
    }
    
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const services = await collection
      .find(query)
      .sort({ category: 1, popularity: -1, name: 1 })
      .toArray();

    return services.map(service => ({
      id: service._id!.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type,
      tags: service.tags,
      billingFrequency: service.billingFrequency,
      minimumHours: service.minimumHours,
      setupFee: service.setupFee,
      popularity: service.popularity,
      lastUsedAt: service.lastUsedAt?.toISOString(),
      isActive: service.isActive,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString()
    }));
  }

  /**
   * Get active services only (for dropdowns, quotes, etc.)
   */
  static async getActive(orgId: string): Promise<ServiceCatalogueItem[]> {
    const services = await this.getAll(orgId, { isActive: true });
    return services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type
    }));
  }

  /**
   * Get service catalogue item by ID
   */
  static async getById(id: string, orgId: string): Promise<ServiceCatalogueItemExtended | null> {
    const collection = await this.getCollection();
    
    const service = await collection.findOne({
      _id: new ObjectId(id),
      orgId
    });

    if (!service) return null;

    return {
      id: service._id!.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type,
      tags: service.tags,
      billingFrequency: service.billingFrequency,
      minimumHours: service.minimumHours,
      setupFee: service.setupFee,
      popularity: service.popularity,
      lastUsedAt: service.lastUsedAt?.toISOString(),
      isActive: service.isActive,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString()
    };
  }

  /**
   * Create a new service catalogue item
   */
  static async create(
    orgId: string,
    serviceData: Omit<ServiceCatalogueItemExtended, 'id' | 'popularity' | 'isActive' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ServiceCatalogueItemExtended> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<ServiceCatalogueDocument, '_id'> = {
      orgId,
      name: serviceData.name,
      description: serviceData.description,
      category: serviceData.category,
      price: serviceData.price,
      type: serviceData.type,
      tags: serviceData.tags || [],
      billingFrequency: serviceData.billingFrequency,
      minimumHours: serviceData.minimumHours,
      setupFee: serviceData.setupFee,
      popularity: 0,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(document);
    
    return {
      id: result.insertedId.toString(),
      name: document.name,
      description: document.description,
      category: document.category,
      price: document.price,
      type: document.type,
      tags: document.tags,
      billingFrequency: document.billingFrequency,
      minimumHours: document.minimumHours,
      setupFee: document.setupFee,
      popularity: document.popularity,
      isActive: document.isActive,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    };
  }

  /**
   * Update a service catalogue item
   */
  static async update(
    id: string,
    orgId: string,
    updates: Partial<Omit<ServiceCatalogueItemExtended, 'id' | 'popularity' | 'createdAt' | 'updatedAt'>>,
    updatedBy: string
  ): Promise<ServiceCatalogueItemExtended | null> {
    const collection = await this.getCollection();
    
    const updateFields: any = {
      ...updates,
      updatedBy,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), orgId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id!.toString(),
      name: result.name,
      description: result.description,
      category: result.category,
      price: result.price,
      type: result.type,
      tags: result.tags,
      billingFrequency: result.billingFrequency,
      minimumHours: result.minimumHours,
      setupFee: result.setupFee,
      popularity: result.popularity,
      lastUsedAt: result.lastUsedAt?.toISOString(),
      isActive: result.isActive,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    };
  }

  /**
   * Delete a service catalogue item (soft delete)
   */
  static async delete(id: string, orgId: string, updatedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id), orgId },
      {
        $set: {
          isActive: false,
          updatedBy,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Restore a deleted service catalogue item
   */
  static async restore(id: string, orgId: string, updatedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id), orgId },
      {
        $set: {
          isActive: true,
          updatedBy,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Increment service popularity when used in quotes/contracts
   */
  static async incrementPopularity(id: string, orgId: string): Promise<void> {
    const collection = await this.getCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(id), orgId },
      {
        $inc: { popularity: 1 },
        $set: { lastUsedAt: new Date() }
      }
    );
  }

  /**
   * Get service catalogue statistics
   */
  static async getStats(orgId: string): Promise<ServiceCatalogueStats> {
    const collection = await this.getCollection();

    const stats = await collection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveServices: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalRevenuePotential: {
            $sum: { $cond: [{ $eq: ['$type', 'Recurring'] }, '$price', 0] }
          }
        }
      }
    ]).toArray();

    // Get category counts
    const categoryCounts = await collection.aggregate([
      { $match: { orgId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get type counts
    const typeCounts = await collection.aggregate([
      { $match: { orgId, isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get most popular services
    const mostPopularServices = await collection.aggregate([
      { $match: { orgId, isActive: true } },
      { $sort: { popularity: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          popularity: 1
        }
      }
    ]).toArray();

    const result = stats[0] || {
      totalServices: 0,
      activeServices: 0,
      inactiveServices: 0,
      averagePrice: 0,
      totalRevenuePotential: 0
    };

    return {
      totalServices: result.totalServices,
      activeServices: result.activeServices,
      inactiveServices: result.inactiveServices,
      categoryCounts: categoryCounts.map(c => ({ category: c._id, count: c.count })),
      typeCounts: typeCounts.map(t => ({ type: t._id, count: t.count })),
      averagePrice: result.averagePrice || 0,
      totalRevenuePotential: result.totalRevenuePotential,
      mostPopularServices: mostPopularServices.map(s => ({ name: s.name, popularity: s.popularity }))
    };
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(orgId: string): Promise<ServiceCategoryStats[]> {
    const collection = await this.getCollection();

    const categoryStats = await collection.aggregate([
      { $match: { orgId, isActive: true } },
      {
        $group: {
          _id: '$category',
          serviceCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalRevenue: { $sum: '$price' },
          popularityScore: { $sum: '$popularity' }
        }
      },
      { $sort: { serviceCount: -1 } }
    ]).toArray();

    return categoryStats.map(stat => ({
      category: stat._id,
      serviceCount: stat.serviceCount,
      averagePrice: stat.averagePrice,
      totalRevenue: stat.totalRevenue,
      popularityScore: stat.popularityScore
    }));
  }

  /**
   * Search services by name, description, or category
   */
  static async search(orgId: string, query: string): Promise<ServiceCatalogueItem[]> {
    const collection = await this.getCollection();
    
    const services = await collection
      .find({
        orgId,
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .sort({ popularity: -1, name: 1 })
      .toArray();

    return services.map(service => ({
      id: service._id!.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type
    }));
  }

  /**
   * Get services by category
   */
  static async getByCategory(orgId: string, category: string): Promise<ServiceCatalogueItem[]> {
    const collection = await this.getCollection();
    
    const services = await collection
      .find({ orgId, category, isActive: true })
      .sort({ popularity: -1, name: 1 })
      .toArray();

    return services.map(service => ({
      id: service._id!.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type
    }));
  }

  /**
   * Get unique categories for an organization
   */
  static async getCategories(orgId: string): Promise<string[]> {
    const collection = await this.getCollection();
    
    const categories = await collection.distinct('category', { orgId, isActive: true });
    
    return categories.sort();
  }

  /**
   * Get unique tags for an organization
   */
  static async getTags(orgId: string): Promise<string[]> {
    const collection = await this.getCollection();
    
    const tags = await collection.distinct('tags', { orgId, isActive: true });
    
    return tags.sort();
  }

  /**
   * Bulk import services from default catalogue
   */
  static async bulkImport(
    orgId: string,
    services: Omit<ServiceCatalogueItemExtended, 'id' | 'popularity' | 'isActive' | 'createdAt' | 'updatedAt'>[],
    createdBy: string
  ): Promise<ServiceCatalogueItemExtended[]> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const documents: Omit<ServiceCatalogueDocument, '_id'>[] = services.map(service => ({
      orgId,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      type: service.type,
      tags: service.tags || [],
      billingFrequency: service.billingFrequency,
      minimumHours: service.minimumHours,
      setupFee: service.setupFee,
      popularity: 0,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now
    }));

    const result = await collection.insertMany(documents);
    
    return documents.map((doc, index) => ({
      id: result.insertedIds[index].toString(),
      name: doc.name,
      description: doc.description,
      category: doc.category,
      price: doc.price,
      type: doc.type,
      tags: doc.tags,
      billingFrequency: doc.billingFrequency,
      minimumHours: doc.minimumHours,
      setupFee: doc.setupFee,
      popularity: doc.popularity,
      isActive: doc.isActive,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));
  }
}