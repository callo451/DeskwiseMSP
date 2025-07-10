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

export default function NewInventoryItemPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/inventory"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">New Inventory Item</h1>
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Item</CardTitle>
                    <CardDescription>
                        This feature is coming soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                        <p className="text-muted-foreground">New inventory item form will be here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
