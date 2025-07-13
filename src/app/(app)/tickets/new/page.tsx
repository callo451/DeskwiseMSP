'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { clients, ticketQueues } from '@/lib/placeholder-data';
import type { Ticket } from '@/lib/types';

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        client: '',
        assignee: 'Unassigned',
        priority: 'Medium' as Ticket['priority'],
        status: 'Open' as Ticket['status'],
        queue: 'Unassigned' as Ticket['queue'],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const ticket = await response.json();
                router.push(`/tickets/${ticket.id}`);
            } else {
                console.error('Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    <CardTitle>New Ticket</CardTitle>
                    <CardDescription>
                        Create a new service request or issue ticket.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    placeholder="Brief description of the issue"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">Client *</Label>
                                <Select
                                    value={formData.client}
                                    onValueChange={(value) => setFormData({...formData, client: value})}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.name}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Detailed description of the issue or request"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData({...formData, priority: value as Ticket['priority']})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="queue">Queue</Label>
                                <Select
                                    value={formData.queue}
                                    onValueChange={(value) => setFormData({...formData, queue: value as Ticket['queue']})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticketQueues.map((queue) => (
                                            <SelectItem key={queue} value={queue}>
                                                {queue}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assignee">Assignee</Label>
                                <Select
                                    value={formData.assignee}
                                    onValueChange={(value) => setFormData({...formData, assignee: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                                        <SelectItem value="Alice">Alice</SelectItem>
                                        <SelectItem value="Bob">Bob</SelectItem>
                                        <SelectItem value="Charlie">Charlie</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Ticket
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/tickets">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
