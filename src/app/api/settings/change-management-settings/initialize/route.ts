import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ChangeManagementSettingsService } from '@/lib/services/change-management-settings';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting change management settings initialization...');
    
    const { orgId, userId } = await getAuthContext();
    console.log('Auth context:', { orgId, userId });
    
    console.log('Calling ChangeManagementSettingsService.initializeDefaults...');
    
    // Test MongoDB connection first
    const clientPromise = await import('@/lib/mongodb').then(m => m.default);
    const client = await clientPromise;
    const db = client.db('deskwise');
    console.log('MongoDB connection successful');
    
    const { workflows, riskMatrices, categories } = await ChangeManagementSettingsService.initializeDefaults(orgId, userId);
    
    console.log('Initialization completed:', { 
      workflowCount: workflows.length, 
      riskMatrixCount: riskMatrices.length, 
      categoryCount: categories.length 
    });

    return NextResponse.json({
      workflows,
      riskMatrices,
      categories,
      message: `Initialized ${workflows.length} workflows, ${riskMatrices.length} risk matrices, and ${categories.length} categories`
    });
  } catch (error) {
    console.error('Error initializing default change management settings:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to initialize default change management settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}