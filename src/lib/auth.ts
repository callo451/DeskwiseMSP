import { withAuth, signOut, getSignInUrl } from '@workos-inc/authkit-nextjs'

export interface AuthContext {
  userId: string
  orgId: string
  orgRole?: string
  user: {
    id: string
    email?: string
    firstName?: string
    lastName?: string
  }
  organization?: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Get authenticated user context for API routes
 * Extracts user and organization information from WorkOS authentication
 */
export async function getAuthContext(): Promise<AuthContext> {
  const { user, organizationId, role } = await withAuth({ ensureSignedIn: true })
  
  if (!user) {
    throw new Error('Unauthorized - No authenticated user')
  }

  // Extract organization info from WorkOS session
  const orgId = organizationId
  const orgRole = role || 'member'
  
  console.log(`Auth context - User: ${user.id}, OrgId: ${orgId}, Role: ${orgRole}`)
  
  // Handle missing organization for development
  let finalOrgId = orgId
  if (!orgId) {
    console.warn(`No organization found for user ${user.id}. Using fallback organization for development.`)
    // Use user ID as fallback organization for development
    finalOrgId = `dev-org-${user.id}`
  }

  // For now, we'll create a mock organization object until we integrate proper WorkOS organizations
  const organization = {
    id: finalOrgId,
    name: `Organization ${finalOrgId}`,
    slug: finalOrgId,
  }

  return {
    userId: user.id,
    orgId: finalOrgId,
    orgRole,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    },
    organization,
  }
}

/**
 * Get organization ID for the current authenticated user
 * Throws error if user is not authenticated
 */
export async function getOrgId(): Promise<string> {
  const { orgId } = await getAuthContext()
  return orgId
}

/**
 * Get user ID for the current authenticated user
 * Throws error if user is not authenticated
 */
export async function getUserId(): Promise<string> {
  const { userId } = await getAuthContext()
  return userId
}

/**
 * Check if the current user has the required role in their organization
 * @param requiredRole - The minimum role required ('admin', 'member', etc.)
 */
export async function checkOrganizationRole(requiredRole: string): Promise<boolean> {
  try {
    const { orgRole } = await getAuthContext()
    
    // Define role hierarchy (adjust based on your needs)
    const roleHierarchy: Record<string, number> = {
      'member': 1,
      'admin': 2,
    }
    
    const userRoleLevel = roleHierarchy[orgRole || 'member'] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    return userRoleLevel >= requiredRoleLevel
  } catch {
    return false
  }
}

/**
 * Require specific organization role or throw error
 * @param requiredRole - The minimum role required
 */
export async function requireOrganizationRole(requiredRole: string): Promise<void> {
  const hasRole = await checkOrganizationRole(requiredRole)
  
  if (!hasRole) {
    throw new Error(`Insufficient permissions - ${requiredRole} role required`)
  }
}

/**
 * Sign out the current user
 */
export async function handleSignOut() {
  await signOut()
}

/**
 * Get sign in URL for redirecting to authentication
 */
export async function getAuthSignInUrl(returnTo?: string) {
  return await getSignInUrl({ redirectUri: returnTo })
}

// Re-export WorkOS utilities
export { withAuth, signOut, getSignInUrl } from '@workos-inc/authkit-nextjs'