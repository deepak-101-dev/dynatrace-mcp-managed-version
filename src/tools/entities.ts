import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";

export function registerEntityTools(server: McpServer) {
  //  Tool: Get entities by tag
  server.tool("get_entities_by_tag", "Get hosts and other monitored entities filtered by tag", {
    tag: z.string().describe("Tag to filter entities by (e.g., 'Application-BS_SVA', 'Azure Cloud', 'Production')"),
    entityType: z.string().optional().describe("Entity type to filter by (e.g., 'HOST', 'SERVICE', 'APPLICATION'). If not specified, returns all entity types"),
    pageSize: z.number().optional().describe("Number of entities to return (default: 50, max: 500)"),
    healthState: z.enum(["HEALTHY", "UNHEALTHY"]).optional().describe("Filter by health state"),
  }, async ({ tag, entityType, pageSize, healthState }) => {
    let endpoint = "/entities";
    const params = new URLSearchParams();
    params.append("entitySelector", `tag("${tag}")`);
    if (entityType) params.append("entitySelector", `type("${entityType}")`);
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (healthState) params.append("healthState", healthState);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve entities with tag: ${tag}` }],
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

  //  Tool: Get hosts by host group
  server.tool("get_hosts_by_host_group", "Get all hosts that belong to a specific host group", {
    hostGroupName: z.string().describe("Name of the host group to get hosts from"),
    pageSize: z.number().optional().describe("Number of hosts to return (default: 50, max: 500)"),
    healthState: z.enum(["HEALTHY", "UNHEALTHY"]).optional().describe("Filter by health state"),
  }, async ({ hostGroupName, pageSize, healthState }) => {
    let endpoint = "/entities";
    const params = new URLSearchParams();
    params.append("entitySelector", `type("HOST"),hostGroup("${hostGroupName}")`);
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (healthState) params.append("healthState", healthState);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve hosts from host group: ${hostGroupName}` }],
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

  //  Tool: Get entities by Kubernetes cluster
  server.tool("get_entities_by_kubernetes_cluster", "Get all entities (hosts, services, pods, etc.) that belong to a specific Kubernetes cluster", {
    clusterName: z.string().describe("Name of the Kubernetes cluster to get entities from"),
    entityType: z.string().optional().describe("Specific entity type to filter by (e.g., 'HOST', 'SERVICE', 'KUBERNETES_SERVICE'). If not specified, returns all entity types"),
    pageSize: z.number().optional().describe("Number of entities to return (default: 50, max: 500)"),
    healthState: z.enum(["HEALTHY", "UNHEALTHY"]).optional().describe("Filter by health state"),
  }, async ({ clusterName, entityType, pageSize, healthState }) => {
    let endpoint = "/entities";
    const params = new URLSearchParams();
    params.append("entitySelector", `kubernetesCluster("${clusterName}")`);
    if (entityType) params.append("entitySelector", `type("${entityType}")`);
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (healthState) params.append("healthState", healthState);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve entities from Kubernetes cluster: ${clusterName}` }],
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
