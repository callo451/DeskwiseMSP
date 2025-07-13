import { IncidentService } from './services/incidents';
import type { MajorIncident } from './types';

export async function seedIncidents() {
  try {
    console.log('Seeding incidents collection...');

    // Check if incidents already exist
    const existingIncidents = await IncidentService.getAll();
    if (existingIncidents.length > 0) {
      console.log('Incidents already exist, skipping seed.');
      return;
    }

    // Sample incident data
    const sampleIncidents = [
      {
        title: 'Email Service Disruption',
        status: 'Monitoring' as const,
        isPublished: true,
        affectedServices: ['Email Hosting', 'Microsoft 365'],
        affectedClients: ['All'],
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        title: 'Network Connectivity Issues - TechCorp',
        status: 'Investigating' as const,
        isPublished: true,
        affectedServices: ['Internet', 'VPN'],
        affectedClients: ['CLI-001'],
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        title: 'Internal Tool Maintenance',
        status: 'Resolved' as const,
        isPublished: false,
        affectedServices: ['Deskwise Application'],
        affectedClients: ['All'],
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
      },
      {
        title: 'Database Performance Degradation',
        status: 'Resolved' as const,
        isPublished: true,
        affectedServices: ['Deskwise Application', 'Client Portal'],
        affectedClients: ['All'],
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 6 days, 21 hours ago
      },
    ];

    const createdBy = 'system-seed';

    // Create incidents with initial updates
    for (const incidentData of sampleIncidents) {
      let initialUpdate;
      
      switch (incidentData.status) {
        case 'Investigating':
          initialUpdate = {
            status: incidentData.status,
            message: 'We are currently investigating reports of service disruption. We will provide updates as more information becomes available.',
            timestamp: incidentData.startedAt,
          };
          break;
        case 'Monitoring':
          initialUpdate = {
            status: 'Investigating',
            message: 'We have identified the root cause and implemented a fix. We are now monitoring the situation to ensure stability.',
            timestamp: incidentData.startedAt,
          };
          break;
        case 'Resolved':
          initialUpdate = {
            status: 'Investigating',
            message: 'We have successfully resolved the issue. All services are now operating normally.',
            timestamp: incidentData.startedAt,
          };
          break;
      }

      const incident = await IncidentService.create(
        incidentData,
        createdBy,
        initialUpdate
      );

      // Add additional updates for more realistic timeline
      if (incidentData.status === 'Monitoring') {
        await IncidentService.addUpdate(
          incident.id,
          {
            status: 'Identified',
            message: 'We have identified the root cause of the email service disruption. Our engineering team is implementing a fix.',
            timestamp: new Date(new Date(incidentData.startedAt).getTime() + 45 * 60 * 1000).toISOString(),
          },
          createdBy
        );
        
        await IncidentService.addUpdate(
          incident.id,
          {
            status: 'Monitoring',
            message: 'The fix has been deployed and email services are being restored. We are monitoring the situation closely.',
            timestamp: new Date(new Date(incidentData.startedAt).getTime() + 90 * 60 * 1000).toISOString(),
          },
          createdBy
        );
      }

      if (incidentData.status === 'Resolved' && incidentData.resolvedAt) {
        await IncidentService.addUpdate(
          incident.id,
          {
            status: 'Identified',
            message: 'The issue has been identified and our team is working on a resolution.',
            timestamp: new Date(new Date(incidentData.startedAt).getTime() + 30 * 60 * 1000).toISOString(),
          },
          createdBy
        );
        
        await IncidentService.addUpdate(
          incident.id,
          {
            status: 'Resolved',
            message: 'The issue has been fully resolved. All affected services are now operating normally.',
            timestamp: incidentData.resolvedAt,
          },
          createdBy
        );
      }

      console.log(`Created incident: ${incident.title}`);
    }

    console.log('✅ Incidents seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding incidents:', error);
  }
}