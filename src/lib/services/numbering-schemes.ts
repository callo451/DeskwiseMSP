import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export type ModuleType = 'tickets' | 'changes' | 'assets' | 'articles' | 'incidents' | 'projects';

export interface NumberingSchemeDocument {
  _id?: ObjectId;
  // Organization multi-tenancy
  orgId: string;
  
  // Module identification
  moduleType: ModuleType;
  
  // Scheme configuration
  prefix: string;
  suffix: string;
  startNumber: number;
  currentNumber: number;
  paddingLength: number; // e.g., 5 for 00001, 4 for 0001
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface NumberingSchemeExtended extends Omit<NumberingSchemeDocument, '_id'> {
  id: string;
  lastGeneratedId: string;
  nextId: string;
}

export interface NumberingSchemeCreateInput {
  moduleType: ModuleType;
  prefix: string;
  suffix: string;
  startNumber?: number;
  paddingLength?: number;
}

export interface NumberingSchemeUpdateInput {
  prefix?: string;
  suffix?: string;
  startNumber?: number;
  paddingLength?: number;
  isActive?: boolean;
}

export class NumberingSchemesService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<NumberingSchemeDocument>('numbering_schemes');
  }

  /**
   * Get all numbering schemes for an organization
   */
  static async getAll(orgId: string): Promise<NumberingSchemeExtended[]> {
    const collection = await this.getCollection();
    
    const schemes = await collection
      .find({ 
        orgId, 
        isDeleted: { $ne: true } 
      })
      .sort({ moduleType: 1 })
      .toArray();

    return schemes.map(scheme => this.transformToExtended(scheme));
  }

  /**
   * Get numbering scheme by module type
   */
  static async getByModule(orgId: string, moduleType: ModuleType): Promise<NumberingSchemeExtended | null> {
    const collection = await this.getCollection();
    
    const scheme = await collection.findOne({
      orgId,
      moduleType,
      isDeleted: { $ne: true }
    });

    if (!scheme) return null;
    return this.transformToExtended(scheme);
  }

  /**
   * Create new numbering scheme
   */
  static async create(
    orgId: string,
    schemeData: NumberingSchemeCreateInput,
    createdBy: string
  ): Promise<NumberingSchemeExtended> {
    const collection = await this.getCollection();
    
    // Check if scheme already exists for this module
    const existing = await collection.findOne({
      orgId,
      moduleType: schemeData.moduleType,
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new Error(`Numbering scheme already exists for ${schemeData.moduleType}`);
    }

    const now = new Date();
    const document: Omit<NumberingSchemeDocument, '_id'> = {
      orgId,
      moduleType: schemeData.moduleType,
      prefix: schemeData.prefix,
      suffix: schemeData.suffix,
      startNumber: schemeData.startNumber || 1,
      currentNumber: schemeData.startNumber || 1,
      paddingLength: schemeData.paddingLength || 5,
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
      throw new Error('Failed to retrieve created numbering scheme');
    }

    return this.transformToExtended(created);
  }

  /**
   * Update numbering scheme
   */
  static async update(
    orgId: string,
    moduleType: ModuleType,
    updates: NumberingSchemeUpdateInput,
    updatedBy: string
  ): Promise<NumberingSchemeExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { 
        orgId, 
        moduleType, 
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
    return this.transformToExtended(result);
  }

  /**
   * Generate next ID for a module
   */
  static async generateNextId(orgId: string, moduleType: ModuleType): Promise<string> {
    const collection = await this.getCollection();
    
    // Get the scheme and increment the counter atomically
    const result = await collection.findOneAndUpdate(
      { 
        orgId, 
        moduleType, 
        isActive: true, 
        isDeleted: { $ne: true } 
      },
      {
        $inc: { currentNumber: 1 },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      // If no scheme exists, create a default one
      const defaultScheme = await this.createDefaultScheme(orgId, moduleType, 'system');
      return this.formatId(defaultScheme.prefix, defaultScheme.currentNumber, defaultScheme.suffix, defaultScheme.paddingLength);
    }

    return this.formatId(result.prefix, result.currentNumber, result.suffix, result.paddingLength);
  }

  /**
   * Preview what an ID would look like
   */
  static async previewId(orgId: string, moduleType: ModuleType, prefix: string, suffix: string, paddingLength: number = 5): Promise<string> {
    const collection = await this.getCollection();
    
    // Get current number or use 1
    const scheme = await collection.findOne({
      orgId,
      moduleType,
      isDeleted: { $ne: true }
    });

    const nextNumber = scheme ? scheme.currentNumber + 1 : 1;
    return this.formatId(prefix, nextNumber, suffix, paddingLength);
  }

  /**
   * Reset numbering scheme counter
   */
  static async resetCounter(
    orgId: string,
    moduleType: ModuleType,
    newStartNumber: number,
    updatedBy: string
  ): Promise<NumberingSchemeExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { 
        orgId, 
        moduleType, 
        isDeleted: { $ne: true } 
      },
      {
        $set: {
          currentNumber: newStartNumber,
          startNumber: newStartNumber,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    return this.transformToExtended(result);
  }

  /**
   * Get numbering statistics
   */
  static async getStats(orgId: string): Promise<{
    totalSchemes: number;
    activeSchemes: number;
    moduleStats: Array<{
      moduleType: ModuleType;
      currentNumber: number;
      totalGenerated: number;
      lastGenerated: Date;
    }>;
  }> {
    const collection = await this.getCollection();
    
    const schemes = await collection
      .find({ orgId, isDeleted: { $ne: true } })
      .toArray();

    const totalSchemes = schemes.length;
    const activeSchemes = schemes.filter(s => s.isActive).length;

    const moduleStats = schemes.map(scheme => ({
      moduleType: scheme.moduleType,
      currentNumber: scheme.currentNumber,
      totalGenerated: scheme.currentNumber - scheme.startNumber,
      lastGenerated: scheme.updatedAt
    }));

    return {
      totalSchemes,
      activeSchemes,
      moduleStats
    };
  }

  /**
   * Initialize default numbering schemes for an organization
   */
  static async initializeDefaults(orgId: string, createdBy: string): Promise<NumberingSchemeExtended[]> {
    const defaultSchemes: NumberingSchemeCreateInput[] = [
      { moduleType: 'tickets', prefix: 'TKT-', suffix: '', startNumber: 1, paddingLength: 5 },
      { moduleType: 'changes', prefix: 'CHG-', suffix: '', startNumber: 1, paddingLength: 5 },
      { moduleType: 'assets', prefix: 'AST-', suffix: '', startNumber: 1, paddingLength: 5 },
      { moduleType: 'articles', prefix: 'KB-', suffix: '', startNumber: 1, paddingLength: 5 },
      { moduleType: 'incidents', prefix: 'INC-', suffix: '', startNumber: 1, paddingLength: 5 },
      { moduleType: 'projects', prefix: 'PROJ-', suffix: '', startNumber: 1, paddingLength: 5 }
    ];

    const results = [];
    for (const scheme of defaultSchemes) {
      try {
        const existing = await this.getByModule(orgId, scheme.moduleType);
        if (!existing) {
          const created = await this.create(orgId, scheme, createdBy);
          results.push(created);
        }
      } catch (error) {
        console.error(`Failed to create default scheme for ${scheme.moduleType}:`, error);
      }
    }

    return results;
  }

  /**
   * Soft delete numbering scheme
   */
  static async delete(orgId: string, moduleType: ModuleType, deletedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { orgId, moduleType },
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
   * Private helper methods
   */
  private static transformToExtended(scheme: NumberingSchemeDocument): NumberingSchemeExtended {
    const lastGeneratedId = this.formatId(scheme.prefix, scheme.currentNumber, scheme.suffix, scheme.paddingLength);
    const nextId = this.formatId(scheme.prefix, scheme.currentNumber + 1, scheme.suffix, scheme.paddingLength);

    return {
      id: scheme._id!.toString(),
      orgId: scheme.orgId,
      moduleType: scheme.moduleType,
      prefix: scheme.prefix,
      suffix: scheme.suffix,
      startNumber: scheme.startNumber,
      currentNumber: scheme.currentNumber,
      paddingLength: scheme.paddingLength,
      isActive: scheme.isActive,
      createdBy: scheme.createdBy,
      updatedBy: scheme.updatedBy,
      createdAt: scheme.createdAt,
      updatedAt: scheme.updatedAt,
      isDeleted: scheme.isDeleted,
      deletedAt: scheme.deletedAt,
      lastGeneratedId,
      nextId
    };
  }

  private static formatId(prefix: string, number: number, suffix: string, paddingLength: number): string {
    const paddedNumber = number.toString().padStart(paddingLength, '0');
    return `${prefix}${paddedNumber}${suffix}`;
  }

  private static async createDefaultScheme(
    orgId: string,
    moduleType: ModuleType,
    createdBy: string
  ): Promise<NumberingSchemeDocument> {
    const collection = await this.getCollection();
    
    const defaultPrefixes: Record<ModuleType, string> = {
      tickets: 'TKT-',
      changes: 'CHG-',
      assets: 'AST-',
      articles: 'KB-',
      incidents: 'INC-',
      projects: 'PROJ-'
    };

    const now = new Date();
    const document: Omit<NumberingSchemeDocument, '_id'> = {
      orgId,
      moduleType,
      prefix: defaultPrefixes[moduleType],
      suffix: '',
      startNumber: 1,
      currentNumber: 1,
      paddingLength: 5,
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
      throw new Error('Failed to create default numbering scheme');
    }

    return created;
  }
}