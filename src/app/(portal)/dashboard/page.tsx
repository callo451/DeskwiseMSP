'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tickets, assets, clients } from '@/lib/placeholder-data';
import { PlusCircle, Ticket, HardDrive, ShieldAlert, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboardPage() {
  // Hard-coded for "TechCorp" as the logged-in client for demonstration
  const clientName = 'TechCorp';
  const client = clients.find(c => c.name === clientName);
  
  const clientTickets = tickets.filter(t => t.client === clientName);
  const openTickets = clientTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  
  const clientAssets = assets.filter(a => a.client === clientName);
  const totalAssets = clientAssets.length;
  const atRiskAssets = clientAssets.filter(a => !a.isSecure).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Welcome, {client?.mainContact.name || 'Client'}!</h1>
        <p className="text-muted-foreground">Here is a quick overview of your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">Active support requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managed Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">Total monitored devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Risks</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${atRiskAssets > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {atRiskAssets}
            </div>
            <p className="text-xs text-muted-foreground">Assets that require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Ticket</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Need help? Create a new support ticket.</p>
            <Button className="w-full">Create a Ticket</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/portal/tickets/new" className="block">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-secondary transition-colors h-full">
              <Ticket className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Submit a Ticket</h3>
              <p className="text-sm text-muted-foreground">Open a new support request.</p>
            </div>
          </Link>
          <Link href="/portal/tickets" className="block">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-secondary transition-colors h-full">
              <HardDrive className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">View My Tickets</h3>
              <p className="text-sm text-muted-foreground">Check the status of your tickets.</p>
            </div>
          </Link>
          <Link href="/portal/knowledge-base" className="block">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-secondary transition-colors h-full">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Browse Articles</h3>
              <p className="text-sm text-muted-foreground">Find answers in the knowledge base.</p>
            </div>
          </Link>
          <Link href="/portal/chat" className="block">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-secondary transition-colors h-full">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Chat with AI</h3>
              <p className="text-sm text-muted-foreground">Get instant help from our chatbot.</p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
