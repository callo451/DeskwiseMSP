import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { ReportFilter } from '@/lib/types';

export interface ReportData {
  [key: string]: any;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MSPMetrics {
  totalTickets: number;
  openTickets: number;
  criticalTickets: number;
  avgResolutionTime: number;
  slaBreaches: number;
  clientSatisfaction: number;
  recurringRevenue: number;
  activeAssets: number;
  securityIncidents: number;
  changeSuccess: number;
}

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  ticketCount: number;
  openTickets: number;
  avgResolutionTime: number;
  slaCompliance: number;
  assetCount: number;
  monthlyRevenue: number;
  satisfaction: number;
  lastActivity: Date;
}

export interface TechnicianMetrics {
  technicianId: string;
  technicianName: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  workloadHours: number;
  utilizationRate: number;
  clientRating: number;
}

export interface ServiceMetrics {
  serviceType: string;
  ticketCount: number;
  avgResolutionTime: number;
  successRate: number;
  revenue: number;
  clientCount: number;
}

export class ReportsService {
  private static async getTicketsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('tickets');
  }

  private static async getAssetsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('assets');
  }

  private static async getIncidentsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('incidents');
  }

  private static async getChangeRequestsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('change_requests');
  }

  private static async getProjectsCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('projects');
  }

  private static async getScheduleCollection() {
    const client = await clientPromise;
    const db = client.db('deskwise');
    return db.collection('schedule_items');
  }

  /**
   * Get comprehensive MSP metrics dashboard
   */
  static async getMSPMetrics(orgId: string, dateRange?: DateRange): Promise<MSPMetrics> {
    const ticketsCollection = await this.getTicketsCollection();
    const assetsCollection = await this.getAssetsCollection();
    const incidentsCollection = await this.getIncidentsCollection();
    const changeRequestsCollection = await this.getChangeRequestsCollection();

    // Build date filter
    const dateFilter = dateRange ? {
      createdAt: {
        $gte: dateRange.from,
        $lte: dateRange.to
      }
    } : {};

    const baseFilter = { orgId, ...dateFilter };

    // Parallel aggregation queries for performance
    const [
      ticketMetrics,
      assetMetrics,
      incidentMetrics,
      changeMetrics
    ] = await Promise.all([
      // Ticket metrics
      ticketsCollection.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            openTickets: {
              $sum: { $cond: [{ $in: ['$status', ['Open', 'In Progress', 'Pending']] }, 1, 0] }
            },
            criticalTickets: {
              $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] }
            },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'Closed'] },
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  null
                ]
              }
            },
            slaBreaches: {
              $sum: { $cond: ['$slaBreached', 1, 0] }
            }
          }
        }
      ]).toArray(),

      // Asset metrics
      assetsCollection.aggregate([
        { $match: { orgId } },
        {
          $group: {
            _id: null,
            activeAssets: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } }
          }
        }
      ]).toArray(),

      // Security incident metrics
      incidentsCollection.aggregate([
        { $match: { orgId, type: 'Security', ...dateFilter } },
        {
          $group: {
            _id: null,
            securityIncidents: { $sum: 1 }
          }
        }
      ]).toArray(),

      // Change success metrics
      changeRequestsCollection.aggregate([
        { $match: { orgId, status: 'Completed', ...dateFilter } },
        {
          $group: {
            _id: null,
            totalChanges: { $sum: 1 },
            successfulChanges: {
              $sum: { $cond: [{ $ne: ['$actualResult', 'Failed'] }, 1, 0] }
            }
          }
        }
      ]).toArray()
    ]);

    const tickets = ticketMetrics[0] || {};
    const assets = assetMetrics[0] || {};
    const incidents = incidentMetrics[0] || {};
    const changes = changeMetrics[0] || {};

    return {
      totalTickets: tickets.totalTickets || 0,
      openTickets: tickets.openTickets || 0,
      criticalTickets: tickets.criticalTickets || 0,
      avgResolutionTime: Math.round((tickets.avgResolutionTime || 0) / (1000 * 60 * 60)), // Convert to hours
      slaBreaches: tickets.slaBreaches || 0,
      clientSatisfaction: 4.2, // TODO: Implement client satisfaction tracking
      recurringRevenue: 0, // TODO: Implement billing integration
      activeAssets: assets.activeAssets || 0,
      securityIncidents: incidents.securityIncidents || 0,
      changeSuccess: changes.totalChanges ? 
        Math.round((changes.successfulChanges / changes.totalChanges) * 100) : 100
    };
  }

  /**
   * Get client performance metrics
   */
  static async getClientMetrics(orgId: string, dateRange?: DateRange): Promise<ClientMetrics[]> {
    const ticketsCollection = await this.getTicketsCollection();
    const assetsCollection = await this.getAssetsCollection();

    const dateFilter = dateRange ? {
      createdAt: {
        $gte: dateRange.from,
        $lte: dateRange.to
      }
    } : {};

    // Get client metrics from tickets
    const clientTicketMetrics = await ticketsCollection.aggregate([
      { $match: { orgId, ...dateFilter } },
      {
        $group: {
          _id: '$client',
          ticketCount: { $sum: 1 },
          openTickets: {
            $sum: { $cond: [{ $in: ['$status', ['Open', 'In Progress', 'Pending']] }, 1, 0] }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Closed'] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          },
          slaBreaches: { $sum: { $cond: ['$slaBreached', 1, 0] } },
          lastActivity: { $max: '$updatedAt' }
        }
      },
      {
        $addFields: {
          slaCompliance: {
            $multiply: [
              { $divide: [{ $subtract: ['$ticketCount', '$slaBreaches'] }, '$ticketCount'] },
              100
            ]
          }
        }
      }
    ]).toArray();

    // Get asset counts per client
    const clientAssetCounts = await assetsCollection.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: '$client',
          assetCount: { $sum: 1 }
        }
      }
    ]).toArray();

    // Combine metrics
    const assetMap = new Map(clientAssetCounts.map(item => [item._id, item.assetCount]));

    return clientTicketMetrics.map(client => ({
      clientId: client._id || 'Unknown',
      clientName: client._id || 'Unknown Client',
      ticketCount: client.ticketCount,
      openTickets: client.openTickets,
      avgResolutionTime: Math.round((client.avgResolutionTime || 0) / (1000 * 60 * 60)), // Hours
      slaCompliance: Math.round(client.slaCompliance || 100),
      assetCount: assetMap.get(client._id) || 0,
      monthlyRevenue: 0, // TODO: Implement billing integration
      satisfaction: 4.0, // TODO: Implement satisfaction tracking
      lastActivity: client.lastActivity || new Date()
    }));
  }

  /**
   * Get technician performance metrics
   */
  static async getTechnicianMetrics(orgId: string, dateRange?: DateRange): Promise<TechnicianMetrics[]> {
    const ticketsCollection = await this.getTicketsCollection();
    const scheduleCollection = await this.getScheduleCollection();

    const dateFilter = dateRange ? {
      createdAt: {
        $gte: dateRange.from,
        $lte: dateRange.to
      }
    } : {};

    // Get technician ticket metrics
    const technicianTicketMetrics = await ticketsCollection.aggregate([
      { $match: { orgId, assignee: { $ne: null }, ...dateFilter } },
      {
        $group: {
          _id: '$assignee',
          assignedTickets: { $sum: 1 },
          resolvedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Closed'] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]).toArray();

    // Get technician workload from schedule
    const scheduleFilter = dateRange ? {
      startTime: {
        $gte: dateRange.from,
        $lte: dateRange.to
      }
    } : {};

    const technicianWorkload = await scheduleCollection.aggregate([
      { $match: { orgId, assignee: { $ne: null }, ...scheduleFilter } },
      {
        $group: {
          _id: '$assignee',
          workloadHours: {
            $sum: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        }
      }
    ]).toArray();

    // Combine metrics
    const workloadMap = new Map(technicianWorkload.map(item => [item._id, item.workloadHours]));

    return technicianTicketMetrics.map(tech => {
      const workloadHours = workloadMap.get(tech._id) || 0;
      const standardWorkHours = dateRange ? 
        Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) * 8 : 160; // 8 hours/day

      return {
        technicianId: tech._id,
        technicianName: tech._id,
        assignedTickets: tech.assignedTickets,
        resolvedTickets: tech.resolvedTickets,
        avgResolutionTime: Math.round((tech.avgResolutionTime || 0) / (1000 * 60 * 60)), // Hours
        workloadHours: Math.round(workloadHours),
        utilizationRate: Math.round((workloadHours / standardWorkHours) * 100),
        clientRating: 4.2 // TODO: Implement client rating system
      };
    });
  }

  /**
   * Get service type metrics
   */
  static async getServiceMetrics(orgId: string, dateRange?: DateRange): Promise<ServiceMetrics[]> {
    const ticketsCollection = await this.getTicketsCollection();

    const dateFilter = dateRange ? {
      createdAt: {
        $gte: dateRange.from,
        $lte: dateRange.to
      }
    } : {};

    const serviceMetrics = await ticketsCollection.aggregate([
      { $match: { orgId, ...dateFilter } },
      {
        $group: {
          _id: '$category',
          ticketCount: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Closed'] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          },
          uniqueClients: { $addToSet: '$client' }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ['$resolvedCount', '$ticketCount'] },
              100
            ]
          },
          clientCount: { $size: '$uniqueClients' }
        }
      }
    ]).toArray();

    return serviceMetrics.map(service => ({
      serviceType: service._id || 'Other',
      ticketCount: service.ticketCount,
      avgResolutionTime: Math.round((service.avgResolutionTime || 0) / (1000 * 60 * 60)), // Hours
      successRate: Math.round(service.successRate || 0),
      revenue: 0, // TODO: Implement billing integration
      clientCount: service.clientCount
    }));
  }

  /**
   * Get filtered report data based on module and filters
   */
  static async getReportData(
    orgId: string,
    module: string,
    columns: string[],
    filters: ReportFilter[],
    dateRange?: DateRange,
    groupBy?: string
  ): Promise<ReportData[]> {
    let collection;
    let dateField = 'createdAt';

    // Select appropriate collection based on module
    switch (module) {
      case 'Tickets':
        collection = await this.getTicketsCollection();
        break;
      case 'Assets':
        collection = await this.getAssetsCollection();
        dateField = 'lastSeen';
        break;
      case 'Incidents':
        collection = await this.getIncidentsCollection();
        break;
      case 'Change Management':
        collection = await this.getChangeRequestsCollection();
        dateField = 'plannedStartDate';
        break;
      case 'Projects':
        collection = await this.getProjectsCollection();
        dateField = 'startDate';
        break;
      default:
        throw new Error(`Unsupported module: ${module}`);
    }

    // Build query filter
    const query: any = { orgId };

    // Add date range filter
    if (dateRange) {
      query[dateField] = {
        $gte: dateRange.from,
        $lte: dateRange.to
      };
    }

    // Add custom filters
    filters.forEach(filter => {
      if (!filter.field || !filter.operator || !filter.value) return;

      switch (filter.operator) {
        case 'equals':
          query[filter.field] = filter.value;
          break;
        case 'not_equals':
          query[filter.field] = { $ne: filter.value };
          break;
        case 'contains':
          query[filter.field] = { $regex: filter.value, $options: 'i' };
          break;
        case 'greater_than':
          query[filter.field] = { $gt: Number(filter.value) };
          break;
        case 'less_than':
          query[filter.field] = { $lt: Number(filter.value) };
          break;
      }
    });

    if (groupBy) {
      // Grouped aggregation
      const pipeline = [
        { $match: query },
        {
          $group: {
            _id: `$${groupBy}`,
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            [groupBy]: '$_id',
            count: 1,
            _id: 0
          }
        }
      ];

      return await collection.aggregate(pipeline).toArray();
    } else {
      // Direct query with selected columns
      const projection: any = {};
      columns.forEach(col => {
        projection[col] = 1;
      });

      const results = await collection.find(query, { projection }).toArray();
      return results.map(doc => {
        const result: any = {};
        columns.forEach(col => {
          result[col] = doc[col];
        });
        return result;
      });
    }
  }

  /**
   * Get trending data for dashboard charts
   */
  static async getTrendingData(orgId: string, metric: string, days: number = 30): Promise<any[]> {
    const ticketsCollection = await this.getTicketsCollection();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let pipeline: any[] = [
      {
        $match: {
          orgId,
          createdAt: { $gte: startDate }
        }
      }
    ];

    switch (metric) {
      case 'tickets_by_day':
        pipeline.push(
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              date: '$_id',
              count: 1,
              _id: 0
            }
          },
          { $sort: { date: 1 } }
        );
        break;

      case 'tickets_by_priority':
        pipeline.push(
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              priority: '$_id',
              count: 1,
              _id: 0
            }
          }
        );
        break;

      case 'tickets_by_status':
        pipeline.push(
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              status: '$_id',
              count: 1,
              _id: 0
            }
          }
        );
        break;

      default:
        throw new Error(`Unsupported metric: ${metric}`);
    }

    return await ticketsCollection.aggregate(pipeline).toArray();
  }
}