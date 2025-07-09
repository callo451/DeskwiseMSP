
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  Contact,
  Ticket,
  HardDrive,
  CreditCard,
  BookOpen,
  Settings,
  Gem,
  LogOut,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ticketQueues } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import React from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/contacts', label: 'Contacts', icon: Contact },
  { 
    href: '/tickets', 
    label: 'Tickets', 
    icon: Ticket,
    subItems: ticketQueues.map(q => ({
      label: q,
      href: `/tickets?queue=${encodeURIComponent(q)}`
    }))
  },
  { href: '/assets', label: 'Assets', icon: HardDrive },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    const queueParam = searchParams.get('queue');
    if (href === '/tickets') {
      return pathname.startsWith(href) && !queueParam;
    }
    if (href.startsWith('/tickets?queue=')) {
        return pathname.startsWith('/tickets') && queueParam === href.split('=')[1];
    }
    if (href === '/dashboard') {
      return pathname === href;
    }
    // Updated to handle /reports and other top-level items correctly
    return pathname.startsWith(href) && (href !== '/dashboard' && href !== '/tickets');
  };

  return (
    <Sidebar className="border-r bg-background/80 backdrop-blur-xl">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <Gem className="h-7 w-7 text-primary" />
          <span className="font-headline">ServiceFlow AI</span>
        </Link>
      </SidebarHeader>
      
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="px-4">
          {menuItems.map(item =>
            item.subItems ? (
              <Collapsible key={item.label} defaultOpen={pathname.startsWith('/tickets')} className="space-y-1">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <div className={cn("flex w-full items-center rounded-md p-2", isActive('/tickets') && 'bg-sidebar-accent text-sidebar-accent-foreground')}>
                      <Link href={item.href} className="flex-1 flex items-center gap-2 text-sm">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </div>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subItems.map(subItem => (
                            <SidebarMenuSubItem key={subItem.label}>
                                <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                                    <Link href={subItem.href}>{subItem.label}</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </div>

      <SidebarFooter className="p-4 flex-col gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="p-4">
            <CardTitle>Updates Available</CardTitle>
            <CardDescription>
              New AI features and performance improvements are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button size="sm" className="w-full">
              Update Now
            </Button>
          </CardContent>
        </Card>

        <div className="border-t pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center w-full justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="user avatar" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">John Doe</span>
                            <span className="text-xs text-muted-foreground">john.doe@email.com</span>
                        </div>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <LogOut className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </Link>
                </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
