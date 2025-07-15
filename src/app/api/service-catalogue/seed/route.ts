import { NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

const defaultServices = [
  {
    name: 'Managed Workstation',
    description: 'Per-device support for workstations, including monitoring and maintenance.',
    category: 'Managed Services',
    price: 65,
    type: 'Recurring' as const,
    billingFrequency: 'Monthly' as const,
    tags: ['managed', 'workstation', 'monitoring']
  },
  {
    name: 'Managed Server',
    description: 'Per-server support, including monitoring, patching, and backups.',
    category: 'Managed Services', 
    price: 250,
    type: 'Recurring' as const,
    billingFrequency: 'Monthly' as const,
    tags: ['managed', 'server', 'backup']
  },
  {
    name: 'On-site Support (Hourly)',
    description: 'On-site technician support.',
    category: 'Professional Services',
    price: 150,
    type: 'Hourly' as const,
    minimumHours: 2,
    tags: ['onsite', 'support', 'hourly']
  },
  {
    name: 'Microsoft 365 Business Premium',
    description: 'Per-user license for M365 Business Premium.',
    category: 'Licenses',
    price: 22,
    type: 'Recurring' as const,
    billingFrequency: 'Monthly' as const,
    tags: ['microsoft', 'license', 'office365']
  },
  {
    name: 'New Workstation Setup',
    description: 'Fixed-fee project to set up a new workstation.',
    category: 'Professional Services',
    price: 250,
    type: 'Fixed' as const,
    setupFee: 50,
    tags: ['setup', 'workstation', 'project']
  },
  {
    name: 'Network Security Assessment',
    description: 'Comprehensive security audit and assessment.',
    category: 'Professional Services',
    price: 2500,
    type: 'Fixed' as const,
    tags: ['security', 'assessment', 'audit']
  },
  {
    name: 'Backup & Disaster Recovery',
    description: 'Monthly backup and disaster recovery service.',
    category: 'Managed Services',
    price: 100,
    type: 'Recurring' as const,
    billingFrequency: 'Monthly' as const,
    tags: ['backup', 'disaster-recovery', 'managed']
  },
  {
    name: 'Remote Support (Hourly)',
    description: 'Remote technical support and troubleshooting.',
    category: 'Professional Services',
    price: 120,
    type: 'Hourly' as const,
    minimumHours: 1,
    tags: ['remote', 'support', 'troubleshooting']
  }
];

export async function POST() {
  try {
    const { orgId, userId } = await getAuthContext();
    
    // Check if services already exist
    const existingServices = await ServiceCatalogueService.getActive(orgId);
    
    if (existingServices.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Service catalogue already exists, skipping seed.',
        skipped: true
      });
    }

    // Create default services
    const services = await ServiceCatalogueService.bulkImport(orgId, defaultServices, userId);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${services.length} services`,
      serviceCount: services.length
    });
  } catch (error) {
    console.error('Error seeding service catalogue:', error);
    return NextResponse.json(
      { error: 'Failed to seed service catalogue' },
      { status: 500 }
    );
  }
}