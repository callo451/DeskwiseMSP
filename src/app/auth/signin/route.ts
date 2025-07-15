import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export async function GET() {
  const signInUrl = await getSignInUrl({
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  })
  redirect(signInUrl)
}