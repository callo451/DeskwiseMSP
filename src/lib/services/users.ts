import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface UserDocument {
  _id?: ObjectId;
  workosUserId: string; // WorkOS user ID
  workosOrgId: string; // WorkOS organization ID
  orgId: string; // Internal organization ID (same as workosOrgId for consistency)
  email: string;
  firstName?: string;
  lastName?: string;
  role: string; // admin, member, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDocument {
  _id?: ObjectId;
  workosOrgId: string; // WorkOS organization ID
  orgId: string; // Internal organization ID (same as workosOrgId for consistency)
  name: string;
  domains: string[];
  ownerId: string; // WorkOS user ID of the organization owner
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static async getUsersCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<UserDocument>('users');
  }

  private static async getOrganizationsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<OrganizationDocument>('organizations');
  }

  /**
   * Create or update user after WorkOS authentication
   */
  static async upsertUser(userData: {
    workosUserId: string;
    workosOrgId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<UserDocument> {
    const collection = await this.getUsersCollection();
    
    const now = new Date();
    const user: Partial<UserDocument> = {
      workosUserId: userData.workosUserId,
      workosOrgId: userData.workosOrgId,
      orgId: userData.workosOrgId, // Use WorkOS org ID as internal org ID
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'admin', // First user in org is admin
      updatedAt: now,
    };

    const result = await collection.findOneAndUpdate(
      { workosUserId: userData.workosUserId },
      {
        $set: user,
        $setOnInsert: { createdAt: now }
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );

    return result!;
  }

  /**
   * Create or update organization after WorkOS organization creation
   */
  static async upsertOrganization(orgData: {
    workosOrgId: string;
    name: string;
    domains?: string[];
    ownerId: string;
  }): Promise<OrganizationDocument> {
    const collection = await this.getOrganizationsCollection();
    
    const now = new Date();
    const organization: Partial<OrganizationDocument> = {
      workosOrgId: orgData.workosOrgId,
      orgId: orgData.workosOrgId, // Use WorkOS org ID as internal org ID
      name: orgData.name,
      domains: orgData.domains || [],
      ownerId: orgData.ownerId,
      updatedAt: now,
    };

    const result = await collection.findOneAndUpdate(
      { workosOrgId: orgData.workosOrgId },
      {
        $set: organization,
        $setOnInsert: { createdAt: now }
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );

    return result!;
  }

  /**
   * Get user by WorkOS user ID
   */
  static async getUserByWorkosId(workosUserId: string): Promise<UserDocument | null> {
    const collection = await this.getUsersCollection();
    return await collection.findOne({ workosUserId });
  }

  /**
   * Get organization by WorkOS organization ID
   */
  static async getOrganizationByWorkosId(workosOrgId: string): Promise<OrganizationDocument | null> {
    const collection = await this.getOrganizationsCollection();
    return await collection.findOne({ workosOrgId });
  }

  /**
   * Get all users in an organization
   */
  static async getUsersByOrganization(orgId: string): Promise<UserDocument[]> {
    const collection = await this.getUsersCollection();
    return await collection.find({ orgId }).toArray();
  }
}