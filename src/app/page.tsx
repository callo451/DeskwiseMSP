'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gem, User, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <Link href="#" className="flex items-center justify-center gap-2 font-semibold text-3xl mb-4">
            <Gem className="h-8 w-8 text-primary" />
            <span className="font-headline">Deskwise</span>
          </Link>
          <p className="text-muted-foreground">The AI-Powered PSA for Managed Service Providers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="text-center">
              <UserCog className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="font-headline text-2xl">Technician Portal</CardTitle>
              <CardDescription>Access the main application to manage clients, tickets, and assets.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Technician Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="text-center">
              <User className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="font-headline text-2xl">Client Portal</CardTitle>
              <CardDescription>Log in to view your tickets, browse articles, and manage your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/login" className="w-full">
                  <Button className="w-full">Client Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
