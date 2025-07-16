import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing ticket settings API...');
    
    const { orgId, userId } = await getAuthContext();
    console.log('Auth context:', { orgId, userId });
    
    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db('deskwise');
    console.log('MongoDB connection successful');
    
    // Test collection access
    const collection = db.collection('ticket_queue_settings');
    const count = await collection.countDocuments({ orgId });
    console.log('Queue collection count for org:', count);

    return NextResponse.json({
      status: 'OK',
      auth: { orgId, userId },
      mongodb: 'Connected',
      queueCount: count
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}