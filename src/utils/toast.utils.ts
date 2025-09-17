import { toast } from 'react-toastify';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showInfo = (message: string) => {
  toast.info(message);
};

export const showWarning = (message: string) => {
  toast.warning(message);
};

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Common success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  CREATED: 'Created successfully',
} as const;
