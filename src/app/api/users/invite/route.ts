import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { email, roleId } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Send invitation through WorkOS
    const invitation = await workos.userManagement.sendInvitation({
      email,
      organizationId,
      inviterUserId: user.id,
      ...(roleId && { roleSlug: roleId }),
    });

    return NextResponse.json({
      invitation,
      message: 'Invitation sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    
    // Handle specific WorkOS errors
    if (error.code === 'user_already_exists') {
      return NextResponse.json(
        { error: 'User with this email already exists in the organization' },
        { status: 409 }
      );
    }
    
    if (error.code === 'invitation_already_pending') {
      return NextResponse.json(
        { error: 'Invitation already pending for this email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}