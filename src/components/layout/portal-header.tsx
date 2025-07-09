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
import { Search, Settings, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { ThemeToggle } from '../theme-toggle';

function BreadcrumbResponsive() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  // Remove 'portal' from breadcrumbs
  const portalSegments = segments.filter(s => s !== 'portal');

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/portal/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {portalSegments.slice(1).map((segment, index) => {
           const href = `/portal/${portalSegments.slice(1, index + 2).join('/')}`;
           const isLast = index === portalSegments.length - 2;
           return (
             <React.Fragment key={href}>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                 {isLast ? (
                   <BreadcrumbPage className="capitalize font-medium text-foreground">
                     {segment.replace(/-/g, ' ')}
                   </BreadcrumbPage>
                 ) : (
                   <BreadcrumbLink asChild>
                     <Link href={href} className="capitalize">{segment.replace(/-/g, ' ')}</Link>
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

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="sm:hidden" />
       <BreadcrumbResponsive />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search knowledge base..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Image
              src="https://placehold.co/36x36/c2410c/FFFFFF.png"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
              data-ai-hint="user avatar"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/portal/login">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
