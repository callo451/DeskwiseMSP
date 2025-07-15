import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const clientId = searchParams.get('clientId');
    const clientName = searchParams.get('clientName');
    
    const filters = {
      ...(status?.length && { status }),
      ...(clientId && { clientId }),
      ...(clientName && { clientName })
    };
    
    const quotes = await QuotesService.getAll(orgId, filters);

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const quoteData = await request.json();

    // Validate required fields
    if (!quoteData.subject || !quoteData.clientId || !quoteData.clientName) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, clientId, clientName' },
        { status: 400 }
      );
    }

    // Validate line items
    if (!quoteData.lineItems || !Array.isArray(quoteData.lineItems) || quoteData.lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Quote must have at least one line item' },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of quoteData.lineItems) {
      if (!item.serviceId || !item.name || item.quantity <= 0 || item.price < 0) {
        return NextResponse.json(
          { error: 'Invalid line item data' },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const total = quoteData.lineItems.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.price), 0
    );

    // Set default dates if not provided
    const now = new Date();
    const createdDate = quoteData.createdDate || now.toISOString();
    const expiryDate = quoteData.expiryDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

    const quote = await QuotesService.create(orgId, {
      ...quoteData,
      total,
      createdDate,
      expiryDate,
      status: quoteData.status || 'Draft'
    }, userId);

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}