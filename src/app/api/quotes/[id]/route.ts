import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes';
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
    
    const quote = await QuotesService.getById(id, orgId);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
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

    // Recalculate total if line items are updated
    if (updates.lineItems) {
      updates.total = updates.lineItems.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.price), 0
      );
    }

    const quote = await QuotesService.update(id, orgId, updates, userId);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
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

    const success = await QuotesService.delete(id, orgId);

    if (!success) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}