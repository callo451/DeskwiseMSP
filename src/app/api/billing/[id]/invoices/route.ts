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
    
    const invoices = await BillingService.getInvoicesByContract(orgId, id);

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { billingPeriodStart, billingPeriodEnd } = await request.json();

    // Validate required fields
    if (!billingPeriodStart || !billingPeriodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: billingPeriodStart, billingPeriodEnd' },
        { status: 400 }
      );
    }

    const invoice = await BillingService.generateInvoice(
      orgId,
      id,
      new Date(billingPeriodStart),
      new Date(billingPeriodEnd),
      userId
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}