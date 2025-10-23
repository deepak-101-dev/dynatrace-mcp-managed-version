import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";
import { MaintenanceWindow } from "../utils/types.js";

export function registerMaintenanceTools(server: McpServer) {
  //  Tool: Create temporary tag
  server.tool("create_temp_tag", "Create a temporary tag for maintenance window filtering with support for hosts and kubernetes clusters", {
    crqNumber: z.string().describe("CRQ number for the temporary tag"),
    description: z.string().optional().describe("Description of the temporary tag"),
    hosts: z.array(z.string()).optional().describe("Array of hostnames to tag (e.g., ['rbsibsesplrla24.rebuscloud.co.uk'])"),
    kubernetes: z.array(z.string()).optional().describe("Array of kubernetes cluster names to tag"),
  }, async ({ crqNumber, description, hosts, kubernetes }) => {
    const endpoint = "/settings/objects";
    const tempTagConfig = {
      schemaId: "builtin:tags.auto-tagging",
      scope: "environment",
      value: {
        name: `TEMP-TAG-MW-${crqNumber}-${Date.now()}`,
        description: description || `Temporary tag for maintenance window ${crqNumber}`,
        rules: [
          {
            type: "HOST",
            enabled: true,
            valueFormat: "{Name}",
            conditions: hosts ? hosts.map(host => ({
              key: {
                attribute: "HOST_NAME"
              },
              comparisonInfo: {
                type: "STRING",
                operator: "EQUALS",
                value: host,
                negate: false
              }
            })) : []
          },
          {
            type: "KUBERNETES_CLUSTER",
            enabled: true,
            valueFormat: "{Name}",
            conditions: kubernetes ? kubernetes.map(cluster => ({
              key: {
                attribute: "KUBERNETES_CLUSTER_NAME"
              },
              comparisonInfo: {
                type: "STRING",
                operator: "EQUALS",
                value: cluster,
                negate: false
              }
            })) : []
          }
        ]
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([tempTagConfig]);
      
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
            text: ` Temporary tag created successfully for CRQ ${crqNumber}\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to create temporary tag: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Create maintenance window
  server.tool("create_maintenance_window", "Create a new maintenance window for specified hosts and applications", {
    name: z.string().describe("Name of the maintenance window"),
    description: z.string().optional().describe("Description of the maintenance window"),
    startTime: z.string().describe("Start time in ISO format (e.g., '2025-10-06T08:00:00Z')"),
    endTime: z.string().describe("End time in ISO format (e.g., '2025-10-06T10:00:00Z')"),
    timeZone: z.string().optional().describe("Time zone (default: UTC)"),
    tempTagName: z.string().describe("Name of the temporary tag to use for filtering"),
    hostTags: z.array(z.string()).optional().describe("List of existing host tags to include (format: 'key:value')"),
    applicationTags: z.array(z.string()).optional().describe("List of existing application tags to include (format: 'key:value')"),
    hostIds: z.array(z.string()).optional().describe("List of specific host IDs to include"),
    applicationIds: z.array(z.string()).optional().describe("List of specific application IDs to include"),
    maintenanceType: z.enum(["PLANNED", "UNPLANNED"]).optional().describe("Type of maintenance (default: PLANNED)"),
    suppression: z.enum(["DONT_DETECT_PROBLEMS", "DETECT_PROBLEMS_DONT_ALERT"]).optional().describe("Problem detection during maintenance (default: DONT_DETECT_PROBLEMS)"),
    disableSyntheticMonitorExecution: z.boolean().optional().describe("Disable synthetic monitor execution during maintenance (default: true)"),
  }, async ({ name, description, startTime, endTime, timeZone, tempTagName, hostTags, applicationTags, hostIds, applicationIds, maintenanceType, suppression, disableSyntheticMonitorExecution }) => {
    const endpoint = "/settings/objects";
    const maintenanceWindowConfig = {
      schemaId: "builtin:maintenance-window",
      scope: "environment",
      value: {
        name,
        description: description || `Maintenance window: ${name}`,
        timeZone: timeZone || "UTC",
        maintenanceWindows: [
          {
            startTime,
            endTime,
            type: maintenanceType || "PLANNED",
            suppression: suppression || "DONT_DETECT_PROBLEMS",
            disableSyntheticMonitorExecution: disableSyntheticMonitorExecution !== false,
            filters: [
              {
                entityType: "HOST",
                tags: hostTags || [],
                entityIds: hostIds || []
              },
              {
                entityType: "APPLICATION",
                tags: applicationTags || [],
                entityIds: applicationIds || []
              }
            ]
          }
        ]
      }
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify([maintenanceWindowConfig]);
      
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
            text: ` Maintenance window '${name}' created successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to create maintenance window: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: List maintenance windows
  server.tool("list_maintenance_windows", "List all maintenance windows", {
    pageSize: z.number().optional().describe("Number of results per page (max 500)"),
    nextPageKey: z.string().optional().describe("Cursor for next page of results"),
  }, async ({ pageSize, nextPageKey }) => {
    let endpoint = "/settings/objects?schemaIds=builtin:maintenance-window";
    const params = new URLSearchParams();
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (nextPageKey) params.append("nextPageKey", nextPageKey);
    if (params.toString()) endpoint += `&${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve maintenance windows from Dynatrace" }],
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

  //  Tool: Toggle maintenance window
  server.tool("toggle_maintenance_window", "Enable or disable a maintenance window", {
    objectId: z.string().describe("The ID of the maintenance window object"),
    enabled: z.boolean().describe("Whether to enable (true) or disable (false) the maintenance window"),
  }, async ({ objectId, enabled }) => {
    const endpoint = `/settings/objects/${objectId}`;
    
    try {
      // First get the current object to preserve other properties
      const getResponse = await fetch(`${DYNATRACE_ENV_URL}/api/v2${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Api-Token ${process.env.DYNATRACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!getResponse.ok) {
        throw new Error(`Failed to get maintenance window: ${getResponse.status}`);
      }
      const currentObject = await getResponse.json();
      
      // Update the enabled status
      const updatePayload = {
        ...currentObject,
        value: {
          ...currentObject.value,
          enabled
        }
      };

      const response = await fetch(`${DYNATRACE_ENV_URL}/api/v2${endpoint}`, {
        method: "PUT",
        body: JSON.stringify(updatePayload),
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
            text: ` Maintenance window ${objectId} ${enabled ? 'enabled' : 'disabled'} successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to toggle maintenance window: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Delete maintenance window
  server.tool("delete_maintenance_window", "Delete a maintenance window", {
    objectId: z.string().describe("The ID of the maintenance window object to delete"),
  }, async ({ objectId }) => {
    const endpoint = `/settings/objects/${objectId}`;
    
    try {
      const response = await fetch(`${DYNATRACE_ENV_URL}/api/v2${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return {
        content: [
          {
            type: "text",
            text: ` Maintenance window ${objectId} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to delete maintenance window: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Get maintenance window details
  server.tool("get_maintenance_window_details", "Get detailed information about a specific maintenance window", {
    objectId: z.string().describe("The ID of the maintenance window object"),
  }, async ({ objectId }) => {
    const endpoint = `/settings/objects/${objectId}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve maintenance window details for ID: ${objectId}` }],
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
}
