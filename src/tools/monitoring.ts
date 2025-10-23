import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";
import { HostMonitoringSettings, AnomalyThresholds } from "../utils/types.js";

export function registerMonitoringTools(server: McpServer) {
  //  Tool: Get host monitoring details
  server.tool("get_host_monitoring_details", "Get monitoring details and configurations for a specific host by hostname", {
    hostname: z.string().describe("Hostname to get monitoring details for (e.g., 'rbsibsesplrla33.rebuscloud.co.uk')"),
  }, async ({ hostname }) => {
    const endpoint = `/entities?entitySelector=type(HOST),entityName.equals("${hostname}")&pageSize=1`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data || !data.entities || data.entities.length === 0) {
      return {
        content: [{ type: "text", text: ` Host not found: ${hostname}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.entities[0], null, 2),
        },
      ],
    };
  });

  //  Tool: Get host monitoring settings
  server.tool("get_host_monitoring_settings", "Get host-level monitoring settings for a specific host by hostname", {
    hostname: z.string().describe("Hostname to get monitoring settings for (e.g., 'rbsibsesplrla33.rebuscloud.co.uk')"),
  }, async ({ hostname }) => {
    const endpoint = `/settings/objects?schemaIds=builtin:host.monitoring&scopes=HOST-${hostname}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve monitoring settings for host: ${hostname}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  //  Tool: Update host monitoring settings
  server.tool("update_host_monitoring_settings", "Update host-level monitoring settings for a specific host", {
    hostname: z.string().describe("Hostname to update monitoring settings for"),
    enabled: z.boolean().describe("Enable or disable monitoring for the host"),
    monitoringMode: z.enum(["FULL_STACK", "INFRASTRUCTURE", "OFF"]).optional().describe("Monitoring mode for the host"),
    autoInjection: z.boolean().optional().describe("Enable or disable auto-injection"),
    customHostMetadata: z.array(z.object({
      key: z.string(),
      value: z.string()
    })).optional().describe("Custom host metadata key-value pairs"),
  }, async ({ hostname, enabled, monitoringMode, autoInjection, customHostMetadata }) => {
    const endpoint = "/settings/objects";
    const hostMonitoringConfig = {
      schemaId: "builtin:host.monitoring",
      scope: `HOST-${hostname}`,
      value: {
        enabled,
        monitoringMode: monitoringMode || "FULL_STACK",
        autoInjection: autoInjection !== false,
        customHostMetadata: customHostMetadata || []
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([hostMonitoringConfig]);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: ` Host monitoring settings updated for ${hostname}\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to update host monitoring settings: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Enable host monitoring
  server.tool("enable_host_monitoring", "Enable monitoring for a specific host", {
    hostname: z.string().describe("Hostname to enable monitoring for"),
    monitoringMode: z.enum(["FULL_STACK", "INFRASTRUCTURE"]).optional().describe("Monitoring mode to enable"),
  }, async ({ hostname, monitoringMode }) => {
    const endpoint = "/settings/objects";
    const hostMonitoringConfig = {
      schemaId: "builtin:host.monitoring",
      scope: `HOST-${hostname}`,
      value: {
        enabled: true,
        monitoringMode: monitoringMode || "FULL_STACK",
        autoInjection: true,
        customHostMetadata: []
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([hostMonitoringConfig]);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: ` Host monitoring enabled for ${hostname}\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to enable host monitoring: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Disable host monitoring
  server.tool("disable_host_monitoring", "Disable monitoring for a specific host", {
    hostname: z.string().describe("Hostname to disable monitoring for"),
  }, async ({ hostname }) => {
    const endpoint = "/settings/objects";
    const hostMonitoringConfig = {
      schemaId: "builtin:host.monitoring",
      scope: `HOST-${hostname}`,
      value: {
        enabled: false,
        monitoringMode: "OFF",
        autoInjection: false,
        customHostMetadata: []
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([hostMonitoringConfig]);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: ` Host monitoring disabled for ${hostname}\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to disable host monitoring: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Get host anomaly thresholds
  server.tool("get_host_anomaly_thresholds", "Get anomaly detection thresholds for a specific host (CPU, memory, disk)", {
    hostname: z.string().describe("Hostname to get anomaly detection thresholds for"),
  }, async ({ hostname }) => {
    const endpoint = `/settings/objects?schemaIds=builtin:anomaly-detection.infrastructure-hosts&scopes=HOST-${hostname}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve anomaly thresholds for host: ${hostname}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });

  //  Tool: Update host anomaly thresholds
  server.tool("update_host_anomaly_thresholds", "Update anomaly detection thresholds for a specific host", {
    hostname: z.string().describe("Hostname to update anomaly detection thresholds for"),
    enabled: z.boolean().describe("Enable or disable anomaly detection for the host"),
    cpuUsageThreshold: z.number().optional().describe("CPU usage threshold percentage (0-100)"),
    cpuSaturationThreshold: z.number().optional().describe("CPU saturation threshold percentage (0-100)"),
    memoryUsageThreshold: z.number().optional().describe("Memory usage threshold percentage (0-100)"),
    memorySaturationThreshold: z.number().optional().describe("Memory saturation threshold percentage (0-100)"),
    diskUsageThreshold: z.number().optional().describe("Disk usage threshold percentage (0-100)"),
    diskSaturationThreshold: z.number().optional().describe("Disk saturation threshold percentage (0-100)"),
    networkUtilizationThreshold: z.number().optional().describe("Network utilization threshold percentage (0-100)"),
    alertingEnabled: z.boolean().optional().describe("Enable or disable alerting for anomalies"),
    alertingDelay: z.number().optional().describe("Alerting delay in minutes"),
  }, async ({ hostname, enabled, cpuUsageThreshold, cpuSaturationThreshold, memoryUsageThreshold, memorySaturationThreshold, diskUsageThreshold, diskSaturationThreshold, networkUtilizationThreshold, alertingEnabled, alertingDelay }) => {
    const endpoint = "/settings/objects";
    const anomalyConfig = {
      schemaId: "builtin:anomaly-detection.infrastructure-hosts",
      scope: `HOST-${hostname}`,
      value: {
        enabled,
        cpuThresholds: {
          enabled: enabled,
          usageThreshold: cpuUsageThreshold || 80,
          saturationThreshold: cpuSaturationThreshold || 90
        },
        memoryThresholds: {
          enabled: enabled,
          usageThreshold: memoryUsageThreshold || 80,
          saturationThreshold: memorySaturationThreshold || 90
        },
        diskThresholds: {
          enabled: enabled,
          usageThreshold: diskUsageThreshold || 80,
          saturationThreshold: diskSaturationThreshold || 90
        },
        networkThresholds: {
          enabled: enabled,
          utilizationThreshold: networkUtilizationThreshold || 80
        },
        alerting: {
          enabled: alertingEnabled !== false,
          delay: alertingDelay || 5
        }
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([anomalyConfig]);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: ` Host anomaly thresholds updated for ${hostname}\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to update host anomaly thresholds: ${error}`,
          },
        ],
      };
    }
  });
}
