import { NextRequest, NextResponse } from 'next/server';
import { seedIncidents } from '@/lib/seed-incidents';

export async function POST(request: NextRequest) {
  try {
    await seedIncidents();
    return NextResponse.json({ message: 'Incidents seeded successfully' });
  } catch (error) {
    console.error('Error seeding incidents:', error);
    return NextResponse.json(
      { error: 'Failed to seed incidents' },
      { status: 500 }
    );
  }
}