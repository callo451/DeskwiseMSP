
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
  useSidebar,
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
  Warehouse,
  Calendar,
  History,
  Flame,
  KanbanSquare,
  Library,
  FileText
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
import type { ModuleId } from '@/lib/types';
import { Separator } from '../ui/separator';

const menuItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: Home, group: 'Workspace' },
  { id: 'reports', href: '/reports', label: 'Reports', icon: BarChart3, group: 'Workspace' },
  {
    id: 'tickets', 
    href: '/tickets', 
    label: 'Tickets', 
    icon: Ticket,
    group: 'Workspace',
    subItems: ticketQueues.map(q => ({
      label: q,
      href: `/tickets?queue=${encodeURIComponent(q)}`
    }))
  },
  { id: 'scheduling', href: '/scheduling', label: 'Scheduling', icon: Calendar, group: 'Workspace' },
  { id: 'incidents', href: '/incidents', label: 'Incidents', icon: Flame, group: 'Workspace' },
  { id: 'change-management', href: '/change-management', label: 'Change Management', icon: History, group: 'Workspace' },
  
  { id: 'clients', href: '/clients', label: 'Clients', icon: Users, group: 'Clients' },
  { id: 'contacts', href: '/contacts', label: 'Contacts', icon: Contact, group: 'Clients' },
  { id: 'projects', href: '/projects', label: 'Projects', icon: KanbanSquare, group: 'Clients' },

  { id: 'quoting', href: '/quoting', label: 'Quoting', icon: FileText, group: 'Products & Services' },
  { id: 'billing', href: '/billing', label: 'Billing', icon: CreditCard, group: 'Products & Services' },
  { id: 'service-catalogue', href: '/service-catalogue', label: 'Service Catalogue', icon: Library, group: 'Products & Services' },
  
  { id: 'assets', href: '/assets', label: 'Assets', icon: HardDrive, group: 'Resources' },
  { id: 'inventory', href: '/inventory', label: 'Inventory', icon: Warehouse, group: 'Resources' },
  { id: 'knowledge-base', href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, group: 'Resources' },

  { id: 'settings', href: '/settings', label: 'Settings', icon: Settings, group: 'Admin' },
];

const menuGroups = ['Workspace', 'Clients', 'Products & Services', 'Resources'];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabledModules } = useSidebar();

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
  
  const visibleMenuItems = menuItems.filter(item => enabledModules && enabledModules[item.id as ModuleId]);

  return (
    <Sidebar className="border-r bg-background/80 backdrop-blur-xl">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <Gem className="h-7 w-7 text-primary" />
          <span className="font-headline">Deskwise</span>
        </Link>
      </SidebarHeader>
      
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="px-4 space-y-4">
          {menuGroups.map(group => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">{group}</h3>
              {visibleMenuItems.filter(item => item.group === group).map(item =>
                item.subItems ? (
                  <Collapsible key={item.label} defaultOpen={pathname.startsWith('/tickets')} className="space-y-1">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <div className={cn("flex w-full items-center rounded-md p-2", isActive('/tickets') && 'bg-sidebar-accent text-sidebar-accent-foreground')}>
                          <Link href={item.href} className="flex-1 flex items-center gap-3 text-sm">
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
            </div>
          ))}
            <Separator />
             {visibleMenuItems.filter(item => item.group === 'Admin').map(item => (
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
             ))}
        </SidebarMenu>
      </div>

      <SidebarFooter className="p-4 border-t">
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
      </SidebarFooter>
    </Sidebar>
  );
}
