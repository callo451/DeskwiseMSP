import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { OrganizationService } from '@/lib/services/organization';

/**
 * GET  /api/settings/modules  -> returns enabledModules map & Internal IT mode flag
 * PUT  /api/settings/modules  -> updates enabledModules map
 */
export async function GET(_req: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const org = await OrganizationService.getByWorkOSId(orgId);

    if (!org) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabledModules: org.enabledModules,
      isInternalITMode: org.isInternalITMode,
    });
  } catch (err: any) {
    console.error('GET /api/settings/modules error', err);
    return NextResponse.json({ message: err.message ?? 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const body = await req.json();
    const { enabledModules } = body as { enabledModules: Record<string, boolean> };

    if (!enabledModules || typeof enabledModules !== 'object') {
      return NextResponse.json({ message: 'Invalid enabledModules' }, { status: 400 });
    }

    const updated = await OrganizationService.updateEnabledModules(orgId, enabledModules, userId);

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({
      enabledModules: updated.enabledModules,
      isInternalITMode: updated.isInternalITMode,
    });
  } catch (err: any) {
    console.error('PUT /api/settings/modules error', err);
    return NextResponse.json({ message: err.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
