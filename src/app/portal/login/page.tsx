'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem, User } from 'lucide-react';
import Link from 'next/link';

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <Link href="/" className="flex items-center gap-2 font-semibold text-2xl">
              <Gem className="h-7 w-7 text-primary" />
              <span className="font-headline">ServiceFlow AI</span>
            </Link>
          </div>
          <CardTitle className="font-headline text-3xl">Client Portal Login</CardTitle>
          <CardDescription>Enter your credentials to access your self-service portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jane.doe@techcorp.com" required defaultValue="jane.doe@techcorp.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline" prefetch={false}>
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Link href="/portal/dashboard" className="w-full">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
