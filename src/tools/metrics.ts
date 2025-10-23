import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";

export function registerMetricsTools(server: McpServer) {
  //  Tool: List metrics
  server.tool("list_metrics", "List available metrics in Dynatrace with optional filtering", {
    metricSelector: z.string().optional().describe("Optional metric selector filter (e.g., 'builtin:host.cpu.usage')"),
    pageSize: z.number().optional().describe("Number of metrics to return (default: 50, max: 500)"),
    fields: z.string().optional().describe("Additional fields to include (e.g., '+description,+unit')"),
  }, async ({ metricSelector, pageSize, fields }) => {
    let endpoint = "/metrics";
    const params = new URLSearchParams();
    if (metricSelector) params.append("metricSelector", metricSelector);
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (fields) params.append("fields", fields);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve metrics from Dynatrace" }],
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

  //  Tool: Query metric
  server.tool("query_metric", "Get timeseries data for a metric selector and timeframe", {
    metricSelector: z.string().describe("Metric selector (e.g., 'builtin:host.cpu.usage')"),
    from: z.string().optional().describe("Start time (e.g., 'now-1h', '2021-01-25T05:57:01.123+01:00')"),
    to: z.string().optional().describe("End time (e.g., 'now', '2021-01-25T05:57:01.123+01:00')"),
    resolution: z.string().optional().describe("Resolution (e.g., '1m', '5m', '1h')"),
    entitySelector: z.string().optional().describe("Entity selector filter (e.g., 'type(HOST)')"),
    fields: z.string().optional().describe("Additional fields to include"),
  }, async ({ metricSelector, from, to, resolution, entitySelector, fields }) => {
    let endpoint = "/metrics/query";
    const params = new URLSearchParams();
    params.append("metricSelector", metricSelector);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (resolution) params.append("resolution", resolution);
    if (entitySelector) params.append("entitySelector", entitySelector);
    if (fields) params.append("fields", fields);
    endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve metric data from Dynatrace" }],
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
