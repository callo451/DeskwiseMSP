import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const client = searchParams.get('client');
    const clientId = searchParams.get('clientId');
    const teamMember = searchParams.get('teamMember');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tag = searchParams.get('tag');

    const filters: any = {};
    
    if (status) filters.status = status;
    if (client) filters.client = client;
    if (clientId) filters.clientId = clientId;
    if (teamMember) filters.teamMember = teamMember;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (tag) filters.tag = tag;

    const projects = await ProjectsService.getAll(filters);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.client || !body.status || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, client, status, startDate, endDate' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context

    // Extract tasks and milestones
    const { tasks, milestones, ...projectData } = body;

    // Set default values
    const project = {
      ...projectData,
      clientId: projectData.clientId || projectData.client,
      progress: projectData.progress || 0,
      budget: projectData.budget || { total: 0, used: 0 },
      teamMembers: projectData.teamMembers || [],
      tags: projectData.tags || [],
    };

    const createdProject = await ProjectsService.create(
      project,
      createdBy,
      tasks,
      milestones
    );

    return NextResponse.json(createdProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}