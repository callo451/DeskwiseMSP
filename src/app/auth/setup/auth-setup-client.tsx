'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Check, Loader2 } from 'lucide-react'

interface AuthSetupClientProps {
  user: any
  organizationId?: string
}

export function AuthSetupClient({ user, organizationId }: AuthSetupClientProps) {
  const router = useRouter()
  const [setupStatus, setSetupStatus] = useState<'pending' | 'setting-up' | 'complete' | 'error'>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user already has organization setup (either in WorkOS session or MongoDB)
    checkExistingSetup()
  }, [router])

  const checkExistingSetup = async () => {
    if (organizationId) {
      // User already has an organization in WorkOS session, redirect to dashboard
      console.log('User has organization in session:', organizationId)
      router.push('/dashboard')
      return
    }

    // Check if user has organization in MongoDB (in case session is out of sync)
    try {
      const response = await fetch('/api/auth/check-setup', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hasOrganization) {
          console.log('User has organization in MongoDB, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
      }
    } catch (error) {
      console.error('Error checking existing setup:', error)
    }

    // No organization found, start setup process
    setupUserAndOrganization()
  }

  const setupUserAndOrganization = async () => {
    setSetupStatus('setting-up')
    
    try {
      const response = await fetch('/api/auth/setup-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log('Setup completed successfully:', responseData)
        setSetupStatus('complete')
        
        // If session refresh is required, sign out and back in
        if (responseData.requiresSessionRefresh) {
          setTimeout(async () => {
            try {
              // Force a session refresh by redirecting to sign out and back in
              window.location.href = '/auth/signout'
            } catch (error) {
              console.error('Error refreshing session:', error)
              // Fallback to direct redirect
              window.location.href = '/dashboard'
            }
          }, 2000)
        } else {
          // Normal redirect
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        }
      } else {
        console.error('Setup failed:', responseData)
        throw new Error(responseData.error || 'Setup failed')
      }
    } catch (err) {
      console.error('Setup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setSetupStatus('error')
    }
  }

  if (setupStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparing setup...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {setupStatus === 'complete' ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : setupStatus === 'error' ? (
              <Building2 className="h-6 w-6 text-red-600" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>
            {setupStatus === 'setting-up' && 'Setting up your account...'}
            {setupStatus === 'complete' && 'Welcome to Deskwise!'}
            {setupStatus === 'error' && 'Setup Error'}
          </CardTitle>
          <CardDescription>
            {setupStatus === 'setting-up' && 'Creating your organization and configuring your account.'}
            {setupStatus === 'complete' && 'Your account has been set up successfully. Redirecting to dashboard...'}
            {setupStatus === 'error' && 'There was an issue setting up your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setupStatus === 'setting-up' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Creating your organization</p>
                <p>• Setting up your workspace</p>
                <p>• Configuring permissions</p>
              </div>
            </div>
          )}
          
          {setupStatus === 'complete' && (
            <div className="text-center">
              <Check className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-muted-foreground">
                Setup complete! You'll be redirected shortly.
              </p>
            </div>
          )}

          {setupStatus === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={setupUserAndOrganization}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}