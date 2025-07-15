import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get user details to get their email
    const userDetails = await workos.userManagement.getUser(id);

    // Resend invitation through WorkOS
    const invitation = await workos.userManagement.sendInvitation({
      email: userDetails.email,
      organizationId,
      inviterUserId: user.id,
    });

    return NextResponse.json({
      invitation,
      message: 'Invitation resent successfully',
    });
  } catch (error: any) {
    console.error('Error resending invitation:', error);
    
    if (error.code === 'user_not_found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'user_already_active') {
      return NextResponse.json(
        { error: 'User is already active in the organization' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}