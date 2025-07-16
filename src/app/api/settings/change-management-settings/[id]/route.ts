import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ChangeManagementSettingsService } from '@/lib/services/change-management-settings';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'approval_workflow' | 'risk_matrix' | 'change_category';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    // For this implementation, we'll return null for individual gets
    // In a real implementation, you'd add getById methods to the service
    return NextResponse.json(
      { error: 'Individual item retrieval not implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error fetching change management setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change management setting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'approval_workflow' | 'risk_matrix' | 'change_category';
    const body = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let updated;
    switch (type) {
      case 'approval_workflow':
        updated = await ChangeManagementSettingsService.updateWorkflow(id, orgId, body, userId);
        break;
      case 'risk_matrix':
        updated = await ChangeManagementSettingsService.updateRiskMatrix(id, orgId, body, userId);
        break;
      case 'change_category':
        updated = await ChangeManagementSettingsService.updateCategory(id, orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Change management setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating change management setting:', error);
    return NextResponse.json(
      { error: 'Failed to update change management setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'approval_workflow' | 'risk_matrix' | 'change_category';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let deleted;
    switch (type) {
      case 'approval_workflow':
        deleted = await ChangeManagementSettingsService.deleteWorkflow(id, orgId, userId);
        break;
      case 'risk_matrix':
        deleted = await ChangeManagementSettingsService.deleteRiskMatrix(id, orgId, userId);
        break;
      case 'change_category':
        deleted = await ChangeManagementSettingsService.deleteCategory(id, orgId, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Change management setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting change management setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete change management setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}