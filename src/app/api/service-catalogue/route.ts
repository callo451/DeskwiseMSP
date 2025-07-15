import { NextRequest, NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
    const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined;
    const search = searchParams.get('search');

    let services;
    
    if (search) {
      services = await ServiceCatalogueService.search(orgId, search);
    } else {
      services = await ServiceCatalogueService.getAll(orgId, {
        category,
        type,
        isActive,
        tags
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching service catalogue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service catalogue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const serviceData = await request.json();

    // Validate required fields
    if (!serviceData.name || !serviceData.description || !serviceData.category || serviceData.price == null || !serviceData.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, price, type' },
        { status: 400 }
      );
    }

    // Validate price
    if (serviceData.price < 0) {
      return NextResponse.json(
        { error: 'Price must be non-negative' },
        { status: 400 }
      );
    }

    // Validate setup fee if provided
    if (serviceData.setupFee != null && serviceData.setupFee < 0) {
      return NextResponse.json(
        { error: 'Setup fee must be non-negative' },
        { status: 400 }
      );
    }

    // Validate minimum hours for hourly services
    if (serviceData.type === 'Hourly' && serviceData.minimumHours != null && serviceData.minimumHours < 0) {
      return NextResponse.json(
        { error: 'Minimum hours must be non-negative' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['Fixed', 'Recurring', 'Hourly'].includes(serviceData.type)) {
      return NextResponse.json(
        { error: 'Type must be Fixed, Recurring, or Hourly' },
        { status: 400 }
      );
    }

    // Validate billing frequency for recurring services
    if (serviceData.type === 'Recurring' && serviceData.billingFrequency && 
        !['Monthly', 'Quarterly', 'Annually'].includes(serviceData.billingFrequency)) {
      return NextResponse.json(
        { error: 'Billing frequency must be Monthly, Quarterly, or Annually' },
        { status: 400 }
      );
    }

    const service = await ServiceCatalogueService.create(orgId, serviceData, userId);

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}