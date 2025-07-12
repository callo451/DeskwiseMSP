
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background p-4">
      <Tabs defaultValue="technician" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="technician">Technician Portal</TabsTrigger>
          <TabsTrigger value="client">Client Portal</TabsTrigger>
        </TabsList>
        <TabsContent value="technician">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Technician Login</CardTitle>
              <CardDescription>Enter your credentials to access the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tech-email">Email</Label>
                  <Input id="tech-email" type="email" placeholder="john.doe@email.com" required defaultValue="john.doe@email.com" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tech-password">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline" prefetch={false}>
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="tech-password" type="password" required defaultValue="password" />
                </div>
                <Link href="/dashboard" className="w-full">
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="client">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Client Login</CardTitle>
                    <CardDescription>Access your self-service portal.</CardDescription>
                </CardHeader>
                <CardContent>
                <form className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input id="client-email" type="email" placeholder="jane.doe@techcorp.com" required defaultValue="jane.doe@techcorp.com" />
                    </div>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="client-password">Password</Label>
                        <Link href="#" className="text-sm text-primary hover:underline" prefetch={false}>
                        Forgot password?
                        </Link>
                    </div>
                    <Input id="client-password" type="password" required defaultValue="password" />
                    </div>
                    <Link href="/portal/dashboard" className="w-full">
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                    </Link>
                </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
