import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface OrganizationDocument {
  _id?: ObjectId;
  // WorkOS integration
  workosOrgId: string;
  workosEnvId?: string;
  
  // Organization details
  name: string;
  subdomain: string;
  domain?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  timeZone: string;
  
  // Application configuration
  isInternalITMode: boolean;
  enabledModules: Record<string, boolean>;
  
  // Branding
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCss?: string;
  
  // Contact information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  website?: string;
  
  // Billing and subscription
  billingEmail?: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  billingCycle: 'monthly' | 'yearly';
  
  // Feature flags
  features: {
    ssoEnabled: boolean;
    directorySyncEnabled: boolean;
    auditLogsEnabled: boolean;
    apiAccessEnabled: boolean;
    customFieldsEnabled: boolean;
    advancedReportingEnabled: boolean;
    whiteLabeling: boolean;
  };
  
  // Settings
  settings: {
    defaultTicketPriority: 'Low' | 'Medium' | 'High' | 'Critical';
    autoAssignTickets: boolean;
    requireTicketApproval: boolean;
    allowClientPortalAccess: boolean;
    maintenanceMode: boolean;
    dataRetentionDays: number;
    maxUsersAllowed: number;
    maxStorageGB: number;
  };
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface OrganizationExtended extends Omit<OrganizationDocument, '_id'> {
  id: string;
  userCount: number;
  ticketCount: number;
  assetCount: number;
  lastActivity: Date;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalTickets: number;
  openTickets: number;
  totalAssets: number;
  totalProjects: number;
  storageUsedGB: number;
  apiCallsThisMonth: number;
}

export class OrganizationService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection<OrganizationDocument>('organizations');
  }

  /**
   * Get organization by WorkOS organization ID
   */
  static async getByWorkOSId(workosOrgId: string): Promise<OrganizationExtended | null> {
    const collection = await this.getCollection();
    
    const org = await collection.findOne({
      workosOrgId,
      isDeleted: { $ne: true }
    });

    if (!org) return null;

    // Get additional statistics
    const stats = await this.getStats(org._id!.toString());

    return {
      id: org._id!.toString(),
      workosOrgId: org.workosOrgId,
      workosEnvId: org.workosEnvId,
      name: org.name,
      subdomain: org.subdomain,
      domain: org.domain,
      industry: org.industry,
      size: org.size,
      timeZone: org.timeZone,
      isInternalITMode: org.isInternalITMode,
      enabledModules: org.enabledModules,
      logo: org.logo,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      customCss: org.customCss,
      address: org.address,
      phone: org.phone,
      website: org.website,
      billingEmail: org.billingEmail,
      subscriptionTier: org.subscriptionTier,
      subscriptionStatus: org.subscriptionStatus,
      billingCycle: org.billingCycle,
      features: org.features,
      settings: org.settings,
      createdBy: org.createdBy,
      updatedBy: org.updatedBy,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      isDeleted: org.isDeleted,
      deletedAt: org.deletedAt,
      userCount: stats.totalUsers,
      ticketCount: stats.totalTickets,
      assetCount: stats.totalAssets,
      lastActivity: new Date() // TODO: Calculate actual last activity
    };
  }

  /**
   * Create new organization
   */
  static async create(
    workosOrgId: string,
    organizationData: Partial<Omit<OrganizationDocument, '_id' | 'workosOrgId' | 'createdAt' | 'updatedAt'>>,
    createdBy: string
  ): Promise<OrganizationExtended> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const document: Omit<OrganizationDocument, '_id'> = {
      workosOrgId,
      name: organizationData.name || 'My Organization',
      subdomain: organizationData.subdomain || this.generateSubdomain(organizationData.name || 'my-org'),
      timeZone: organizationData.timeZone || 'UTC',
      isInternalITMode: organizationData.isInternalITMode || false,
      enabledModules: organizationData.enabledModules || this.getDefaultEnabledModules(),
      subscriptionTier: organizationData.subscriptionTier || 'starter',
      subscriptionStatus: organizationData.subscriptionStatus || 'trial',
      billingCycle: organizationData.billingCycle || 'monthly',
      features: organizationData.features || this.getDefaultFeatures(),
      settings: organizationData.settings || this.getDefaultSettings(),
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      ...organizationData
    };

    const result = await collection.insertOne(document);
    
    const created = await this.getByWorkOSId(workosOrgId);
    if (!created) {
      throw new Error('Failed to retrieve created organization');
    }

    return created;
  }

  /**
   * Update organization
   */
  static async update(
    workosOrgId: string,
    updates: Partial<Omit<OrganizationDocument, '_id' | 'workosOrgId' | 'createdAt' | 'createdBy'>>,
    updatedBy: string
  ): Promise<OrganizationExtended | null> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { workosOrgId, isDeleted: { $ne: true } },
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

    return this.getByWorkOSId(workosOrgId);
  }

  /**
   * Update enabled modules
   */
  static async updateEnabledModules(
    workosOrgId: string,
    enabledModules: Record<string, boolean>,
    updatedBy: string
  ): Promise<OrganizationExtended | null> {
    return this.update(workosOrgId, { enabledModules }, updatedBy);
  }

  /**
   * Toggle Internal IT mode
   */
  static async toggleInternalITMode(
    workosOrgId: string,
    isInternalITMode: boolean,
    updatedBy: string
  ): Promise<OrganizationExtended | null> {
    return this.update(workosOrgId, { isInternalITMode }, updatedBy);
  }

  /**
   * Update branding
   */
  static async updateBranding(
    workosOrgId: string,
    branding: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      customCss?: string;
    },
    updatedBy: string
  ): Promise<OrganizationExtended | null> {
    return this.update(workosOrgId, branding, updatedBy);
  }

  /**
   * Get organization statistics
   */
  static async getStats(orgId: string): Promise<OrganizationStats> {
    const client = await clientPromise;
    const db = client.db('deskwise');

    // Run parallel queries for better performance
    const [
      userStats,
      ticketStats,
      assetStats,
      projectStats
    ] = await Promise.all([
      // User statistics
      db.collection('users').aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  { $gte: ['$lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Ticket statistics
      db.collection('tickets').aggregate([
        { $match: { orgId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Open', 'In Progress', 'Pending']] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Asset statistics
      db.collection('assets').countDocuments({ orgId, isDeleted: { $ne: true } }),

      // Project statistics
      db.collection('projects').countDocuments({ orgId, isDeleted: { $ne: true } })
    ]);

    return {
      totalUsers: userStats[0]?.total || 0,
      activeUsers: userStats[0]?.active || 0,
      totalTickets: ticketStats[0]?.total || 0,
      openTickets: ticketStats[0]?.open || 0,
      totalAssets: assetStats || 0,
      totalProjects: projectStats || 0,
      storageUsedGB: 0, // TODO: Calculate actual storage usage
      apiCallsThisMonth: 0 // TODO: Implement API call tracking
    };
  }

  /**
   * Check subdomain availability
   */
  static async isSubdomainAvailable(subdomain: string, excludeWorkOSId?: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const query: any = {
      subdomain,
      isDeleted: { $ne: true }
    };

    if (excludeWorkOSId) {
      query.workosOrgId = { $ne: excludeWorkOSId };
    }

    const existing = await collection.findOne(query);
    return !existing;
  }

  /**
   * Generate unique subdomain
   */
  private static generateSubdomain(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }

  /**
   * Get default enabled modules
   */
  private static getDefaultEnabledModules(): Record<string, boolean> {
    return {
      dashboard: true,
      tickets: true,
      incidents: true,
      assets: true,
      inventory: true,
      knowledge: true,
      projects: true,
      scheduling: true,
      change: true,
      reports: true,
      settings: true,
      // MSP-specific modules (disabled by default for Internal IT)
      clients: false,
      contacts: false,
      billing: false,
      quotes: false,
      contracts: false,
      service_catalog: false
    };
  }

  /**
   * Get default features
   */
  private static getDefaultFeatures() {
    return {
      ssoEnabled: false,
      directorySyncEnabled: false,
      auditLogsEnabled: false,
      apiAccessEnabled: false,
      customFieldsEnabled: false,
      advancedReportingEnabled: false,
      whiteLabeling: false
    };
  }

  /**
   * Get default settings
   */
  private static getDefaultSettings() {
    return {
      defaultTicketPriority: 'Medium' as const,
      autoAssignTickets: false,
      requireTicketApproval: false,
      allowClientPortalAccess: true,
      maintenanceMode: false,
      dataRetentionDays: 365,
      maxUsersAllowed: 25,
      maxStorageGB: 10
    };
  }

  /**
   * Soft delete organization
   */
  static async delete(workosOrgId: string, deletedBy: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { workosOrgId },
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
   * Restore organization
   */
  static async restore(workosOrgId: string, restoredBy: string): Promise<OrganizationExtended | null> {
    const collection = await this.getCollection();
    
    await collection.findOneAndUpdate(
      { workosOrgId, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          updatedBy: restoredBy,
          updatedAt: new Date()
        },
        $unset: {
          deletedAt: 1
        }
      }
    );

    return this.getByWorkOSId(workosOrgId);
  }
}