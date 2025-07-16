
'use client';

import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';


export default function ModulesSettingsPage() {
  const { toast } = useToast();
  const { enabledModules, setEnabledModules, isInternalITMode } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModuleSettings();
  }, []);

  const fetchModuleSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/modules');
      if (response.ok) {
        const data = await response.json();
        setEnabledModules(data.enabledModules);
      } else {
        throw new Error('Failed to fetch module settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load module settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (moduleId: ModuleId) => {
    setEnabledModules(prev => {
      const current = prev ?? {} as Record<ModuleId, boolean>;
      return {
        ...current,
        [moduleId]: !current[moduleId],
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/settings/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledModules }),
      });
      if (res.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Your module visibility settings have been updated.',
        });
      } else {
        const data = await res.json();
        throw new Error(data.message ?? 'Failed to save');
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Save failed',
        description: err.message ?? 'Unable to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Module Management</h1>
          <p className="text-muted-foreground">
            Enable or disable modules to customize the application for your team.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enabledModules) {
    return null;
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!enabledModules || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
