import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ChangeManagementSettingsService } from '@/lib/services/change-management-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'approval_workflow' | 'risk_matrix' | 'change_category';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let data;
    switch (type) {
      case 'approval_workflow':
        data = await ChangeManagementSettingsService.getAllWorkflows(orgId);
        break;
      case 'risk_matrix':
        data = await ChangeManagementSettingsService.getAllRiskMatrices(orgId);
        break;
      case 'change_category':
        data = await ChangeManagementSettingsService.getAllCategories(orgId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching change management settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change management settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'approval_workflow' | 'risk_matrix' | 'change_category';
    const body = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let created;
    switch (type) {
      case 'approval_workflow':
        if (!body.name || !body.approvalSteps || !body.escalationRules) {
          return NextResponse.json(
            { error: 'Missing required fields: name, approvalSteps, escalationRules' },
            { status: 400 }
          );
        }
        created = await ChangeManagementSettingsService.createWorkflow(orgId, body, userId);
        break;
      case 'risk_matrix':
        if (!body.name || !body.riskLevels || !body.impactCategories || !body.calculationMethod) {
          return NextResponse.json(
            { error: 'Missing required fields: name, riskLevels, impactCategories, calculationMethod' },
            { status: 400 }
          );
        }
        created = await ChangeManagementSettingsService.createRiskMatrix(orgId, body, userId);
        break;
      case 'change_category':
        if (!body.name || !body.color || !body.icon) {
          return NextResponse.json(
            { error: 'Missing required fields: name, color, icon' },
            { status: 400 }
          );
        }
        created = await ChangeManagementSettingsService.createCategory(orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating change management setting:', error);
    return NextResponse.json(
      { error: 'Failed to create change management setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}