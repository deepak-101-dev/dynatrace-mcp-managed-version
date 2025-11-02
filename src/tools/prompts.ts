import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  // Prompt: Comprehensive Problem Explanation
  server.prompt(
    "explain_problem_comprehensively",
    "Comprehensive problem explanation and analysis prompt for Dynatrace problems. This prompt guides the AI assistant to provide a detailed analysis of a specific problem, including its impact, root cause, evidence, affected entities, and suggested remediation steps.",
    {
      problemId: z
        .string()
        .describe(
          "The problem ID or display ID (e.g., 'P-12345' or the actual problem ID) to analyze"
        ),
      includeMetrics: z
        .enum(["true", "false"])
        .optional()
        .describe(
          "Whether to include related metrics and performance data in the analysis (default: 'false')"
        ),
      includeComments: z
        .enum(["true", "false"])
        .optional()
        .describe(
          "Whether to include existing problem comments in the analysis (default: 'true')"
        ),
    },
    async ({ problemId, includeMetrics, includeComments }) => {
      const includeMetricsValue = includeMetrics === "true"; // default: false
      const includeCommentsValue = includeComments !== "false"; // default: true
      const promptTemplate = `Analyze the Dynatrace problem with ID: ${problemId}

Please provide a comprehensive explanation that includes:

1. **Problem Overview**
   - Problem status and severity
   - Start time and duration
   - Current impact level

2. **Root Cause Analysis**
   - Primary root cause and contributing factors
   - Evidence and symptoms leading to the problem
   - Relationship to other problems or events

3. **Affected Entities**
   - Hosts, services, or applications impacted
   - Impact severity for each entity
   - Propagation path if applicable

4. **Technical Details**
   - Error messages, exceptions, or failures
   - Performance degradation metrics
   - Configuration issues if any
   ${includeMetricsValue ? "- Related metrics and performance data" : ""}

5. **Resolution Recommendations**
   - Immediate actions to mitigate impact
   - Long-term fixes to prevent recurrence
   - Configuration changes if needed
   ${includeCommentsValue ? "- Reference to existing comments and previous actions" : ""}

6. **Risk Assessment**
   - Business impact assessment
   - Potential escalation risks
   - Dependencies that might be affected

Use the available Dynatrace tools to:
- Get detailed problem information using get_problem_details with full evidence and impact analysis
${includeCommentsValue ? "- Retrieve all comments using get_problem_comments" : ""}
${includeMetricsValue ? "- Query related metrics if needed" : ""}

Provide a clear, structured analysis that helps operations teams understand and resolve the problem quickly.`;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: promptTemplate,
            },
          },
        ],
      };
    }
  );

  // Prompt: Environment Health Analysis
  server.prompt(
    "analyze_environment_health",
    "Comprehensive environment health analysis prompt. This prompt guides the AI assistant to analyze the overall health of your Dynatrace environment, including problems, host status, performance metrics, and recommendations for optimization.",
    {
      entitySelector: z
        .string()
        .optional()
        .describe(
          "Entity selector to filter the analysis (e.g., 'tag(Production)', 'type(HOST)', 'tag(Application-MyApp)'). If not provided, analyzes the entire environment"
        ),
      timeframe: z
        .string()
        .optional()
        .describe(
          "Timeframe for the analysis (e.g., 'now-1h', 'now-24h', 'now-7d') (default: 'now-1h')"
        ),
      includeMetrics: z
        .enum(["true", "false"])
        .optional()
        .describe(
          "Whether to include detailed metrics analysis (CPU, memory, disk, network) (default: 'true')"
        ),
      includeProblems: z
        .enum(["true", "false"])
        .optional()
        .describe("Whether to include problem analysis (default: 'true')"),
      includeHosts: z
        .enum(["true", "false"])
        .optional()
        .describe("Whether to include host health analysis (default: 'true')"),
    },
    async ({
      entitySelector,
      timeframe,
      includeMetrics,
      includeProblems,
      includeHosts,
    }) => {
      const timeframeValue = timeframe ?? "now-1h";
      const includeMetricsValue = includeMetrics === "false" ? false : true;
      const includeProblemsValue = includeProblems === "false" ? false : true;
      const includeHostsValue = includeHosts === "false" ? false : true;
      
      const entityFilter = entitySelector
        ? ` for entities matching: ${entitySelector}`
        : " across the entire environment";

      const promptTemplate = `Perform a comprehensive health analysis of your Dynatrace environment${entityFilter} for the timeframe: ${timeframeValue}

Please provide a structured health report that includes:

1. **Executive Summary**
   - Overall health status (healthy/warning/critical)
   - Key findings and concerns
   - Top priorities for attention

2. **Problem Analysis**${includeProblemsValue ? "" : " (Skipped)"}
   ${includeProblemsValue ? "- Current open problems and their severity" : ""}
   ${includeProblemsValue ? "- Problem trends and patterns" : ""}
   ${includeProblemsValue ? "- Critical problems requiring immediate attention" : ""}
   ${includeProblemsValue ? "- Resolution recommendations" : ""}

3. **Host Health Status**${includeHostsValue ? "" : " (Skipped)"}
   ${includeHostsValue ? "- Host availability and monitoring status" : ""}
   ${includeHostsValue ? "- Unhealthy hosts and their issues" : ""}
   ${includeHostsValue ? "- Host groups and cluster health" : ""}
   ${includeHostsValue ? "- Monitoring configuration recommendations" : ""}

4. **Performance Metrics**${includeMetricsValue ? "" : " (Skipped)"}
   ${includeMetricsValue ? "- CPU, memory, and disk utilization trends" : ""}
   ${includeMetricsValue ? "- Network performance and latency" : ""}
   ${includeMetricsValue ? "- Application response times" : ""}
   ${includeMetricsValue ? "- Resource bottlenecks and capacity concerns" : ""}

5. **Entity Inventory**
   - Total entities monitored
   - Entity types breakdown (hosts, services, applications)
   - Health distribution

6. **Recommendations**
   - Immediate actions needed
   - Optimization opportunities
   - Configuration improvements
   - Capacity planning insights

Use the available Dynatrace tools to:
${includeProblemsValue ? "- Get problems using get_problems with timeframe and entity selector" : ""}
${includeHostsValue ? "- Get entities by tags or host groups using get_entities_by_tag or get_hosts_by_host_group" : ""}
${includeMetricsValue ? "- Query key metrics like CPU usage, memory usage, etc. using query_metric" : ""}
${includeHostsValue ? "- Get host monitoring details if needed using get_host_monitoring_details" : ""}

Provide actionable insights and prioritize recommendations based on business impact.`;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: promptTemplate,
            },
          },
        ],
      };
    }
  );
}

