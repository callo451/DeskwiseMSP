import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';

export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organization = await OrganizationService.getByWorkOSId(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Validate required fields
    if (updates.name && typeof updates.name !== 'string') {
      return NextResponse.json(
        { error: 'Organization name must be a string' },
        { status: 400 }
      );
    }

    if (updates.subdomain) {
      if (typeof updates.subdomain !== 'string') {
        return NextResponse.json(
          { error: 'Subdomain must be a string' },
          { status: 400 }
        );
      }

      // Validate subdomain format
      if (!/^[a-z0-9-]+$/.test(updates.subdomain)) {
        return NextResponse.json(
          { error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' },
          { status: 400 }
        );
      }

      // Check subdomain availability
      const isAvailable = await OrganizationService.isSubdomainAvailable(
        updates.subdomain,
        organizationId
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Subdomain is already taken' },
          { status: 409 }
        );
      }
    }

    const updatedOrganization = await OrganizationService.update(
      organizationId,
      updates,
      user.id
    );

    if (!updatedOrganization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organization: updatedOrganization,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}