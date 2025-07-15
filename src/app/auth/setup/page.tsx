import { withAuth } from '@workos-inc/authkit-nextjs'
import { AuthSetupClient } from './auth-setup-client'

export default async function AuthSetupPage() {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true })

  if (!user) {
    return <div>Please sign in to continue.</div>
  }

  return <AuthSetupClient user={user} organizationId={organizationId} />
}