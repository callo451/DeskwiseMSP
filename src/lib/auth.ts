import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthContext {
  userId: string;
  orgId: string;
  orgRole?: string;
  user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Get authenticated user context for API routes
 * Extracts user and organization information from Clerk authentication
 */
export async function getAuthContext(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized - No authenticated user');
  }

  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized - User not found');
  }

  // Require organization membership for B2B SaaS
  if (!orgId) {
    throw new Error('Organization required - User must be a member of an organization');
  }

  // Get organization details from user's active organization
  const organization = user.organizationMemberships?.find(
    membership => membership.organization.id === orgId
  )?.organization;

  if (!organization) {
    throw new Error('Organization not found - User is not a member of the active organization');
  }

  return {
    userId,
    orgId,
    orgRole,
    user: {
      id: userId,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
  };
}

/**
 * Get organization ID for the current authenticated user
 * Throws error if user is not authenticated
 */
export async function getOrgId(): Promise<string> {
  const { orgId } = await getAuthContext();
  return orgId;
}

/**
 * Get user ID for the current authenticated user
 * Throws error if user is not authenticated
 */
export async function getUserId(): Promise<string> {
  const { userId } = await getAuthContext();
  return userId;
}

/**
 * Check if the current user has the required role in their organization
 * @param requiredRole - The minimum role required ('admin', 'basic_member', etc.)
 */
export async function checkOrganizationRole(requiredRole: string): Promise<boolean> {
  try {
    const { orgRole } = await getAuthContext();
    
    // Define role hierarchy (adjust based on your needs)
    const roleHierarchy: Record<string, number> = {
      'basic_member': 1,
      'admin': 2,
    };
    
    const userRoleLevel = roleHierarchy[orgRole || 'basic_member'] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  } catch {
    return false;
  }
}

/**
 * Require specific organization role or throw error
 * @param requiredRole - The minimum role required
 */
export async function requireOrganizationRole(requiredRole: string): Promise<void> {
  const hasRole = await checkOrganizationRole(requiredRole);
  
  if (!hasRole) {
    throw new Error(`Insufficient permissions - ${requiredRole} role required`);
  }
}