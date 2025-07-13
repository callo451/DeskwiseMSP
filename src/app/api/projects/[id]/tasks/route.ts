import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await ProjectsService.getProjectTasks(params.id);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.status || !body.assigneeId || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, status, assigneeId, dueDate' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || 'system'; // TODO: Get from auth context

    const task = {
      ...body,
      dependsOn: body.dependsOn || [],
    };

    const createdTask = await ProjectsService.addTask(
      params.id,
      task,
      createdBy
    );

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}