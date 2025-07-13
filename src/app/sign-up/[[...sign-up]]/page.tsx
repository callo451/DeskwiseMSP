import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-xl border-0 rounded-xl',
              headerTitle: 'text-2xl font-bold text-center',
              headerSubtitle: 'text-center text-muted-foreground',
              socialButtonsBlockButton: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/80',
            },
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}