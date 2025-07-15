
'use client';

import { Button } from '@/components/ui/button';
import { Gem, Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../theme-toggle';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' }
];

export function WebsiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    const signInUrl = await getSignInUrl({ redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI });
    window.location.href = signInUrl;
  };

  const handleSignOut = async () => {
    window.location.href = '/auth/signout';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <Gem className="h-7 w-7 text-primary" />
          <span className="font-headline">Deskwise</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary relative group',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
              <div className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                pathname === link.href ? 'w-full' : ''
              }`}></div>
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {!loading && (
            <>
              {!user ? (
                <>
                  <Button variant="ghost" onClick={handleSignIn}>
                    Log in
                  </Button>
                  <Button onClick={handleSignIn}>
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <User className="h-4 w-4" />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col gap-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-4 flex flex-col gap-2">
              {!loading && (
                <>
                  {!user ? (
                    <>
                      <Button variant="outline" onClick={handleSignIn}>
                        Log in
                      </Button>
                      <Button onClick={handleSignIn}>
                        Get Started
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                      <Button variant="outline" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </>
                  )}
                </>
              )}
              <div className="mx-auto pt-2">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
