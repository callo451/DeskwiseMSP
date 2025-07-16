import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { AssetSettingsService } from '@/lib/services/asset-settings';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting asset settings initialization...');
    
    const { orgId, userId } = await getAuthContext();
    console.log('Auth context:', { orgId, userId });
    
    console.log('Calling AssetSettingsService.initializeDefaults...');
    
    // Test MongoDB connection first
    const clientPromise = await import('@/lib/mongodb').then(m => m.default);
    const client = await clientPromise;
    const db = client.db('deskwise');
    console.log('MongoDB connection successful');
    
    const { categories, statuses, maintenanceSchedules } = await AssetSettingsService.initializeDefaults(orgId, userId);
    
    console.log('Initialization completed:', { 
      categoryCount: categories.length, 
      statusCount: statuses.length, 
      maintenanceScheduleCount: maintenanceSchedules.length 
    });

    return NextResponse.json({
      categories,
      statuses,
      maintenanceSchedules,
      message: `Initialized ${categories.length} default categories, ${statuses.length} default statuses, and ${maintenanceSchedules.length} default maintenance schedules`
    });
  } catch (error) {
    console.error('Error initializing default asset settings:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to initialize default asset settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}