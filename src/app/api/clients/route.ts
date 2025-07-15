import { NextRequest, NextResponse } from 'next/server';
import { ClientsService } from '@/lib/services/clients';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const clients = await ClientsService.getAll(orgId);

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const clientData = await request.json();

    // Validate required fields
    if (!clientData.name || !clientData.industry || !clientData.status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, status' },
        { status: 400 }
      );
    }

    // Validate main contact
    if (!clientData.mainContact?.name || !clientData.mainContact?.email) {
      return NextResponse.json(
        { error: 'Main contact name and email are required' },
        { status: 400 }
      );
    }

    const client = await ClientsService.create(orgId, clientData, userId);

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}