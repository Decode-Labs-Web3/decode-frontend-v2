"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/index.utils";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fingerprint, Session } from "@/interfaces/index.interfaces";
import {
  faLaptop,
  faMobileScreen,
  faTablet,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "@/components/(loading)";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DevicesPage() {
  const router = useRouter();
  // console.log("Rendering DevicesPage", router);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [fingerprintsData, setFingerprintsData] = useState<
    Fingerprint[] | null
  >(null);

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

  const fetchFingerprints = useCallback(async () => {
    setLoading(true);
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

      if (
        response.success ||
        response.statusCode === 200 ||
        response.message === "Device fingerprint fetched"
      ) {
        setFingerprintsData(response.data);
      } else if (
        response.statusCode === 400 &&
        response.message === "Missing fingerprint"
      ) {
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
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFingerprints();
  }, [fetchFingerprints]);

  const handleRevokeDevice = async (
    fingerprintId: string,
    sessions: Session[]
  ) => {
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
      if (
        response.success ||
        response.statusCode === 200 ||
        response.message === "Device fingerprint revoked"
      ) {
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

      if (
        response.success ||
        response.statusCode === 200 ||
        response.message === "Session revoked"
      ) {
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
    <>
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <Loading.NewsCard />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {fingerprintsData &&
          fingerprintsData.map((fingerprint) => (
            <Card
              key={fingerprint._id}
              id={fingerprint._id}
              className="hover-card"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon
                        icon={
                          fingerprint.device === "iOS" ||
                          fingerprint.device === "Android"
                            ? faMobileScreen
                            : fingerprint.device === "iPadOS"
                            ? faTablet
                            : faLaptop
                        }
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        <div className="text-xs sm:text-sm font-medium mb-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="truncate">{fingerprint.device}</span>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                          <span className="truncate">
                            {fingerprint.browser}
                          </span>
                        </div>
                      </CardTitle>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      handleRevokeDevice(
                        fingerprint._id,
                        fingerprint.sessions || []
                      )
                    }
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Revoke Device
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {fingerprint.sessions.length > 0 &&
                    fingerprint.sessions.map((session: Session) => (
                      <div
                        key={session._id}
                        className="bg-muted border rounded-lg p-3 sm:p-4 hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                              <h3 className="text-sm font-semibold truncate">
                                {session.app.charAt(0).toUpperCase() +
                                  session.app.slice(1)}
                              </h3>
                              {session._id === currentSessionId && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(session.last_used_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRevokeSession(session._id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </>
  );
}
