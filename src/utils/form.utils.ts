export interface FormValidationOptions {
  requiredFields: string[];
  loading: boolean;
}

export const validateForm = (formData: Record<string, string>, options: FormValidationOptions): boolean => {
  const { requiredFields, loading } = options;
  
  if (loading) return false;
  
  return requiredFields.every(field => {
    const value = formData[field];
    return value && value.trim().length > 0;
  });
};

export const createFormHandler = <T extends Record<string, string>>(
  formData: T,
  setLoading: (loading: boolean) => void,
  requiredFields: (keyof T)[],
  handler: () => Promise<void>
) => {
  return async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData, { 
      requiredFields: requiredFields as string[], 
      loading: false 
    })) {
      return;
    }
    
    setLoading(true);
    try {
      await handler();
    } finally {
      setLoading(false);
    }
  };
};
