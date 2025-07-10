'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewTicketPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/tickets"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Create New Ticket</h1>
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Ticket Form</CardTitle>
                    <CardDescription>
                        This feature is currently under maintenance. We will address this shortly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                        <p className="text-muted-foreground">The new ticket form will be available here soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
