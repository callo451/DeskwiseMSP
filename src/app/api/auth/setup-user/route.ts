import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { UserService } from '@/lib/services/users';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Try to get user without requiring organization membership
    const { user } = await withAuth();
    
    if (!user) {
      console.error('No authenticated user found in setup');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    if (!user.email) {
      console.error('User email is required for organization setup');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Check if user already has an organization
    const existingUser = await UserService.getUserByWorkosId(user.id);
    if (existingUser?.orgId && existingUser.orgId !== 'setup-pending') {
      console.log(`User ${user.id} already has organization ${existingUser.orgId}`);
      return NextResponse.json({ 
        success: true, 
        organizationId: existingUser.orgId,
        message: 'User already has organization' 
      });
    }

    // Generate organization name
    const emailDomain = user.email.split('@')[1];
    const organizationName = emailDomain ? 
      emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1) :
      `${user.firstName || user.email.split('@')[0]}'s Organization`;
    
    console.log(`Creating organization: ${organizationName} for user: ${user.id}`);

    // Create WorkOS organization
    const organization = await workos.organizations.createOrganization({
      name: organizationName,
      domainData: [], // Will be configured later through Admin Portal
    });

    console.log(`Created WorkOS organization: ${organization.id}`);

    // Add user to the organization
    await workos.userManagement.createOrganizationMembership({
      userId: user.id,
      organizationId: organization.id,
      roleSlug: 'admin', // First user is admin
    });

    console.log(`Added user ${user.id} to organization ${organization.id} as admin`);

    // Store organization in MongoDB
    await UserService.upsertOrganization({
      workosOrgId: organization.id,
      name: organizationName,
      ownerId: user.id,
    });

    console.log(`Stored organization ${organization.id} in MongoDB`);

    // Store/update user in MongoDB
    await UserService.upsertUser({
      workosUserId: user.id,
      workosOrgId: organization.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: 'admin',
    });

    console.log(`Stored user ${user.id} in MongoDB with organization ${organization.id}`);

    // Wait a moment for WorkOS to process the membership
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the membership was created
    try {
      const memberships = await workos.userManagement.listOrganizationMemberships({
        userId: user.id,
      });
      
      const membership = memberships.data.find(m => m.organizationId === organization.id);
      if (!membership) {
        console.warn('Organization membership not found immediately after creation');
      } else {
        console.log('Organization membership verified:', membership.id);
      }
    } catch (error) {
      console.warn('Could not verify membership:', error);
    }

    return NextResponse.json({ 
      success: true, 
      organizationId: organization.id,
      organizationName,
      message: 'User and organization setup completed successfully',
      requiresSessionRefresh: true
    });

  } catch (error) {
    console.error('Error setting up user:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to setup user and organization';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        errorMessage = 'Organization already exists';
        statusCode = 409;
      } else if (error.message.includes('invalid') || error.message.includes('unauthorized')) {
        errorMessage = 'Authentication error';
        statusCode = 401;
      } else if (error.message.includes('required')) {
        errorMessage = 'Missing required information';
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: statusCode }
    );
  }
}