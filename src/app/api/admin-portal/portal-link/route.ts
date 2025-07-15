import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { WorkOSService } from '@/lib/services/workos'

export async function POST(request: NextRequest) {
  try {
    const { user, organizationId: sessionOrgId } = await withAuth({ ensureSignedIn: true })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { organizationId, intent } = await request.json()

    console.log('Portal link request:', { organizationId, intent, sessionOrgId })

    // Use provided organizationId or fall back to session organizationId
    const orgIdToUse = organizationId || sessionOrgId

    if (!orgIdToUse || !intent) {
      console.error('Missing required parameters:', { orgIdToUse, intent })
      return NextResponse.json(
        { error: 'Organization ID and intent are required' },
        { status: 400 }
      )
    }

    console.log('Generating portal link for organization:', orgIdToUse)

    // Generate portal link using WorkOS service
    const portalLink = await WorkOSService.generateAdminPortalLink({
      organizationId: orgIdToUse,
      intent,
      returnUrl: `${process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.replace('/auth/callback', '')}/settings/users?tab=identity`,
    })

    console.log('Portal link generated successfully:', portalLink)
    return NextResponse.json({ link: portalLink })
  } catch (error) {
    console.error('Error generating portal link:', error)
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate portal link',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}