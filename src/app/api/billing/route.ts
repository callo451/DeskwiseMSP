import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const clientId = searchParams.get('clientId');
    const clientName = searchParams.get('clientName');
    const expiringInDays = searchParams.get('expiringInDays');
    
    const filters = {
      ...(status?.length && { status }),
      ...(clientId && { clientId }),
      ...(clientName && { clientName }),
      ...(expiringInDays && { expiringInDays: parseInt(expiringInDays) })
    };
    
    const contracts = await BillingService.getAllContracts(orgId, filters);

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const contractData = await request.json();

    // Validate required fields
    if (!contractData.name || !contractData.clientId || !contractData.clientName) {
      return NextResponse.json(
        { error: 'Missing required fields: name, clientId, clientName' },
        { status: 400 }
      );
    }

    // Validate services
    if (!contractData.services || !Array.isArray(contractData.services) || contractData.services.length === 0) {
      return NextResponse.json(
        { error: 'Contract must have at least one service' },
        { status: 400 }
      );
    }

    // Validate each service
    for (const service of contractData.services) {
      if (!service.name || service.quantity <= 0 || service.rate < 0) {
        return NextResponse.json(
          { error: 'Invalid service data' },
          { status: 400 }
        );
      }
    }

    // Calculate MRR from services
    const mrr = contractData.services.reduce((sum: number, service: any) => 
      sum + (service.quantity * service.rate), 0
    );

    // Set default dates if not provided
    const now = new Date();
    const startDate = contractData.startDate || now.toISOString().split('T')[0];
    const endDate = contractData.endDate || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];

    const contract = await BillingService.createContract(orgId, {
      ...contractData,
      mrr,
      startDate,
      endDate,
      status: contractData.status || 'Active'
    }, userId);

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}