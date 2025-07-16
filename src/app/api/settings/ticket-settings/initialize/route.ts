import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketSettingsService } from '@/lib/services/ticket-settings';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting ticket settings initialization...');
    
    const { orgId, userId } = await getAuthContext();
    console.log('Auth context:', { orgId, userId });
    
    console.log('Calling TicketSettingsService.initializeDefaults...');
    
    // Test MongoDB connection first
    const clientPromise = await import('@/lib/mongodb').then(m => m.default);
    const client = await clientPromise;
    const db = client.db('deskwise');
    console.log('MongoDB connection successful');
    
    const { queues, statuses, priorities } = await TicketSettingsService.initializeDefaults(orgId, userId);
    
    console.log('Initialization completed:', { 
      queueCount: queues.length, 
      statusCount: statuses.length, 
      priorityCount: priorities.length 
    });

    return NextResponse.json({
      queues,
      statuses,
      priorities,
      message: `Initialized ${queues.length} default queues, ${statuses.length} default statuses, and ${priorities.length} default priorities`
    });
  } catch (error) {
    console.error('Error initializing default ticket settings:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to initialize default ticket settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}