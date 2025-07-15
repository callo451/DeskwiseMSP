import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract organization ID from authentication context
    // For now, using a placeholder - this would be extracted from WorkOS user context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    // Parse filters from query parameters
    const filters: any = {};
    
    const category = searchParams.get('category');
    if (category) {
      filters.category = category.split(',');
    }
    
    const owner = searchParams.get('owner');
    if (owner) {
      filters.owner = owner.split(',');
    }
    
    const location = searchParams.get('location');
    if (location) {
      filters.location = location;
    }
    
    const lowStock = searchParams.get('lowStock');
    if (lowStock === 'true') {
      filters.lowStock = true;
    }
    
    const outOfStock = searchParams.get('outOfStock');
    if (outOfStock === 'true') {
      filters.outOfStock = true;
    }
    
    const includeDeleted = searchParams.get('includeDeleted');
    if (includeDeleted === 'true') {
      filters.includeDeleted = true;
    }
    
    const search = searchParams.get('search');
    if (search) {
      const items = await InventoryService.search(orgId, search);
      return NextResponse.json(items);
    }
    
    const items = await InventoryService.getAll(orgId, filters);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const createdBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (!data.sku || !data.name || !data.category || !data.owner || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: sku, name, category, owner, location' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Hardware', 'Software License', 'Consumable', 'Part'];
    if (!validCategories.includes(data.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof data.reorderPoint !== 'number' || data.reorderPoint < 0) {
      return NextResponse.json(
        { error: 'Reorder point must be a non-negative number' },
        { status: 400 }
      );
    }

    if (data.unitCost !== undefined && (typeof data.unitCost !== 'number' || data.unitCost < 0)) {
      return NextResponse.json(
        { error: 'Unit cost must be a non-negative number' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const itemData = { ...data };
    if (data.warrantyInfo?.startDate) {
      itemData.warrantyInfo = {
        ...data.warrantyInfo,
        startDate: new Date(data.warrantyInfo.startDate),
        endDate: data.warrantyInfo.endDate ? new Date(data.warrantyInfo.endDate) : undefined
      };
    }
    if (data.purchaseInfo?.purchaseDate) {
      itemData.purchaseInfo = {
        ...data.purchaseInfo,
        purchaseDate: new Date(data.purchaseInfo.purchaseDate)
      };
    }

    const item = await InventoryService.create(orgId, itemData, createdBy);
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}