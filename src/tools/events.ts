import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeDynatraceRequest } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";

export function registerEventTools(server: McpServer) {
  //  Tool: Get event properties
  server.tool("get_event_properties", "List all event properties", {
    pageSize: z.number().optional().describe("Number of event properties in a single response payload (max 500, default 100)"),
    nextPageKey: z.string().optional().describe("Cursor for next page of results"),
  }, async ({ pageSize, nextPageKey }) => {
    let endpoint = "/eventProperties";
    const params = new URLSearchParams();
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (nextPageKey) params.append("nextPageKey", nextPageKey);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve event properties from Dynatrace" }],
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

  //  Tool: Get event property details
  server.tool("get_event_property_details", "Get the details of a specific event property", {
    propertyKey: z.string().describe("The event property key you're inquiring (e.g., 'dt.event.description')"),
  }, async ({ propertyKey }) => {
    const endpoint = `/eventProperties/${propertyKey}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve event property details for key: ${propertyKey}` }],
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

  //  Tool: Get events
  server.tool("get_events", "List events within the specified timeframe with filtering options", {
    from: z.string().optional().describe("Start of timeframe (e.g., 'now-2h', '2021-01-25T05:57:01.123+01:00')"),
    to: z.string().optional().describe("End of timeframe (e.g., 'now', '2021-01-25T05:57:01.123+01:00')"),
    eventSelector: z.string().optional().describe("Event scope filter (e.g., 'status(OPEN)', 'eventType(LOW_DISK_SPACE)')"),
    entitySelector: z.string().optional().describe("Entity scope filter (e.g., 'type(HOST)', 'tag(Application-BS_SVA)')"),
    pageSize: z.number().optional().describe("Number of events in response (max 1000, default 100)"),
    nextPageKey: z.string().optional().describe("Cursor for next page of results"),
  }, async ({ from, to, eventSelector, entitySelector, pageSize, nextPageKey }) => {
    let endpoint = "/events";
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (eventSelector) params.append("eventSelector", eventSelector);
    if (entitySelector) params.append("entitySelector", entitySelector);
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (nextPageKey) params.append("nextPageKey", nextPageKey);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve events from Dynatrace" }],
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

  //  Tool: Get event details
  server.tool("get_event_details", "Get the properties of a specific event", {
    eventId: z.string().describe("The ID of the required event"),
  }, async ({ eventId }) => {
    const endpoint = `/events/${eventId}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve event details for ID: ${eventId}` }],
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

  //  Tool: Ingest custom event
  server.tool("ingest_custom_event", "Ingest a custom event into Dynatrace", {
    eventType: z.string().describe("Type of the event (e.g., 'AVAILABILITY_EVENT', 'PERFORMANCE_EVENT')"),
    title: z.string().describe("Title of the event"),
    entitySelector: z.string().describe("Entity selector for the event (e.g., 'type(HOST),entityName.equals(\"hostname\")')"),
    startTime: z.number().describe("Start time of the event in UTC milliseconds"),
    endTime: z.number().optional().describe("End time of the event in UTC milliseconds (0 for ongoing events)"),
    timeout: z.number().optional().describe("Timeout in seconds for the event"),
    properties: z.record(z.string()).optional().describe("Additional properties for the event"),
  }, async ({ eventType, title, entitySelector, startTime, endTime, timeout, properties }) => {
    const endpoint = "/events/ingest";
    const eventPayload = {
      eventType,
      title,
      entitySelector,
      startTime,
      endTime: endTime || 0,
      timeout: timeout || 300,
      properties: properties || {}
    };

    try {
      const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
      const requestBody = JSON.stringify(eventPayload);
      
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
            text: ` Custom event '${title}' ingested successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: ` Failed to ingest custom event: ${error}`,
          },
        ],
      };
    }
  });

  //  Tool: Get event types
  server.tool("get_event_types", "List all available event types", {
    pageSize: z.number().optional().describe("Number of event types in response (max 500, default 100)"),
    nextPageKey: z.string().optional().describe("Cursor for next page of results"),
  }, async ({ pageSize, nextPageKey }) => {
    let endpoint = "/eventTypes";
    const params = new URLSearchParams();
    if (pageSize) params.append("pageSize", pageSize.toString());
    if (nextPageKey) params.append("nextPageKey", nextPageKey);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: " Failed to retrieve event types from Dynatrace" }],
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

  //  Tool: Get event type details
  server.tool("get_event_type_details", "Get the properties of a specific event type", {
    eventType: z.string().describe("The event type you're inquiring (e.g., 'OSI_HIGH_CPU', 'LOW_DISK_SPACE')"),
  }, async ({ eventType }) => {
    const endpoint = `/eventTypes/${eventType}`;
    const data = await makeDynatraceRequest<any>(endpoint);
    if (!data) {
      return {
        content: [{ type: "text", text: ` Failed to retrieve event type details for type: ${eventType}` }],
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
