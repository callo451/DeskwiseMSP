'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Ticket,
  BookOpen,
  Gem,
  LogOut,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: Home },
  { href: '/portal/tickets', label: 'My Tickets', icon: Ticket },
  { href: '/portal/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/portal/chat', label: 'AI Chat', icon: Sparkles },
];

export function PortalSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/portal/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r bg-background/80 backdrop-blur-xl">
      <SidebarHeader>
        <Link href="/portal/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <Gem className="h-7 w-7 text-primary" />
          <span className="font-headline">Client Portal</span>
        </Link>
      </SidebarHeader>
      
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="px-4">
          {menuItems.map(item => (
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
                            <AvatarImage src="https://placehold.co/40x40/c2410c/FFFFFF.png" alt="Jane Doe" data-ai-hint="user avatar" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Jane Doe</span>
                            <span className="text-xs text-muted-foreground">TechCorp</span>
                        </div>
                    </div>
                    <Link href="/portal/login">
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
