"use client";

import Image from "next/image";
import App from "@/components/(app)";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCookie } from "@/utils/cookie.utils";
import { Fingerprint, Session } from "@/interfaces";
import { apiCallWithTimeout } from "@/utils/api.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptop,
  faMobileScreen,
  faTablet,
} from "@fortawesome/free-solid-svg-icons";

export default function DevicesPage() {
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const [fingerprintsData, setFingerprintsData] = useState<Fingerprint[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  useEffect(() => {
    // Debug: Show all cookies
    console.log("All cookies:", document.cookie);

    // Try both possible cookie names
    let sessionId = getCookie("sessionId");
    if (!sessionId) {
      sessionId = getCookie("sessionid");
    }
    console.log("Session ID from cookie (sessionId):", getCookie("sessionId"));
    console.log("Session ID from cookie (sessionid):", getCookie("sessionid"));
    console.log("Final sessionId:", sessionId);
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, []);

  useEffect(() => {
    console.log(
      "Fetch effect - isLoggingOut:",
      isLoggingOut,
      "currentSessionId:",
      currentSessionId
    );
    if (isLoggingOut) {
      console.log("Skipping fetch - isLoggingOut");
      return;
    }

    // Temporarily try to fetch even without sessionId to see what happens
    if (!currentSessionId) {
      console.log(
        "No sessionId found, but trying to fetch anyway for debugging"
      );
    }

    const fetchFingerprints = async () => {
      try {
        const apiResponse = await apiCallWithTimeout("/api/auth/fingerprints", {
          method: "GET",
          headers: {
            "frontend-internal-request": "true",
          },
        });

        console.log("API response:", apiResponse);

        if (
          apiResponse.success ||
          apiResponse.statusCode === 200 ||
          apiResponse.message === "Device fingerprint fetched"
        ) {
          setFingerprintsData(
            (apiResponse.data as unknown as Fingerprint[]) || []
          );
        } else if (apiResponse.statusCode === 401) {
          setFingerprintsData([]);
          router.push("/");
        } else if (
          apiResponse.statusCode === 400 &&
          apiResponse.message === "Missing fingerprint"
        ) {
          setFingerprintsData([]);
          router.push("/login");
        } else {
          toast.error("Failed to load devices");
        }
      } catch {
        toast.error("Network error for fetching devices. Please try again.");
      }
    };
    fetchFingerprints();
  }, [version, router, isLoggingOut, currentSessionId]);

  const handleRevokeDevice = async (
    fingerprintId: string,
    sessions: Session[]
  ) => {
    try {
      console.log("Revoking device - currentSessionId:", currentSessionId);
      console.log(
        "Available sessions:",
        sessions.map((session) => session._id)
      );
      const isCurrentDevice = currentSessionId
        ? sessions.some((session) => session._id === currentSessionId)
        : false;
      console.log("Is current device:", isCurrentDevice);

      const responseData = await apiCallWithTimeout(`/api/auth/revoke-device`, {
        method: "POST",
        body: {
          deviceFingerprintId: fingerprintId,
          sessions,
          currentSessionId: currentSessionId,
        },
      });
      if (
        responseData.success ||
        responseData.statusCode === 200 ||
        responseData.message === "Device fingerprint revoked"
      ) {
        if (isCurrentDevice || responseData.reload) {
          setIsLoggingOut(true);
          toast.success("Device revoked successfully. You will be logged out.");
          // Clear the session ID from state
          setCurrentSessionId("");
          // Redirect immediately without triggering refetch
          router.push("/");
        } else {
          toast.success("Device revoked successfully");
          setVersion(version + 1);
        }
      } else if (responseData.statusCode === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/");
      } else {
        toast.error(responseData.message || "Failed to revoke device");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      console.log("Device revocation operation completed");
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      console.log("Revoking session - currentSessionId:", currentSessionId);
      console.log("Revoking sessionId:", sessionId);
      const isCurrentSession = currentSessionId
        ? sessionId === currentSessionId
        : false;
      console.log("Is current session:", isCurrentSession);

      const responseData = await apiCallWithTimeout(
        `/api/auth/revoke-session`,
        {
          method: "POST",
          body: { sessionId },
        }
      );
      if (
        responseData.success ||
        responseData.statusCode === 200 ||
        responseData.message === "Session revoked"
      ) {
        if (isCurrentSession || responseData.reload) {
          setIsLoggingOut(true);
          toast.success(
            "Session revoked successfully. You will be logged out."
          );
          // Clear the session ID from state
          setCurrentSessionId("");
          // Redirect immediately without triggering refetch
          router.push("/");
        } else {
          toast.success("Session revoked successfully");
          setVersion(version + 1);
        }
      } else if (responseData.statusCode === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/");
      } else {
        toast.error(responseData.message || "Failed to revoke session");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      console.log("Session revocation operation completed");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:pl-72 lg:pr-8 pt-20 sm:pt-24 pb-8 sm:pb-10">
      <App.PageHeader
        title="Devices"
        description="Trusted devices that have signed in to your account."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {fingerprintsData.map((fingerprint) => (
          <div
            key={fingerprint._id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={
                      fingerprint.device === "iOS" ||
                      fingerprint.device === "Android"
                        ? faMobileScreen
                        : fingerprint.device === "iPadOS"
                        ? faTablet
                        : faLaptop
                    }
                    className="text-gray-300 text-sm"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  <p className="text-xs sm:text-sm font-medium text-white mb-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="truncate">{fingerprint.device}</span>
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                    <span className="truncate">{fingerprint.browser}</span>
                  </p>
                </h3>
              </div>
              <button
                onClick={() =>
                  handleRevokeDevice(fingerprint._id, fingerprint.sessions)
                }
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors w-full sm:w-auto"
              >
                Revoke Device
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {fingerprint.sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={`/images/logos/${session.app}.png`}
                        alt={`${session.app} logo`}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {session.app.charAt(0).toUpperCase() +
                          session.app.slice(1)}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(session.last_used_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex-shrink-0 px-2 py-1 rounded hover:bg-red-400/10"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
