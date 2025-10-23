import { DYNATRACE_API_TOKEN, DYNATRACE_ENV_URL } from "../config/constants.js";

// Helper function to convert display ID to problem ID
export async function convertDisplayIdToProblemId(displayId: string): Promise<string | null> {
  if (!displayId.startsWith("P-")) {
    return displayId; // Already a problem ID
  }
  try {
    const searchEndpoint = `/problems?problemSelector=displayId("${displayId}")&pageSize=1`;
    const response = await fetch(`${DYNATRACE_ENV_URL}/api/v2${searchEndpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Api-Token ${DYNATRACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const searchData = await response.json();
    if (searchData && searchData.problems && searchData.problems.length > 0) {
      return searchData.problems[0].problemId;
    }
    return null;
  } catch (error) {
    console.error(`Failed to convert display ID ${displayId} to problem ID:`, error);
    return null;
  }
}

// Helper function to create fetch options
export function createFetchOptions(options?: { method?: string; body?: string; headers?: Record<string, string> }): RequestInit {
  const fetchOptions: RequestInit = {
    method: options?.method || "GET",
    headers: {
      Authorization: `Api-Token ${DYNATRACE_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...(options?.body && { body: options.body }),
  };

  return fetchOptions;
}

// Helper function for Dynatrace API calls
export async function makeDynatraceRequest<T>(endpoint: string, options?: { method?: string; body?: string; headers?: Record<string, string> }): Promise<T | null> {
  try {
    const fullUrl = `${DYNATRACE_ENV_URL}/api/v2${endpoint}`;
    const fetchOptions = createFetchOptions(options);
    
    console.error("📡 Sending request to:", fullUrl);
    const response = await fetch(fullUrl, fetchOptions);
    
    console.error(`📡 Response received: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(" REQUEST FAILED:", error);
    return null;
  }
}
