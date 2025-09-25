"use client";

import Image from "next/image";
import App from "@/components/(app)";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/index.utils";
import { useState, useEffect } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fingerprint, Session } from "@/interfaces/index.interfaces";
import { faLaptop, faMobileScreen, faTablet } from "@fortawesome/free-solid-svg-icons";

export default function DevicesPage() {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [fingerprintsData, setFingerprintsData] = useState<Fingerprint[] | null>(null);


  const getAppLogoSrc = (app: string) => {
    const key = (app || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    const map: Record<string, string> = {
      decode: "decode.png",
      decodebywallet: "decode.png",
      deblog: "deblog.png",
      decareer: "decareer.png",
      decourse: "decourse.png",
      dedao: "dedao.png",
      defuel: "defuel.png",
      dehive: "dehive.png",
      deid: "deid.png",
    };
    const filename = map[key] || "decode.png";
    return `/images/logos/${filename}`;
  };

  useEffect(() => {
    const sessionId = getCookie("sessionId");

    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, []);

  const fetchFingerprints = async () => {
    try {
      const apiResponse = await fetch("/api/auth/fingerprints", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();

      if ( response.success || response.statusCode === 200 || response.message === "Device fingerprint fetched") {
        setFingerprintsData(response.data);
      } else if ( response.statusCode === 400 && response.message === "Missing fingerprint" ) {
        setFingerprintsData(null);
        router.push("/login");
      } else {
        toastError("Failed to load devices");
      }
    } catch (error) {
      console.error("Fetch devices error:", error);
      toastError("Network error for fetching devices. Please try again.");
    } finally {
      console.info("Fetch done!");
    }
  };

  useEffect(() => {
    fetchFingerprints();
  }, []);

  const handleRevokeDevice = async ( fingerprintId: string, sessions: Session[]) => {
    try {
      const isCurrentDevice = currentSessionId
        ? sessions.some((session) => session._id === currentSessionId)
        : false;
      console.log("Is current device:", isCurrentDevice);

      const apiResponse = await fetch(`/api/auth/revoke-device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          deviceFingerprintId: fingerprintId,
          sessions,
          currentSessionId: currentSessionId,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if ( response.success || response.statusCode === 200 || response.message === "Device fingerprint revoked") {
        if (isCurrentDevice) {
          toastSuccess("Device revoked successfully. You will be logged out.");
          router.push("/");
        } else {
          toastSuccess("Device revoked successfully");
          fetchFingerprints();
        }
      } else {
        toastError(response.message || "Failed to revoke device");
        fetchFingerprints();
      }
    } catch (error) {
      console.error("Revoke device error:", error);
      toastError("Network error. Please try again.");
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

      const apiResponse = await fetch(`/api/auth/revoke-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ sessionId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();

      if ( response.success || response.statusCode === 200 || response.message === "Session revoked") {
        if (isCurrentSession) {
          toastSuccess("Session revoked successfully. You will be logged out.");
          router.push("/");
        } else {
          toastSuccess("Session revoked successfully nha");
          fetchFingerprints();
        }
      } else {
        toastError(response.message || "Failed to revoke session");
        fetchFingerprints();
      }
    } catch (error) {
      console.error("Revoke session error:", error);
      toastError("Network error. Please try again.");
    } finally {
      console.log("Session revocation operation completed");
    }
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader
        title="Devices"
        description="Trusted devices that have signed in to your account."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {fingerprintsData && fingerprintsData.map((fingerprint) => (
          <div
            key={fingerprint._id} id={fingerprint._id}
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
                  handleRevokeDevice(fingerprint._id, fingerprint.sessions || [])
                }
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors w-full sm:w-auto"
              >
                Revoke Device
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {fingerprint.sessions.length > 0 && fingerprint.sessions.map((session: Session) => (
                <div
                  key={session._id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={getAppLogoSrc(session.app)}
                        alt={`${session.app} logo`}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {session.app.charAt(0).toUpperCase() +
                          session.app.slice(1)}
                      </h3>
                      {session._id === currentSessionId && (
                      <p className="text-lg text-green-400">*</p>
                      )}
                      </div>
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
