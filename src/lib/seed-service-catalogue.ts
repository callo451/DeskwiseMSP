import { QuotesService } from './services/quotes';
import type { ServiceCatalogueItem } from './types';

const defaultServices: Omit<ServiceCatalogueItem, 'id'>[] = [
  {
    name: 'Managed Workstation',
    description: 'Per-device support for workstations, including monitoring and maintenance.',
    category: 'Managed Services',
    price: 65,
    type: 'Recurring'
  },
  {
    name: 'Managed Server',
    description: 'Per-server support, including monitoring, patching, and backups.',
    category: 'Managed Services', 
    price: 250,
    type: 'Recurring'
  },
  {
    name: 'On-site Support (Hourly)',
    description: 'On-site technician support.',
    category: 'Professional Services',
    price: 150,
    type: 'Hourly'
  },
  {
    name: 'Microsoft 365 Business Premium',
    description: 'Per-user license for M365 Business Premium.',
    category: 'Licenses',
    price: 22,
    type: 'Recurring'
  },
  {
    name: 'New Workstation Setup',
    description: 'Fixed-fee project to set up a new workstation.',
    category: 'Professional Services',
    price: 250,
    type: 'Fixed'
  },
  {
    name: 'Network Security Assessment',
    description: 'Comprehensive security audit and assessment.',
    category: 'Professional Services',
    price: 2500,
    type: 'Fixed'
  },
  {
    name: 'Backup & Disaster Recovery',
    description: 'Monthly backup and disaster recovery service.',
    category: 'Managed Services',
    price: 100,
    type: 'Recurring'
  },
  {
    name: 'Remote Support (Hourly)',
    description: 'Remote technical support and troubleshooting.',
    category: 'Professional Services',
    price: 120,
    type: 'Hourly'
  }
];

export async function seedServiceCatalogue(orgId: string, createdBy: string): Promise<void> {
  console.log(`Seeding service catalogue for organization ${orgId}...`);
  
  try {
    // Check if services already exist
    const existingServices = await QuotesService.getServiceCatalogue(orgId);
    
    if (existingServices.length > 0) {
      console.log('Service catalogue already exists, skipping seed.');
      return;
    }

    // Create default services
    const createdServices = [];
    for (const service of defaultServices) {
      try {
        const created = await QuotesService.createService(orgId, service, createdBy);
        createdServices.push(created);
        console.log(`Created service: ${created.name}`);
      } catch (error) {
        console.error(`Failed to create service ${service.name}:`, error);
      }
    }

    console.log(`Successfully seeded ${createdServices.length} services for organization ${orgId}`);
  } catch (error) {
    console.error('Error seeding service catalogue:', error);
    throw error;
  }
}