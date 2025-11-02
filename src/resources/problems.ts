import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerProblemResources(server: McpServer) {
  // Resource: Problems API Documentation
  server.resource(
    "Dynatrace Problems API Documentation",
    "problems://api-documentation",
    {
      description: "Comprehensive documentation for all Dynatrace Problems API endpoints, including parameters, request/response schemas, authentication requirements, and usage examples.",
    },
    async () => {
      const documentation = `# Dynatrace Problems API Documentation

## Overview
Manage problems and comments in your Dynatrace environment using the Problems API. All endpoints require authentication via Api-Token header.

---

## GET /problems
Lists problems observed within the specified timeframe.

**Authentication:**
- Required scope: \`problems.read\`
- Required permission: \`environment:roles:viewer\`

### Query Parameters

#### fields (optional)
Type: \`string\`

A list of additional problem properties you can add to the response. Available properties:
- \`evidenceDetails\`: The details of the root cause
- \`impactAnalysis\`: The impact analysis of the problem on other entities/users
- \`recentComments\`: A list of the most recent comments to the problem

Specify as comma-separated list: \`evidenceDetails,impactAnalysis\`

**Note:** This field is valid only for the current page. You must set it for each page you're requesting.

#### nextPageKey (optional)
Type: \`string\`

The cursor for the next page of results. Found in the \`nextPageKey\` field of the previous response.

When \`nextPageKey\` is set for subsequent pages, omit all other query parameters except the optional \`fields\` parameter.

#### pageSize (optional)
Type: \`integer\`

The amount of problems in a single response payload.
- Maximum: 500
- Default: 50

#### from (optional)
Type: \`string\`

The start of the requested timeframe. Formats:
- Timestamp in UTC milliseconds
- Human-readable: \`2021-01-25T05:57:01.123+01:00\` (UTC if timezone omitted, space instead of T allowed, seconds optional)
- Relative: \`now-NU/A\` or \`now-NU\`
  - N = amount of time
  - U = unit (m=minutes, h=hours, d=days, w=weeks, M=months, y=years)
  - A = alignment (e.g., \`now-1y/w\` = one year back aligned by week)

**Default:** \`now-2h\` (relative timeframe of two hours)

#### to (optional)
Type: \`string\`

The end of the requested timeframe. Same formats as \`from\` parameter.

**Default:** Current timestamp

#### problemSelector (optional)
Type: \`string\`

Defines the scope of the query. Only problems matching the specified criteria are included. Criteria (multiple comma-separated values use OR logic):

- **Status:** \`status("open")\` or \`status("closed")\` (only one status)
- **Severity level:** \`severityLevel("level-1","level-2")\`
- **Impact level:** \`impactLevel("level-1","level-2")\`
- **Root cause entity:** \`rootCauseEntity("id-1", "id-2")\`
- **Management zone ID:** \`managementZoneIds("mZId-1", "mzId-2")\`
- **Management zone name:** \`managementZones("value-1","value-2")\`
- **Impacted entities:** \`impactedEntities("id-1", "id-2")\`
- **Affected entities:** \`affectedEntities("id-1", "id-2")\`
- **Affected entity types:** \`affectedEntityTypes("value-1","value-2")\`
- **Problem ID:** \`problemId("id-1", "id-2")\`
- **Alerting profile ID:** \`problemFilterIds("id-1", "id-2")\`
- **Alerting profile name (contains):** \`problemFilterNames("value-1","value-2")\` (case-insensitive)
- **Alerting profile name (exact):** \`problemFilterNames.equals("value-1","value-2")\` (case-insensitive)
- **Entity tags:** \`entityTags("[context]key:value","key:value")\` (case-sensitive, escape colons in value-only tags)
- **Display ID:** \`displayId("id-1", "id-2")\`
- **Under maintenance:** \`underMaintenance(true|false)\`
- **Text search:** \`text("value")\` (searches problem title, event titles, displayId, entity IDs - case-insensitive, partial matching, max 30 chars, escape ~ and " with ~)

**Multiple criteria:** Separate with comma (,). Only results matching ALL criteria are included.

#### entitySelector (optional)
Type: \`string\`

The entity scope of the query. Must set one of:
- **Entity type:** \`type("TYPE")\`
- **Entity ID:** \`entityId("id")\` or \`entityId("id-1","id-2")\` (same type required)

Additional criteria (case-sensitive, EQUALS by default):
- **Tag:** \`tag("value")\` (escape colons in key/value with backslash)
- **Management zone ID:** \`mzId(123)\`
- **Management zone name:** \`mzName("value")\`
- **Entity name:** 
  - \`entityName.equals("value")\` (non-case-sensitive)
  - \`entityName.startsWith("value")\` (BEGINS WITH)
  - \`entityName.in("value1","value2")\` (multiple values)
  - \`caseSensitive(entityName.equals("value"))\` (case-sensitive)
- **Health state:** \`healthState("HEALTHY")\` or \`healthState("UNHEALTHY")\`
- **First seen timestamp:** \`firstSeenTms.<operator>(now-3h)\`
  - Operators: \`lte\`, \`lt\`, \`gte\`, \`gt\`
- **Entity attribute:** \`<attribute>("value1","value2")\` or \`<attribute>.exists()\`
- **Relationships:** \`fromRelationships.<relationshipName>()\` or \`toRelationships.<relationshipName>()\`
- **Negation:** \`not(<criterion>)\` (except for type)

**Multiple criteria:** Separate with comma (,). Only results matching ALL criteria are included.

**Limits:**
- Maximum string length: 2,000 characters
- Maximum entities: 10,000

#### sort (optional)
Type: \`string\`

Comma-separated fields for sorting. Prefix with + or - for order:
- \`status\`: + (open first) or - (closed first)
- \`startTime\`: + (old first) or - (new first)
- \`relevance\`: + (least relevant) or - (most relevant) - only with text search

**Example:** \`+status,-startTime\` (open first, then by time oldest first)

### Response (200 Success)
\`\`\`json
{
  "nextPageKey": "AQAAABQBAAAABQ==",
  "pageSize": 0,
  "problems": [
    {
      "affectedEntities": [{"entityId": {"id": "string", "type": "string"}, "name": "string"}],
      "displayId": "string",
      "endTime": 0,
      "entityTags": [{"context": "string", "key": "string", "stringRepresentation": "string", "value": "string"}],
      "evidenceDetails": {
        "details": [{
          "displayName": "string",
          "entity": {"entityId": {"id": "string", "type": "string"}, "name": "string"},
          "groupingEntity": {"entityId": {"id": "string", "type": "string"}, "name": "string"},
          "rootCauseRelevant": true,
          "startTime": 0
        }],
        "totalCount": 0
      },
      "impactAnalysis": {
        "impacts": [{
          "estimatedAffectedUsers": 0,
          "impactedEntity": {"entityId": {"id": "string", "type": "string"}, "name": "string"}
        }]
      },
      "impactLevel": "APPLICATION",
      "impactedEntities": [{"entityId": {"id": "string", "type": "string"}, "name": "string"}],
      "k8s.cluster.name": ["string"],
      "k8s.cluster.uid": ["string"],
      "k8s.namespace.name": ["string"],
      "linkedProblemInfo": {"displayId": "string", "problemId": "string"},
      "managementZones": [{"id": "string", "name": "string"}],
      "problemFilters": [{"id": "string", "name": "string"}],
      "problemId": "string",
      "recentComments": {
        "comments": [{
          "authorName": "string",
          "content": "string",
          "context": "string",
          "createdAtTimestamp": 0,
          "id": "string"
        }],
        "nextPageKey": "AQAAABQBAAAABQ==",
        "pageSize": 0,
        "totalCount": 0
      },
      "rootCauseEntity": {"entityId": {"id": "string", "type": "string"}, "name": "string"},
      "severityLevel": "AVAILABILITY",
      "startTime": 0,
      "status": "CLOSED",
      "title": "string"
    }
  ],
  "totalCount": 0,
  "warnings": ["string"]
}
\`\`\`

---

## GET /problems/{problemId}
Gets the properties of the specified problem.

**Authentication:**
- Required scope: \`problems.read\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

### Query Parameters

#### fields (optional)
Type: \`string\`

Same as GET /problems - comma-separated list of additional properties: \`evidenceDetails\`, \`impactAnalysis\`, \`recentComments\`

### Response (200 Success)
Same schema as problem object in GET /problems response.

---

## POST /problems/{problemId}/close
Closes the specified problem and adds a closing comment on it.

**Authentication:**
- Required scope: \`problems.write\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

### Request Body
\`\`\`json
{
  "message": "string"
}
\`\`\`

### Response (200 Success)
\`\`\`json
{
  "closeTimestamp": 0,
  "closing": true,
  "comment": {
    "authorName": "string",
    "content": "string",
    "context": "string",
    "createdAtTimestamp": 0,
    "id": "string"
  },
  "problemId": "string"
}
\`\`\`

### Response (204 No Content)
The problem is already closed; request hasn't been executed.

---

## GET /problems/{problemId}/comments
Gets all comments on the specified problem.

**Authentication:**
- Required scope: \`problems.read\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

### Query Parameters

#### nextPageKey (optional)
Type: \`string\`

Cursor for the next page of results. When set, omit all other query parameters except \`fields\`.

#### pageSize (optional)
Type: \`integer\`

Amount of comments in response.
- Maximum: 500
- Default: 10

### Response (200 Success)
\`\`\`json
{
  "comments": [{
    "authorName": "string",
    "content": "string",
    "context": "string",
    "createdAtTimestamp": 0,
    "id": "string"
  }],
  "nextPageKey": "AQAAABQBAAAABQ==",
  "pageSize": 0,
  "totalCount": 0
}
\`\`\`

---

## POST /problems/{problemId}/comments
Adds a new comment on the specified problem.

**Authentication:**
- Required scope: \`problems.write\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

### Request Body
\`\`\`json
{
  "context": "string",
  "message": "string"
}
\`\`\`

### Response (201 Created)
Comment has been added successfully.

---

## GET /problems/{problemId}/comments/{commentId}
Gets the specified comment on a problem.

**Authentication:**
- Required scope: \`problems.read\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

#### commentId (required)
Type: \`string\`

The ID of the required comment.

### Response (200 Success)
\`\`\`json
{
  "authorName": "string",
  "content": "string",
  "context": "string",
  "createdAtTimestamp": 0,
  "id": "string"
}
\`\`\`

---

## PUT /problems/{problemId}/comments/{commentId}
Updates the specified comment on a problem.

**Authentication:**
- Required scope: \`problems.write\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

#### commentId (required)
Type: \`string\`

The ID of the required comment.

### Request Body
\`\`\`json
{
  "context": "string",
  "message": "string"
}
\`\`\`

### Response (204 No Content)
Comment has been updated successfully.

---

## DELETE /problems/{problemId}/comments/{commentId}
Deletes the specified comment from a problem.

**Authentication:**
- Required scope: \`problems.write\`
- Required permission: \`environment:roles:viewer\`

### Path Parameters

#### problemId (required)
Type: \`string\`

The ID of the required problem.

#### commentId (required)
Type: \`string\`

The ID of the required comment.

### Response (204 No Content)
Comment has been deleted successfully.

---

## Error Responses

All endpoints may return:

### 4XX Client Error
\`\`\`json
{
  "error": {
    "code": 0,
    "constraintViolations": [{
      "location": "string",
      "message": "string",
      "parameterLocation": "HEADER",
      "path": "string"
    }],
    "message": "string"
  }
}
\`\`\`

### 5XX Server Error
\`\`\`json
{
  "error": {
    "code": 0,
    "constraintViolations": [{
      "location": "string",
      "message": "string",
      "parameterLocation": "HEADER",
      "path": "string"
    }],
    "message": "string"
  }
}
\`\`\`

---

## Notes

- All timestamps are in UTC milliseconds unless specified otherwise
- Entity selectors support complex filtering with AND/OR logic
- Pagination is handled via \`nextPageKey\` parameter
- Text search is case-insensitive and uses relevance scoring
- Maximum string length for entity selectors: 2,000 characters
- Maximum entities selectable: 10,000
- Tag values are case-sensitive; escape special characters appropriately
`;

      return {
        contents: [
          {
            uri: "problems://api-documentation",
            mimeType: "text/markdown",
            text: documentation,
          },
        ],
      };
    }
  );
}

