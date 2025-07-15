import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export interface WorkOSUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'pending';
  role?: {
    slug: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkOSRole {
  id: string;
  name: string;
  description?: string;
  type: 'environment_role' | 'organization_role';
  createdAt: string;
  updatedAt: string;
}

export class WorkOSService {
  /**
   * Get all users and memberships for an organization
   */
  static async getOrganizationUsersAndMemberships(organizationId: string): Promise<{
    users: WorkOSUser[];
    memberships: OrganizationMembership[];
  }> {
    try {
      // Fetch organization members from WorkOS
      const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
        organizationId,
      });

      // Extract unique user IDs
      const userIds = [...new Set(memberships.map(m => m.userId))];
      
      // Fetch user details for each user
      const users = await Promise.all(
        userIds.map(async (userId) => {
          try {
            return await workos.userManagement.getUser(userId);
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null users (failed fetches)
      const validUsers = users.filter(user => user !== null) as WorkOSUser[];

      return {
        users: validUsers,
        memberships: memberships as OrganizationMembership[],
      };
    } catch (error) {
      console.error('Error fetching organization users and memberships:', error);
      throw error;
    }
  }

  /**
   * Get roles for an organization
   */
  static async getOrganizationRoles(organizationId: string): Promise<WorkOSRole[]> {
    try {
      const { data: roles } = await workos.userManagement.listRoles({
        organizationId,
      });

      return roles as WorkOSRole[];
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      throw error;
    }
  }

  /**
   * Invite a user to an organization
   */
  static async inviteUser({
    email,
    organizationId,
    inviterUserId,
    roleSlug,
  }: {
    email: string;
    organizationId: string;
    inviterUserId: string;
    roleSlug?: string;
  }) {
    try {
      const invitation = await workos.userManagement.sendInvitation({
        email,
        organizationId,
        inviterUserId,
        ...(roleSlug && { roleSlug }),
      });

      return invitation;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }

  /**
   * Remove user from organization
   */
  static async removeUserFromOrganization(userId: string, organizationId: string) {
    try {
      // Get user's organization membership first
      const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
        userId,
        organizationId,
      });

      if (memberships.length === 0) {
        throw new Error('User is not a member of this organization');
      }

      // Remove user from organization
      await workos.userManagement.deleteOrganizationMembership(memberships[0].id);

      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }
  }

  /**
   * Update user role in organization
   */
  static async updateUserRole(userId: string, organizationId: string, roleSlug: string) {
    try {
      // Get user's organization membership first
      const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
        userId,
        organizationId,
      });

      if (memberships.length === 0) {
        throw new Error('User is not a member of this organization');
      }

      // Update the membership with new role
      const updatedMembership = await workos.userManagement.updateOrganizationMembership({
        organizationMembershipId: memberships[0].id,
        roleSlug,
      });

      return updatedMembership;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Create organization role
   */
  static async createRole({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }) {
    try {
      const role = await workos.userManagement.createRole({
        name,
        description,
      });

      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update organization role
   */
  static async updateRole({
    roleId,
    name,
    description,
  }: {
    roleId: string;
    name?: string;
    description?: string;
  }) {
    try {
      const updatedRole = await workos.userManagement.updateRole({
        roleId,
        ...(name && { name }),
        ...(description && { description }),
      });

      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete organization role
   */
  static async deleteRole(roleId: string) {
    try {
      await workos.userManagement.deleteRole(roleId);
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Generate admin portal link
   */
  static async generateAdminPortalLink({
    organizationId,
    intent,
    returnUrl,
  }: {
    organizationId: string;
    intent: string;
    returnUrl?: string;
  }) {
    try {
      const portalLink = await workos.portal.generateLink({
        organization: organizationId,
        intent,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/users?tab=identity`,
      });

      return portalLink;
    } catch (error) {
      console.error('Error generating admin portal link:', error);
      throw error;
    }
  }
}

export default WorkOSService;