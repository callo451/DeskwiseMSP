import { UserProfile } from '@clerk/nextjs'

export default function UserProfilePage() {
  return (
    <div className="flex justify-center py-8">
      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full max-w-4xl',
            card: 'shadow-lg border rounded-xl',
            navbar: 'bg-muted/50',
            navbarButton: 'text-foreground hover:bg-accent hover:text-accent-foreground',
            navbarButtonActive: 'bg-primary text-primary-foreground',
            pageScrollBox: 'bg-background',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          },
        }}
        routing="path"
        path="/user-profile"
      />
    </div>
  )
}