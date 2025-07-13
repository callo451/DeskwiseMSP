import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const rejectedBy = body.rejectedBy || 'system'; // TODO: Get from auth context
    const reason = body.reason;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const rejectedChangeRequest = await ChangeManagementService.reject(
      params.id,
      rejectedBy,
      reason
    );

    if (!rejectedChangeRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rejectedChangeRequest);
  } catch (error) {
    console.error('Error rejecting change request:', error);
    return NextResponse.json(
      { error: 'Failed to reject change request' },
      { status: 500 }
    );
  }
}