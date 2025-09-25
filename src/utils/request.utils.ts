import crypto from 'crypto';

export const generateRequestId = () => {
  const time = new Date().toISOString();
  const uuid = crypto.randomUUID()
  return `${time} - ${uuid}`;
};


