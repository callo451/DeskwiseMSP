import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getAuthContext } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    
    const contract = await BillingService.getContractById(id, orgId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const updates = await request.json();

    // Recalculate MRR if services are updated
    if (updates.services) {
      updates.mrr = updates.services.reduce((sum: number, service: any) => 
        sum + (service.quantity * service.rate), 0
      );
    }

    const contract = await BillingService.updateContract(id, orgId, updates, userId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;

    const success = await BillingService.deleteContract(id, orgId);

    if (!success) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}