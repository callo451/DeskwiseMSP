import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const approvedBy = body.approvedBy || 'system'; // TODO: Get from auth context
    const reason = body.reason;

    const approvedChangeRequest = await ChangeManagementService.approve(
      params.id,
      approvedBy,
      reason
    );

    if (!approvedChangeRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(approvedChangeRequest);
  } catch (error) {
    console.error('Error approving change request:', error);
    return NextResponse.json(
      { error: 'Failed to approve change request' },
      { status: 500 }
    );
  }
}