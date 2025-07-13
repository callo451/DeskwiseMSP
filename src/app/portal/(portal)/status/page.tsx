
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MajorIncident } from '@/lib/types';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { CheckCircle, Info, Flame } from 'lucide-react';

const TimelineNode = ({ update, isLast = false }: { update: MajorIncident['updates'][0], isLast?: boolean }) => {
    const getStatusInfo = (status: MajorIncident['status']) => {
        switch(status) {
            case 'Investigating': return { color: 'bg-yellow-500', icon: Info };
            case 'Identified': return { color: 'bg-blue-500', icon: Info };
            case 'Monitoring': return { color: 'bg-purple-500', icon: Info };
            case 'Resolved': return { color: 'bg-green-500', icon: CheckCircle };
            default: return { color: 'bg-gray-500', icon: Info };
        }
    };
    const { color, icon: Icon } = getStatusInfo(update.status);

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${color} text-white`}>
                    <Icon className="h-5 w-5" />
                </div>
                {!isLast && <div className="w-px h-full bg-border mt-2" />}
            </div>
            <div className="flex-1 pb-8">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground">
                        Status updated to <span className="font-bold">{update.status}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(parseISO(update.timestamp), 'PPpp')}
                    </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{update.message}</p>
            </div>
        </div>
    )
};

const IncidentCard = ({ incident }: { incident: MajorIncident }) => {
    const getStatusColor = (status: MajorIncident['status']) => {
        switch (status) {
            case 'Resolved': return 'bg-green-500';
            default: return 'bg-destructive';
        }
    };
    const getStatusVariant = (status: MajorIncident['status']) => {
        switch (status) {
            case 'Resolved': return 'outline';
            default: return 'destructive';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{incident.title}</CardTitle>
                    <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                </div>
                <CardDescription>
                    Started {formatDistanceToNow(parseISO(incident.startedAt), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold mb-2 text-sm">Affected Services:</h4>
                <div className="flex flex-wrap gap-1 mb-6">
                    {incident.affectedServices.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>

                <h4 className="font-semibold mb-4 text-sm">Updates</h4>
                 {incident.updates.map((update, index) => (
                    <TimelineNode key={update.id} update={update} isLast={index === incident.updates.length - 1} />
                ))}
            </CardContent>
        </Card>
    )
}

export default function ClientStatusPage() {
    const [incidents, setIncidents] = useState<MajorIncident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicIncidents();
    }, []);

    const fetchPublicIncidents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/incidents/public');
            if (response.ok) {
                const data = await response.json();
                setIncidents(data);
            } else {
                console.error('Failed to fetch public incidents');
            }
        } catch (error) {
            console.error('Error fetching public incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const ongoingIncidents = incidents.filter(i => i.status !== 'Resolved');
    const resolvedIncidents = incidents.filter(i => i.status === 'Resolved').slice(0, 3); // show last 3

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">System Status</h1>
                    <p className="text-muted-foreground">Live updates on service availability and major incidents.</p>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">System Status</h1>
                <p className="text-muted-foreground">Live updates on service availability and major incidents.</p>
            </div>
            
            <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-6 flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                        <h3 className="font-semibold text-lg text-green-900 dark:text-green-200">All Systems Operational</h3>
                        <p className="text-sm text-green-800 dark:text-green-300">All services are currently running smoothly.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {ongoingIncidents.length > 0 && (
                     <h2 className="text-xl font-semibold">Ongoing Incidents</h2>
                )}
                {ongoingIncidents.map(incident => (
                    <IncidentCard key={incident.id} incident={incident} />
                ))}
            </div>

            <div className="space-y-4">
                 <h2 className="text-xl font-semibold pt-6">Recent History</h2>
                {resolvedIncidents.map(incident => (
                    <IncidentCard key={incident.id} incident={incident} />
                ))}
                 {resolvedIncidents.length === 0 && (
                     <p className="text-sm text-muted-foreground">No resolved incidents in the last 72 hours.</p>
                 )}
            </div>
        </div>
    );
}
