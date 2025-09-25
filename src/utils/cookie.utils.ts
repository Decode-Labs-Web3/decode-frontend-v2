interface CookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
}

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : null;
};
