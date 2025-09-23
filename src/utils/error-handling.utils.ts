import { ERROR_MESSAGES, showError } from "./toast.utils";

export interface ApiError {
  message?: string;
  statusCode?: number;
  success?: boolean;
}

export const handleApiError = (
  error: unknown,
  customMessage?: string
): string => {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return customMessage || error.message || ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const apiError = error as ApiError;
    return customMessage || apiError.message || ERROR_MESSAGES.GENERIC_ERROR;
  }

  return customMessage || ERROR_MESSAGES.NETWORK_ERROR;
};

export const handleApiResponse = (
  response: ApiError,
  successMessage?: string
): boolean => {
  if (response.success || response.statusCode === 200) {
    if (successMessage) {
      console.log("Success:", successMessage);
    }
    return true;
  }

  const errorMessage = response.message || ERROR_MESSAGES.GENERIC_ERROR;
  showError(errorMessage);
  return false;
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const message = handleApiError(error, errorMessage);
    showError(message);
    return null;
  }
};
