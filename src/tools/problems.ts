import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest, convertDisplayIdToProblemId } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";

export function registerProblemTools(server: McpServer) {

  //  Tool: Get problems
  server.tool(
    "get_problems",
    "Fetch a list of problems from Dynatrace",
    {
      problemSelector: z.string().optional().describe("Optional problem filter, e.g. 'status(open)'"),
      pageSize: z.number().optional().describe("Number of results per page"),
      from: z.string().optional().describe("Start of timeframe (e.g., 'now-2h', '2021-01-25T05:57:01.123+01:00')"),
      to: z.string().optional().describe("End of timeframe (e.g., 'now', '2021-01-25T05:57:01.123+01:00')"),
      entitySelector: z.string().optional().describe("Entity scope filter (e.g., 'type(\"HOST\")')"),
      sort: z.string().optional().describe("Sort criteria (e.g., '+status,-startTime')"),
      fields: z.string().optional().describe("Additional fields (e.g., 'evidenceDetails,impactAnalysis')"),
      nextPageKey: z.string().optional().describe("Cursor for next page of results"),
    },
    async ({ problemSelector, pageSize, from, to, entitySelector, sort, fields, nextPageKey }) => {
      let endpoint = "/problems";
      const params = new URLSearchParams();
      if (problemSelector) params.append("problemSelector", problemSelector);
      if (pageSize) params.append("pageSize", pageSize.toString());
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (entitySelector) params.append("entitySelector", entitySelector);
      if (sort) params.append("sort", sort);
      if (fields) params.append("fields", fields);
      if (nextPageKey) params.append("nextPageKey", nextPageKey);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const data = await makeDynatraceRequest<any>(endpoint);

      if (!data) {
        return {
          content: [{ type: "text", text: " Failed to retrieve problems from Dynatrace" }],
        };
      }

      // Add debug info to response
      const debugInfo = {
        requestInfo: {
          endpoint: endpoint,
          timestamp: new Date().toISOString()
        }
      };

      return {
        content: [
          {
            type: "text",
            text: ` DEBUG INFO:\n${JSON.stringify(debugInfo, null, 2)}\n\n PROBLEMS DATA:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    }
  );

  //  Tool: Get specific problem details
  server.tool("get_problem_details", "Get detailed information about a specific problem", {
    problemId: z.string().describe("The ID of the problem to retrieve (can be display ID like P-12345 or actual problem ID)"),
    fields: z.string().optional().describe("Additional fields (e.g., 'evidenceDetails,impactAnalysis,recentComments')"),
  }, async ({ problemId, fields }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    let endpoint = `/problems/${actualProblemId}`;
    if (fields) {
      endpoint += `?fields=${encodeURIComponent(fields)}`;
    }

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve problem details for ID: ${problemId} (actual ID: ${actualProblemId})` }],
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

  //  Tool: Close a problem
  server.tool("close_problem", "Close a specific problem and add a closing comment", {
    problemId: z.string().describe("The ID of the problem to close (can be display ID like P-12345 or actual problem ID)"),
    message: z.string().describe("Closing comment message"),
  }, async ({ problemId, message }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    const endpoint = `/problems/${actualProblemId}/close`;
    const data = await makeDynatraceRequest<any>(endpoint, {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to close problem: ${problemId}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: ` Problem ${problemId} closed successfully with message: "${message}"`,
        },
      ],
    };
  });

  //  Tool: Get problem comments
  server.tool("get_problem_comments", "Get all comments for a specific problem", {
    problemId: z.string().describe("The ID of the problem (can be display ID like P-12345 or actual problem ID)"),
    pageSize: z.number().optional().describe("Number of comments per page (max 500)"),
    nextPageKey: z.string().optional().describe("Cursor for next page of results"),
  }, async ({ problemId, pageSize, nextPageKey }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    let endpoint = `/problems/${actualProblemId}/comments`;
    const params = new URLSearchParams();
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (nextPageKey) params.append("nextPageKey", nextPageKey);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve comments for problem: ${problemId}` }],
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

  //  Tool: Add comment to problem
  server.tool("add_problem_comment", "Add a new comment to a specific problem", {
    problemId: z.string().describe("The ID of the problem (can be display ID like P-12345 or actual problem ID)"),
    message: z.string().describe("Comment message"),
    context: z.string().optional().describe("Comment context"),
  }, async ({ problemId, message, context }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    const endpoint = `/problems/${actualProblemId}/comments`;
    const data = await makeDynatraceRequest<any>(endpoint, {
      method: "POST",
      body: JSON.stringify({ message, context }),
    });

    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to add comment to problem: ${problemId}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: ` Comment added to problem ${problemId} successfully`,
        },
      ],
    };
  });

  //  Tool: Get specific comment
  server.tool("get_problem_comment", "Get a specific comment from a problem", {
    problemId: z.string().describe("The ID of the problem (can be display ID like P-12345 or actual problem ID)"),
    commentId: z.string().describe("The ID of the comment"),
  }, async ({ problemId, commentId }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    const endpoint = `/problems/${actualProblemId}/comments/${commentId}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve comment ${commentId} for problem ${problemId}` }],
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

  //  Tool: Update comment
  server.tool("update_problem_comment", "Update a specific comment on a problem", {
    problemId: z.string().describe("The ID of the problem (can be display ID like P-12345 or actual problem ID)"),
    commentId: z.string().describe("The ID of the comment to update"),
    message: z.string().describe("Updated comment message"),
    context: z.string().optional().describe("Updated comment context"),
  }, async ({ problemId, commentId, message, context }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    const endpoint = `/problems/${actualProblemId}/comments/${commentId}`;
    const data = await makeDynatraceRequest<any>(endpoint, {
      method: "PUT",
      body: JSON.stringify({ message, context }),
    });

    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to update comment ${commentId} for problem ${problemId}` }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: ` Comment ${commentId} updated for problem ${problemId} successfully`,
        },
      ],
    };
  });

  //  Tool: Delete comment
  server.tool("delete_problem_comment", "Delete a specific comment from a problem", {
    problemId: z.string().describe("The ID of the problem (can be display ID like P-12345 or actual problem ID)"),
    commentId: z.string().describe("The ID of the comment to delete"),
  }, async ({ problemId, commentId }) => {
    const actualProblemId = await convertDisplayIdToProblemId(problemId);
    if (!actualProblemId) {
      return {
        content: [{ type: "text", text: ` Problem ID not found: ${problemId}` }],
      };
    }

    const endpoint = `/problems/${actualProblemId}/comments/${commentId}`;
    
    try {
      const response = await fetch(`${DYNATRACE_ENV_URL}/api/v2${endpoint}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return {
        content: [
          {
            type: "text",
            text: ` Comment ${commentId} deleted from problem ${problemId} successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: ` Failed to delete comment ${commentId} for problem ${problemId}: ${error}` }],
      };
    }
  });
}
