import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { InventorySettingsService } from '@/lib/services/inventory-settings';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting inventory settings initialization...');
    
    const { orgId, userId } = await getAuthContext();
    console.log('Auth context:', { orgId, userId });
    
    console.log('Calling InventorySettingsService.initializeDefaults...');
    
    // Test MongoDB connection first
    const clientPromise = await import('@/lib/mongodb').then(m => m.default);
    const client = await clientPromise;
    const db = client.db('deskwise');
    console.log('MongoDB connection successful');
    
    const { categories, locations, suppliers } = await InventorySettingsService.initializeDefaults(orgId, userId);
    
    console.log('Initialization completed:', { 
      categoryCount: categories.length, 
      locationCount: locations.length, 
      supplierCount: suppliers.length 
    });

    return NextResponse.json({
      categories,
      locations,
      suppliers,
      message: `Initialized ${categories.length} default categories, ${locations.length} default locations, and ${suppliers.length} default suppliers`
    });
  } catch (error) {
    console.error('Error initializing default inventory settings:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to initialize default inventory settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}