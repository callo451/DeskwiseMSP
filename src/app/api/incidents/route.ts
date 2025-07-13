import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isPublished = searchParams.get('isPublished');
    const affectedClient = searchParams.get('affectedClient');
    const affectedService = searchParams.get('affectedService');

    const filters: any = {};
    
    if (status) filters.status = status;
    if (isPublished !== null) filters.isPublished = isPublished === 'true';
    if (affectedClient) filters.affectedClient = affectedClient;
    if (affectedService) filters.affectedService = affectedService;

    const incidents = await IncidentService.getAll(filters);
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, status' },
        { status: 400 }
      );
    }

    // Extract initial update if provided
    const { initialUpdate, ...incidentData } = body;
    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context

    // Set default values
    const incident = {
      ...incidentData,
      startedAt: incidentData.startedAt || new Date().toISOString(),
      isPublished: incidentData.isPublished || false,
      affectedServices: incidentData.affectedServices || [],
      affectedClients: incidentData.affectedClients || [],
    };

    let initialUpdateData = null;
    if (initialUpdate && initialUpdate.message) {
      initialUpdateData = {
        status: incident.status,
        message: initialUpdate.message,
        timestamp: new Date().toISOString(),
      };
    }

    const createdIncident = await IncidentService.create(
      incident,
      createdBy,
      initialUpdateData
    );

    return NextResponse.json(createdIncident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}