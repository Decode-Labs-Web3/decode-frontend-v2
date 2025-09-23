export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  signal?: AbortSignal;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export const createApiHeaders = (
  additionalHeaders: Record<string, string> = {}
): Record<string, string> => {
  return {
    "Content-Type": "application/json",
    "X-Frontend-Internal-Request": "true",
    ...additionalHeaders,
  };
};

export const apiCall = async (
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse> => {
  const {
    method = "GET",
    headers = {},
    body,
    credentials = "include",
    cache = "no-store",
    signal,
  } = options;

  const response = await fetch(url, {
    method,
    headers: createApiHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
    credentials,
    cache,
    signal,
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      statusCode: response.status,
      message:
        responseData.message ||
        `HTTP ${response.status}: ${response.statusText}`,
      ...responseData,
    };
  }

  return {
    success: true,
    statusCode: response.status,
    ...responseData,
  };
};

export const apiCallWithTimeout = async (
  url: string,
  options: ApiOptions = {},
  timeoutMs: number = 5000
): Promise<ApiResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`API request timeout: ${url} exceeded ${timeoutMs}ms`);
    controller.abort();
  }, timeoutMs);

  const startTime = Date.now();

  try {
    const result = await apiCall(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    // Warn for slow responses (>3 seconds)
    if (duration > 3000) {
      console.warn(`Slow API response: ${url} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout and network errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          statusCode: 408,
          message: "Request timeout. Please try again.",
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: error.message || "Network error. Please try again.",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Unknown error occurred. Please try again.",
    };
  }
};
