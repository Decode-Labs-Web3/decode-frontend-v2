"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toastError } from "@/utils/toast.utils";

export default function Authorize() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const app = searchParams.get("app");
  const redirect_uri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  const handleAuthorize = useCallback(async () => {
    try {
      if (!app || !redirect_uri || !state) {
        toastError("Missing app/redirect_uri/state");
        return;
      }

      const apiResponse = await fetch("/api/auth/sso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ app }),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok || !response?.success || !response?.data) {
        console.error(response?.message || "SSO error");
        toastError(response?.message || "SSO server error");
        return;
      }

      const sso_token: string = response.data;

      const url = new URL(redirect_uri);
      url.searchParams.set("sso_token", sso_token);
      url.searchParams.set("state", state);

      if (url.origin === window.location.origin) {
        router.replace(url.pathname + url.search);
      } else {
        window.location.replace(url.toString());
      }
    } catch (error) {
      console.error(error);
      toastError("SSO server error");
    }
  }, [app, redirect_uri, state, router]);

  useEffect(() => {
    handleAuthorize();
  }, [handleAuthorize]);

  return (
    <div className="min-h-screen grid place-items-center text-white bg-black p-4">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold">Authorize</h1>
        <p>App: {app}</p>
        <p>Redirecting to: {redirect_uri}</p>
        <p>State: {state}</p>
        <button onClick={handleAuthorize} className="px-4 py-2 rounded bg-blue-600">
          Authorize
        </button>
      </div>
    </div>
  );
}
