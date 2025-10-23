// Common types used across the Dynatrace MCP server

export interface DynatraceApiResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

export interface Problem {
  problemId: string;
  displayId: string;
  title: string;
  impactLevel: string;
  severityLevel: string;
  status: string;
  affectedEntities: Array<{
    entityId: {
      id: string;
      type: string;
    };
    name: string;
  }>;
  impactedEntities: Array<{
    entityId: {
      id: string;
      type: string;
    };
    name: string;
  }>;
  rootCauseEntity?: {
    entityId: {
      id: string;
      type: string;
    };
    name: string;
  };
  managementZones: Array<{
    id: string;
    name: string;
  }>;
  entityTags: Array<{
    context: string;
    key: string;
    value?: string;
    stringRepresentation: string;
  }>;
  problemFilters: Array<{
    id: string;
    name: string;
  }>;
  startTime: number;
  endTime: number;
}

export interface HostMonitoringSettings {
  enabled: boolean;
  monitoringMode: 'FULL_STACK' | 'INFRASTRUCTURE' | 'OFF';
  autoInjection: boolean;
  customHostMetadata?: Array<{
    key: string;
    value: string;
  }>;
}

export interface AnomalyThresholds {
  enabled: boolean;
  cpuUsageThreshold?: number;
  cpuSaturationThreshold?: number;
  memoryUsageThreshold?: number;
  memorySaturationThreshold?: number;
  diskUsageThreshold?: number;
  diskSaturationThreshold?: number;
  networkUtilizationThreshold?: number;
  alertingEnabled?: boolean;
  alertingDelay?: number;
}

export interface MaintenanceWindow {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  tempTagName?: string;
  hostTags?: string[];
  applicationTags?: string[];
  hostIds?: string[];
  applicationIds?: string[];
  maintenanceType?: 'PLANNED' | 'UNPLANNED';
  suppression?: 'DONT_DETECT_PROBLEMS' | 'DETECT_PROBLEMS_DONT_ALERT';
  disableSyntheticMonitorExecution?: boolean;
}

export interface DashboardTile {
  name: string;
  tileType: string;
  metricSelector?: string;
  entitySelector?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  configured?: boolean;
  chartVisible?: boolean;
}

export interface Dashboard {
  name: string;
  description?: string;
  owner?: string;
  shared?: boolean;
  timeframe?: string;
  managementZone?: string;
  tiles: DashboardTile[];
}
