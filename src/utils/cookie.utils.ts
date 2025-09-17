export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
} = {}) => {
  if (typeof document === 'undefined') return;
  
  const { maxAge, path = '/', sameSite = 'lax', secure = false } = options;
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`;
  if (path) cookieString += `; path=${path}`;
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  if (secure) cookieString += `; secure`;
  
  document.cookie = cookieString;
};

export const deleteCookie = (name: string, path: string = '/') => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=${path}`;
};
