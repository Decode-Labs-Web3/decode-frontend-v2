"use client";

import QRCode from "react-qr-code";
import { getApiHeaders } from "@/utils/api.utils";
import { useState, useEffect, useCallback } from "react";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faPlus,
  faLock,
  faCheck,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { fingerprintHash } = useFingerprint();
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
        headers: getApiHeaders(fingerprintHash),
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
  }, [fingerprintHash]);

  useEffect(() => {
    handleStatus();
  }, [handleStatus]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/2fa/setup", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
        headers: getApiHeaders(fingerprintHash),
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
          <Card className="flex items-center justify-center py-12">
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-muted-foreground-2 border-t-ring rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading...</p>
            </CardContent>
          </Card>
        ) : setup ? (
          <Card className="space-y-6">
            <CardContent className="space-y-6">
              {otpData ? (
                <>
                  <div className="text-center space-y-2">
                    <CardTitle className="text-2xl">Setup 2FA</CardTitle>
                    <CardDescription>
                      Scan the QR code with your authenticator app
                    </CardDescription>
                  </div>

                  <Button
                    onClick={() => setModalOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                    Show QR Code
                  </Button>

                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-sm font-semibold">
                      Enter 6-digit code
                    </Label>

                    <Input
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
                      className="font-mono text-xl tracking-[0.5em] text-center"
                      aria-describedby="code-help"
                      autoComplete="one-time-code"
                    />

                    <p
                      id="code-help"
                      className="text-sm text-muted-foreground"
                    >
                      Open your Authenticator app and enter the current 6-digit
                      code here.
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={!sixDigits}
                    className="w-full"
                    onClick={handleEnable}
                    size="lg"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                    Activate 2FA
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="w-8 h-8 text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Enable Two-Factor Authentication
                    </h3>
                    <p className="text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button onClick={handleSetup} className="w-full" size="lg">
                    <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
                    Setup 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    {enabled
                      ? "Your account is protected with 2FA"
                      : "Add an extra layer of security"}
                  </CardDescription>
                </div>

                <div className="flex flex-col justify-center space-x-4 gap-4">
                  <Badge variant={enabled ? "default" : "secondary"}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={enabled}
                    onCheckedChange={toggle}
                    disabled={loading}
                    aria-busy={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Modal */}
        <Dialog open={modalOpen && !!otpData} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>Use your authenticator app</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-2xl border-2 border-border bg-surface p-6 shadow-lg">
                  <QRCode
                    value={(() => {
                      if (!otpData?.otp_secret) return "invalid-secret";

                      const issuer = "Decode Portal";
                      const raw = otpData.otp_secret
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
                <Label className="text-sm font-semibold">
                  Manual Entry Key
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl border-2 border-border bg-muted px-4 py-3 font-mono text-sm tracking-wider">
                    {otpData?.otp_secret}
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(otpData!.otp_secret);
                      toastSuccess("Secret copied to clipboard");
                    }}
                    variant="outline"
                    size="icon"
                    title="Copy"
                    aria-label="Copy OTP secret"
                  >
                    <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you can&apos;t scan the QR code, enter this key manually in
                  your authenticator app
                </p>
              </div>

              <Button
                onClick={() => setModalOpen(false)}
                className="w-full"
                size="lg"
              >
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* code modal */}
        <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify 2FA Code</DialogTitle>
              <DialogDescription>
                Enter code from your authenticator app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="w-8 h-8 text-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="verification-code"
                  className="text-sm font-semibold"
                >
                  Authentication Code
                </Label>

                <Input
                  id="verification-code"
                  name="verification-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(value);
                  }}
                  placeholder="••••••"
                  className="font-mono text-2xl tracking-[0.6em] text-center"
                  aria-describedby="code-help"
                  autoComplete="one-time-code"
                />

                <p
                  id="code-help"
                  className="text-sm text-muted-foreground text-center"
                >
                  Open your authenticator app and enter the 6-digit code
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!sixDigits || loading}
                  className="flex-1"
                  onClick={handleEnable}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-card-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="w-4 h-4 mr-2"
                      />
                      Verify Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
