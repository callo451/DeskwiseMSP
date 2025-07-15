import { NextResponse } from 'next/server'
import { signOut } from '@workos-inc/authkit-nextjs'

export async function GET() {
  try {
    await signOut()
    // After sign out, redirect to sign in to get fresh session
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.replace('/auth/callback', '') || 'http://localhost:9002'))
  } catch (error) {
    console.error('Error during signout:', error)
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.replace('/auth/callback', '') || 'http://localhost:9002'))
  }
}