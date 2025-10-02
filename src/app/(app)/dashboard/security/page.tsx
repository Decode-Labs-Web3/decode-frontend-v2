"use client";

import QRCode from "react-qr-code";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/toast.utils";

type TOTPResponse = {
  _id: string;
  user_id: string;
  otp_secret: string;
  otp_enable: boolean;
  createdAt: string;
  updatedAt: string;
  qr_code_url: string;
};

export default function SecurityPage() {
  const [setup, setSetup] = useState(false);
  const [otpData, setOtpData] = useState<TOTPResponse | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const sixDigits = /^\d{6}$/.test(code);

  // console.log("This is code from 2fa: ", code);

  const handleStatus = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/2fa/status", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        toastError(response?.message || "API error");
        return;
      }

      // console.log("this is api response from 2fa", apiResponse);
      // console.log("this is response from 2fa", response);
      if (!response.ok && response.message === "OTP not found") {
        setSetup(true);
        toastSuccess(response.message);
        return;
      } else {
        if (response.message === "OTP enabled successfully") {
          setSetup(false);
          setEnabled(true);
          toastSuccess(response.message);
          return;
        }

        if (response.message === "OTP is not enabled for this user") {
          setSetup(false);
          setEnabled(false);
          toastSuccess(response.message);
          return;
        }
      }

      toastSuccess(
        response?.message ||
          "Followers snapshot data last month fetched successfully"
      );
    } catch (error) {
      console.error(error);
      toastError("Fetch error");
    } finally {
      // setLoading(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleStatus();
  }, [handleStatus]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/2fa/setup", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        toastError(response?.message || "API error");
        return;
      }

      // console.log("this is api response from 2fa", apiResponse);
      // console.log("this is response from 2fa", response);
      setOtpData(response.data);
    } catch (error) {
      console.error(error);
      toastError("Fetch error");
    } finally {
      // setLoading(true);
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6 || trimmed.length > 6) {
      toastError("Code length is 6");
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ otp: trimmed }),
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        toastError(response?.message || "API error");
        setEnabled(false); // Keep toggle off on error
        return;
      }

      setEnabled(true);
      setSetup(false);
      setCode("");
      setOtpData(null);
      setModalOpen(false);
      setCodeModalOpen(false);
      handleStatus();
      toastSuccess(response?.message || "2FA enabled");
    } catch (error) {
      console.error(error);
      toastError("Fetch error");
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCodeModalOpen(false);
    setCode("");
    setEnabled(false);
  };

  const handleDisable = async () => {
    try {
      const apiResponse = await fetch("/api/2fa/disable", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout?.(10000),
      });

      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        toastError(response?.message || "API error");
        return;
      }

      // console.log("this is api response from 2fa disable", apiResponse);
      // console.log("this is response from 2fa disable", response);
      setEnabled(false);
      toastSuccess(response.message);
    } catch (error) {
      console.error(error);
      toastError("Fetch error");
    } finally {
      // setLoading(true);
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (loading) return;
    const next = !enabled;

    if (next) {
      if (setup) {
        try {
          setLoading(true);
          await handleSetup();
          setModalOpen(true);
        } catch (e) {
          console.error(e);
          toastError("Error 2FA");
        } finally {
          setLoading(false);
        }
      } else {
        // Show code verification modal for existing 2FA
        setCodeModalOpen(true);
      }
      return;
    }

    setEnabled(false);
    setLoading(true);
    try {
      await handleDisable();
    } catch (e) {
      console.error(e);
      setEnabled(true);
      toastError("Turn off 2FA fail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[var(--muted-foreground)] text-sm">
                Loading...
              </p>
            </div>
          </div>
        ) : setup ? (
          <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-8 space-y-6 border border-[var(--border)]">
            {otpData ? (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Setup 2FA
                  </h2>
                  <p className="text-[var(--muted-foreground)]">
                    Scan the QR code with your authenticator app
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <span>Show QR Code</span>
                  </div>
                </button>

                <div className="space-y-3">
                  <label
                    htmlFor="code"
                    className="block text-sm font-semibold text-[var(--foreground)]"
                  >
                    Enter 6-digit code
                  </label>

                  <input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setCode(value);
                    }}
                    placeholder="••••••"
                    className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-xl tracking-[0.5em] text-[var(--foreground)] placeholder-[var(--muted-foreground-2)] focus:border-blue-500 focus:bg-[var(--surface)] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    aria-describedby="code-help"
                    autoComplete="one-time-code"
                  />

                  <p
                    id="code-help"
                    className="text-sm text-[var(--muted-foreground)]"
                  >
                    Open your Authenticator app and enter the current 6-digit
                    code here.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!sixDigits}
                  className="w-full rounded-xl bg-gradient-to-r from-gray-900 to-black px-6 py-3 text-white font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  onClick={handleEnable}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Activate 2FA</span>
                  </div>
                </button>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">
                    Enable Two-Factor Authentication
                  </h3>
                  <p className="text-[var(--muted-foreground)]">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={handleSetup}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Setup 2FA</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-8 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  Two-Factor Authentication
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  {enabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security"}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`text-sm font-medium ${
                    enabled
                      ? "text-green-600"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-busy={loading}
                  disabled={loading}
                  onClick={toggle}
                  className={[
                    "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-lg",
                    enabled
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : "bg-gray-300",
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-xl",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-6 w-6 rounded-full bg-white transform transition-all duration-300 shadow-md",
                      enabled ? "translate-x-7" : "translate-x-1",
                    ].join(" ")}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {modalOpen && otpData && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-[var(--surface)] p-8 shadow-2xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    id="qr-modal-title"
                    className="text-xl font-bold text-[var(--foreground)]"
                  >
                    Scan QR Code
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Use your authenticator app
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-2 hover:bg-[var(--surface-muted)] transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6 text-[var(--muted-foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
                    {/* <QRCode value={otpData.qr_code_url} size={280} /> */}
                    <QRCode
                      value={(() => {
                        const issuer = "Decode Protal";
                        const raw = (
                          otpData?.otp_secret
                        )
                          .replace(/\s+/g, "")
                          .toUpperCase();
                        const padded =
                          raw + "=".repeat((8 - (raw.length % 8)) % 8);
                        if (!/^[A-Z2-7]+=*$/.test(padded))
                          return "invalid-secret";

                        const label = encodeURIComponent(issuer);

                        return `otpauth://totp/${label}?secret=${padded}&issuer=${encodeURIComponent(
                          issuer
                        )}`;
                      })()}
                      size={280}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      style={{ background: "#ffffff", padding: 12 }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[var(--foreground)]">
                    Manual Entry Key
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl border-2 border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-sm tracking-wider text-[var(--foreground)]">
                      {otpData.otp_secret}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(otpData.otp_secret);
                        toastSuccess("Secret copied to clipboard");
                      }}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 text-sm text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                      title="Copy"
                      aria-label="Copy OTP secret"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    If you can&apos;t scan the QR code, enter this key manually
                    in your authenticator app
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Code Verification Modal */}
        {codeModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="code-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancel}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-[var(--surface)] p-8 shadow-2xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    id="code-modal-title"
                    className="text-xl font-bold text-[var(--foreground)]"
                  >
                    Verify 2FA Code
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Enter code from your authenticator app
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="rounded-xl p-2 hover:bg-[var(--surface-muted)] transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6 text-[var(--muted-foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="verification-code"
                    className="block text-sm font-semibold text-[var(--foreground)]"
                  >
                    Authentication Code
                  </label>

                  <input
                    id="verification-code"
                    name="verification-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setCode(value);
                    }}
                    placeholder="••••••"
                    className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4 font-mono text-2xl tracking-[0.6em] text-[var(--foreground)] placeholder-[var(--muted-foreground-2)] focus:border-blue-500 focus:bg-[var(--surface)] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-center"
                    aria-describedby="code-help"
                    autoComplete="one-time-code"
                  />

                  <p
                    id="code-help"
                    className="text-sm text-[var(--muted-foreground)] text-center"
                  >
                    Open your authenticator app and enter the 6-digit code
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:border-[var(--muted-foreground)] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!sixDigits || loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    onClick={handleEnable}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Verify Code</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
