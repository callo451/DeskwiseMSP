
import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to WorkOS authentication
  redirect('/auth/signin')
}
