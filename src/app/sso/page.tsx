"use client";

import Link from "next/link";
import { toastError } from "@/utils/toast.utils";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState, Suspense } from "react";
import { fingerprintService } from "@/services/fingerprint.services";
import {
  faShieldHalved,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

function AuthorizeContent() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fingerprintHash, updateFingerprint } = useFingerprint();
  const app = searchParams.get("app");
  const redirect_uri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
    useEffect(() => {
      (async () => {
        try {
          const { fingerprint_hashed } = await fingerprintService();
          // console.log("Fingerprint hashed:", fingerprint_hashed);
          updateFingerprint(fingerprint_hashed);
        } catch (error) {
          console.error("Error getting fingerprint:", error);
        }
      })();
    }, [updateFingerprint]);


  const handleAuthorize = useCallback(async () => {
    if(!fingerprintHash) return
    setLoading(true);
    try {
      if (!app || !redirect_uri || !state) {
        toastError("Missing app/redirect_uri/state");
        return;
      }

      const apiResponse = await fetch("/api/auth/sso", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ app }),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response?.message || "SSO error");
        toastError("SSO server error");
        setError(true);
        return;
      }

      const ssoUrl = new URL(redirect_uri);
      ssoUrl.searchParams.set("sso_token", response.data);
      ssoUrl.searchParams.set("state", state);

      router.push(ssoUrl.toString());
    } catch (error) {
      console.error(error);
      toastError("SSO server error");
    } finally {
      setLoading(false);
    }
  }, [app, redirect_uri, state, router, fingerprintHash]);

  useEffect(() => {
    handleAuthorize();
  }, [handleAuthorize]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {loading && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="w-24 h-24 text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Authorizing Access
              </h1>
              <p className="text-gray-400 text-sm">
                Please wait while we verify your request
              </p>
            </div>

            <button
              onClick={handleAuthorize}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Continue Authorization
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="w-24 h-24 text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Authentication Required
              </h1>
              <p className="text-gray-300 text-sm mb-4">
                Please log in to your account first, then try the authorization
                again.
              </p>
            </div>

            <Link
              href="/"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Authorize() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="w-24 h-24 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Loading...
                </h1>
                <p className="text-gray-400 text-sm">
                  Please wait while we prepare the authorization
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
}
