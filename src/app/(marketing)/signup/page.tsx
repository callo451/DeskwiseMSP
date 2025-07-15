
import { redirect } from 'next/navigation'

export default function SignupPage() {
  // Redirect to WorkOS authentication
  redirect('/auth/signin')
}
