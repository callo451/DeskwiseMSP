
import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to the new Clerk sign-in page
  redirect('/sign-in')
}
