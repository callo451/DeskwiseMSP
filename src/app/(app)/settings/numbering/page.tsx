
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Ticket,
  History,
  HardDrive,
  BookOpen,
  Flame,
  KanbanSquare,
} from 'lucide-react';

const modules = [
  { id: 'tickets', name: 'Tickets', icon: Ticket, prefix: 'TKT-', suffix: '' },
  { id: 'changes', name: 'Changes', icon: History, prefix: 'CHG-', suffix: '' },
  { id: 'assets', name: 'Assets', icon: HardDrive, prefix: 'AST-', suffix: '' },
  { id: 'articles', name: 'Knowledge Base', icon: BookOpen, prefix: 'KB-', suffix: '' },
  { id: 'incidents', name: 'Incidents', icon: Flame, prefix: 'MI-', suffix: '' },
  { id: 'projects', name: 'Projects', icon: KanbanSquare, prefix: 'PROJ-', suffix: '' },
];

export default function NumberingSettingsPage() {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState(
    modules.map(m => ({ id: m.id, prefix: m.prefix, suffix: m.suffix }))
  );

  const handleSchemeChange = (id: string, field: 'prefix' | 'suffix', value: string) => {
    setSchemes(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    // In a real app, this would be an API call to save the settings
    console.log('Saving numbering schemes:', schemes);
    toast({
      title: 'Settings Saved',
      description: 'Your numbering schemes have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Numbering Schemes</h1>
        <p className="text-muted-foreground">
          Customize the prefixes and suffixes for IDs across different modules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module ID Formats</CardTitle>
          <CardDescription>
            Define the format for auto-generated IDs. The system will add a unique number between the prefix and suffix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.map(module => {
            const scheme = schemes.find(s => s.id === module.id);
            const Icon = module.icon;
            return (
              <div key={module.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{module.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`${module.id}-prefix`}>Prefix</Label>
                    <Input
                      id={`${module.id}-prefix`}
                      value={scheme?.prefix || ''}
                      onChange={e => handleSchemeChange(module.id, 'prefix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${module.id}-suffix`}>Suffix</Label>
                    <Input
                      id={`${module.id}-suffix`}
                      value={scheme?.suffix || ''}
                      onChange={e => handleSchemeChange(module.id, 'suffix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Example</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border border-input bg-secondary text-muted-foreground">
                      <span className="font-mono text-sm">
                        {scheme?.prefix}12345{scheme?.suffix}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
