import "./bootstrap-env.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import configuration
import { serverConfig, loggingConfig } from "./config/environment.js";

// Import all tool modules
import { registerProblemTools } from "./tools/problems.js";
import { registerMaintenanceTools } from "./tools/maintenance.js";
import { registerMonitoringTools } from "./tools/monitoring.js";
import { registerDashboardTools } from "./tools/dashboards.js";
import { registerEventTools } from "./tools/events.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerEntityTools } from "./tools/entities.js";
import { registerPrompts } from "./tools/prompts.js";
import { registerProblemResources } from "./resources/problems.js";

async function main() {
  // Create MCP server with environment configuration
  const server = new McpServer(
    {
      name: serverConfig.name,
      version: serverConfig.version,
    },
    {
      capabilities: {
        tools: {
          listChanged: true,
        },
        prompts: {
          listChanged: true,
        },
        resources: {
          listChanged: true,
        },
      },
    }
  );

  // Register all tool modules
  registerProblemTools(server);
  registerMaintenanceTools(server);
  registerMonitoringTools(server);
  registerDashboardTools(server);
  registerEventTools(server);
  registerMetricsTools(server);
  registerEntityTools(server);
  
  // Register prompts
  registerPrompts(server);
  
  // Register resources
  registerProblemResources(server);

  // Set up stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup information
  if (loggingConfig.enableDebug) {
    console.error(`Using MCP Server config: ${serverConfig.name} v${serverConfig.version}`);
    console.error(`Loaded Dynatrace URL: ${process.env.DYNATRACE_ENV_URL ? 'Loaded' : 'missing'}`);
    console.error("Dynatrace MCP Server started successfully!");
    console.error(`Server: ${serverConfig.name} v${serverConfig.version}`);
    console.error(`Log Level: ${loggingConfig.level}`);
  }
}

main().catch((error) => {
  console.error(" Failed to start Dynatrace MCP Server:", error);
  console.error("Error details:", error);
  process.exit(1);
});