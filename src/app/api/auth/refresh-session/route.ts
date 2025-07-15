import { NextRequest, NextResponse } from 'next/server'
import { signOut } from '@workos-inc/authkit-nextjs'

export async function POST(request: NextRequest) {
  try {
    // Force a session refresh by signing out and redirecting to sign in
    // This ensures WorkOS picks up the new organization membership
    await signOut()
    
    return NextResponse.json({ 
      success: true,
      redirectTo: '/auth/signin'
    })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}