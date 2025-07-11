
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ALL_MODULES, type ModuleId, type ModuleInfo } from '@/lib/types';
import { useSidebar } from '@/components/ui/sidebar';


export default function ModulesSettingsPage() {
  const { toast } = useToast();
  const { enabledModules, setEnabledModules, isInternalITMode } = useSidebar();

  const handleToggle = (moduleId: ModuleId) => {
    setEnabledModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSave = () => {
    // In a real app, you would save this to a backend.
    // Here, we just show a toast notification.
    toast({
        title: "Settings Saved",
        description: "Your module visibility settings have been updated."
    });
  }

  if (!enabledModules) {
    return null; // Or a loading state
  }

  const visibleModules = ALL_MODULES.filter(module => 
    isInternalITMode ? module.type === 'Core' : true
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Module Management</h1>
        <p className="text-muted-foreground">
          Enable or disable modules to customize the application for your team.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enabled Modules</CardTitle>
          <CardDescription>
            Toggle modules on or off. Changes will be reflected in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {visibleModules.map((module) => (
                <div key={module.id} className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <Label htmlFor={`module-${module.id}`} className="text-base flex items-center gap-2">
                        <module.icon className="h-4 w-4" />
                        {module.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Switch
                        id={`module-${module.id}`}
                        checked={enabledModules[module.id]}
                        onCheckedChange={() => handleToggle(module.id)}
                        disabled={module.id === 'dashboard' || module.id === 'settings'}
                    />
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
