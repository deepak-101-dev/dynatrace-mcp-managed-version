import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";
import { Dashboard, DashboardTile } from "../utils/types.js";

export function registerDashboardTools(server: McpServer) {
  //  Tool: Create empty dashboard
  server.tool("create_dashboard", "Create a new empty dashboard in Dynatrace", {
    name: z.string().describe("Name of the dashboard to create"),
    description: z.string().optional().describe("Optional description for the dashboard"),
    owner: z.string().optional().describe("Owner of the dashboard (defaults to current user)"),
  }, async ({ name, description, owner }) => {
    const endpoint = "/dashboards";
    const dashboardConfig = {
      dashboardMetadata: {
        name,
        description: description || `Dashboard: ${name}`,
        owner: owner || "Dynatrace MCP",
        sharingDetails: {
          linkShared: true,
          published: false
        },
        dashboardFilter: {
          timeframe: "-2h",
          managementZone: null
        }
      },
      tiles: []
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/config/v1${endpoint}`;
      const requestBody = JSON.stringify(dashboardConfig);
      
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
            text: ` Dashboard '${name}' created successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to create dashboard: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Create dashboard with tiles
  server.tool("create_dashboard_with_tiles", "Create a new dashboard with configured tiles and metrics", {
    name: z.string().describe("Name of the dashboard"),
    description: z.string().optional().describe("Description of the dashboard"),
    owner: z.string().optional().describe("Owner of the dashboard (defaults to current user)"),
    shared: z.boolean().optional().describe("Whether the dashboard is shared (default: true)"),
    timeframe: z.string().optional().describe("Default timeframe (e.g., 'l_2_HOURS', 'l_24_HOURS')"),
    managementZone: z.string().optional().describe("Management zone ID to filter by"),
    tiles: z.array(z.object({
      name: z.string().describe("Name of the tile"),
      tileType: z.string().describe("Type of tile (HOSTS, APPLICATIONS, HOST, etc.)"),
      metricSelector: z.string().optional().describe("Metric selector for the tile"),
      entitySelector: z.string().optional().describe("Entity selector for the tile"),
      width: z.number().optional().describe("Width of the tile in pixels (default: 304)"),
      height: z.number().optional().describe("Height of the tile in pixels (default: 304)"),
      top: z.number().optional().describe("Top position of the tile in pixels (default: 0)"),
      left: z.number().optional().describe("Left position of the tile in pixels (default: 0)"),
      configured: z.boolean().optional().describe("Whether the tile is configured (default: true)"),
      chartVisible: z.boolean().optional().describe("Whether the chart is visible (default: true)"),
    })).describe("Array of tiles to add to the dashboard"),
  }, async ({ name, description, owner, shared, timeframe, managementZone, tiles }) => {
    const endpoint = "/dashboards";
    const dashboardConfig = {
      dashboardMetadata: {
        name,
        description: description || `Dashboard: ${name}`,
        owner: owner || "Dynatrace MCP",
        sharingDetails: {
          linkShared: shared !== false,
          published: false
        },
        dashboardFilter: {
          timeframe: timeframe || "-2h",
          managementZone: managementZone || null
        }
      },
      tiles: tiles.map((tile, index) => ({
        name: tile.name,
        tileType: tile.tileType,
        configured: tile.configured !== false,
        bounds: {
          top: tile.top || (index * 320),
          left: tile.left || 0,
          width: tile.width || 304,
          height: tile.height || 304
        },
        tileFilter: {
          timeframe: timeframe || "-2h",
          managementZone: managementZone || null
        },
        ...(tile.metricSelector && { metricSelector: tile.metricSelector }),
        ...(tile.entitySelector && { entitySelector: tile.entitySelector }),
        ...(tile.chartVisible !== false && { chartVisible: true })
      }))
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/config/v1${endpoint}`;
      const requestBody = JSON.stringify(dashboardConfig);
      
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
            text: ` Dashboard '${name}' created with ${tiles.length} tiles\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to create dashboard with tiles: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Create CPU usage dashboard
  server.tool("create_cpu_usage_dashboard", "Create a dashboard specifically for CPU usage monitoring with entity filtering", {
    name: z.string().describe("Name of the dashboard"),
    entitySelector: z.string().describe("Entity selector (e.g., 'tag(Application-IT_TBW)', 'type(HOST)')"),
    timeframe: z.string().optional().describe("Timeframe (default: 'l_2_HOURS')"),
    managementZone: z.string().optional().describe("Management zone ID"),
  }, async ({ name, entitySelector, timeframe, managementZone }) => {
    const endpoint = "/dashboards";
    const dashboardConfig = {
      dashboardMetadata: {
        name,
        description: `CPU Usage Dashboard: ${name}`,
        owner: "Dynatrace MCP",
        sharingDetails: {
          linkShared: true,
          published: false
        },
        dashboardFilter: {
          timeframe: timeframe || "-2h",
          managementZone: managementZone || null
        }
      },
      tiles: [
        {
          name: "CPU Usage Line Chart",
          tileType: "DATA_EXPLORER",
          configured: true,
          bounds: {
            top: 0,
            left: 0,
            width: 608,
            height: 304
          },
          tileFilter: {
            timeframe: timeframe || "-2h",
            managementZone: managementZone || null
          },
          metricSelector: "builtin:host.cpu.usage",
          entitySelector: entitySelector,
          chartVisible: true
        },
        {
          name: "CPU Usage Heatmap",
          tileType: "DATA_EXPLORER",
          configured: true,
          bounds: {
            top: 320,
            left: 0,
            width: 608,
            height: 304
          },
          tileFilter: {
            timeframe: timeframe || "-2h",
            managementZone: managementZone || null
          },
          metricSelector: "builtin:host.cpu.usage",
          entitySelector: entitySelector,
          chartVisible: true
        }
      ]
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/config/v1${endpoint}`;
      const requestBody = JSON.stringify(dashboardConfig);
      
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
            text: ` CPU Usage Dashboard '${name}' created successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to create CPU usage dashboard: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Get dashboard details
  server.tool("get_dashboard_details", "Get detailed information about a specific dashboard", {
    dashboardId: z.string().describe("ID of the dashboard to retrieve"),
  }, async ({ dashboardId }) => {
    const endpoint = `/dashboards/${dashboardId}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve dashboard details for ID: ${dashboardId}` }],
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

  //  Tool: List dashboards
  server.tool("list_dashboards", "List all dashboards in the environment", {
    pageSize: z.number().optional().describe("Number of dashboards to return (default: 50)"),
  }, async ({ pageSize }) => {
    let endpoint = "/dashboards";
    if (pageSize) {
      endpoint += `?pageSize=${pageSize}`;
    }
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve dashboards from Dynatrace" }],
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
