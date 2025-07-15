import { handleAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export const GET = handleAuth({
  returnPathname: '/auth/setup'
})