import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { UserService } from '@/lib/services/users';

export async function GET(request: NextRequest) {
  try {
    // Get user without requiring organization (since we're checking if they have one)
    const { user } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log(`Checking setup for user: ${user.id}`);

    // Check if user exists in MongoDB with an organization
    const existingUser = await UserService.getUserByWorkosId(user.id);
    
    if (existingUser && existingUser.orgId && existingUser.orgId !== 'setup-pending') {
      console.log(`User ${user.id} has organization in MongoDB: ${existingUser.orgId}`);
      return NextResponse.json({ 
        hasOrganization: true,
        organizationId: existingUser.orgId,
        message: 'User has existing organization in database'
      });
    }

    console.log(`User ${user.id} does not have organization setup`);
    return NextResponse.json({ 
      hasOrganization: false,
      message: 'User needs to complete organization setup'
    });

  } catch (error) {
    console.error('Error checking setup:', error);
    return NextResponse.json(
      { 
        hasOrganization: false,
        error: 'Failed to check setup status'
      },
      { status: 500 }
    );
  }
}