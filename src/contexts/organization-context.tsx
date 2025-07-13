'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // For now, we'll create a demo organization based on the user
      // In production, this would fetch from Clerk's organization data
      const demoOrg: Organization = {
        id: 'demo-org-1',
        name: user.organizationMemberships?.[0]?.organization?.name || 'Demo Organization',
        slug: user.organizationMemberships?.[0]?.organization?.slug || 'demo-org'
      };
      
      setCurrentOrganization(demoOrg);
      setOrganizations([demoOrg]);
      setIsLoading(false);
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        isLoading,
        switchOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// Hook to get current organization ID for API calls
export function useOrgId(): string | null {
  const { currentOrganization } = useOrganization();
  return currentOrganization?.id || null;
}