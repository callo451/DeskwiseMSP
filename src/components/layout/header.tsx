'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Gem, Home, Search, Settings, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AIAssistant } from '../ai/ai-assistant';
import React from 'react';
import { ThemeToggle } from '../theme-toggle';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

function BreadcrumbResponsive() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
           const href = `/${segments.slice(0, index + 1).join('/')}`;
           const isLast = index === segments.length - 1;
           return (
             <React.Fragment key={href}>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                 {isLast ? (
                   <BreadcrumbPage className="capitalize font-medium text-foreground">
                     {segment}
                   </BreadcrumbPage>
                 ) : (
                   <BreadcrumbLink asChild>
                     <Link href={href} className="capitalize">{segment}</Link>
                   </BreadcrumbLink>
                 )}
               </BreadcrumbItem>
             </React.Fragment>
           );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="sm:hidden" />
       <BreadcrumbResponsive />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <ThemeToggle />
      <SignedIn>
        <AIAssistant />
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9"
            }
          }}
        />
      </SignedIn>
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size="sm">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </header>
  );
}
