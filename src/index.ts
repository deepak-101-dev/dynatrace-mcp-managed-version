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

  // Set up stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup information
  if (loggingConfig.enableDebug) {
    console.error("🚀 Dynatrace MCP Server started successfully!");
    console.error(" Available modules:");
    console.error("   • Problems Management (8 tools)");
    console.error("   • Maintenance Windows (6 tools)");
    console.error("   • Host Monitoring (7 tools)");
    console.error("   • Dashboards (5 tools)");
    console.error("   • Events Management (7 tools)");
    console.error("   • Metrics (2 tools)");
    console.error("   • Entity Management (3 tools)");
    console.error("🔧 Total: 38+ Dynatrace MCP tools ready!");
    console.error(`📝 Server: ${serverConfig.name} v${serverConfig.version}`);
    console.error(` Log Level: ${loggingConfig.level}`);
  }
}

main().catch((error) => {
  console.error(" Failed to start Dynatrace MCP Server:", error);
  console.error("Error details:", error);
  process.exit(1);
});