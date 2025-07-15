import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const policies = await BillingService.getSLAPolicies(orgId);

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching SLA policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLA policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const policyData = await request.json();

    // Validate required fields
    if (!policyData.id || !policyData.name || !policyData.description || !policyData.targets) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, description, targets' },
        { status: 400 }
      );
    }

    // Validate targets
    if (!Array.isArray(policyData.targets) || policyData.targets.length === 0) {
      return NextResponse.json(
        { error: 'SLA policy must have at least one target' },
        { status: 400 }
      );
    }

    for (const target of policyData.targets) {
      if (!target.priority || !target.response_time_minutes || !target.resolution_time_minutes) {
        return NextResponse.json(
          { error: 'Each target must have priority, response_time_minutes, and resolution_time_minutes' },
          { status: 400 }
        );
      }
    }

    const policy = await BillingService.createSLAPolicy(orgId, policyData, userId);

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating SLA policy:', error);
    return NextResponse.json(
      { error: 'Failed to create SLA policy' },
      { status: 500 }
    );
  }
}