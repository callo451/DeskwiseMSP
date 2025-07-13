
import { redirect } from 'next/navigation'

export default function SignupPage() {
  // Redirect to the new Clerk sign-up page
  redirect('/sign-up')
}
