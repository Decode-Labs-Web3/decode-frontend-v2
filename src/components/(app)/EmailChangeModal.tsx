"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailChangeModal({
  isOpen,
  onClose,
}: EmailChangeModalProps) {
  const { updateUserEmail } = useUser();
  const [emailChange, setEmailChange] = useState({
    old_code: "",
    new_email: "",
    new_code: "",
  });

  const [emailStep, setEmailStep] = useState({
    old_code: true,
    new_email: false,
    new_code: false,
  });

  const { fingerprintHash } = useFingerprint();
  const [errorEmail, setErrorEmail] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailChange((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    if (
      event.target.name === "new_email" &&
      emailChange.new_email.trim().length >= 1
    ) {
      setErrorEmail("");
      handleEmailDebounce(event.target.value);
    }
  };

  const handleEmailDebounce = async (email: string) => {
    setErrorEmail("");
    try {
      const apiResponse = await fetch("/api/email/email-debounce", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ email }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        setErrorEmail(response.message);
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      if (response.success) {
        console.log("Email is available");
        setErrorEmail(response.message);
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleSendCodeOldEmail = async () => {
    setErrorEmail("");
    try {
      const apiResponse = await fetch("/api/email/old-email", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.success && response.message === "Email verification sent") {
        // Modal stays open, step changes handled in parent
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleVerifyCodeOldEmail = async (code: string) => {
    setErrorEmail("");
    try {
      const apiResponse = await fetch("/api/email/old-email", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        setErrorEmail(response.message);
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      if (
        response.success &&
        response.message === "Email change code verified"
      ) {
        setEmailStep((prev) => ({ ...prev, old_code: false, new_email: true }));
      } else {
        setErrorEmail(response.message);
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleSendCodeNewEmail = async (email: string) => {
    setErrorEmail("");
    try {
      const apiResponse = await fetch("/api/email/new-email", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ email, code: emailChange.old_code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        setErrorEmail(response.message);
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      if (
        response.success &&
        response.message === "New email change initiated successfully"
      ) {
        setEmailStep((prev) => ({ ...prev, new_code: true, new_email: false }));
      } else {
        setErrorEmail(response.message);
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleVerifyCodeNewEmail = async (code: string) => {
    setErrorEmail("");
    try {
      const apiResponse = await fetch("/api/email/new-code", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        setErrorEmail(response.message);
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      if (
        response.success &&
        response.message === "Email changed successfully"
      ) {
        setEmailStep((prev) => ({ ...prev, new_code: false, old_code: true }));
        setEmailChange({ old_code: "", new_email: "", new_code: "" });
        updateUserEmail(emailChange.new_email);
        onClose();
      } else {
        setErrorEmail(response.message);
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleClose = () => {
    onClose();
    setErrorEmail("");
    setEmailChange({ old_code: "", new_email: "", new_code: "" });
    setEmailStep({ old_code: true, new_email: false, new_code: false });
  };

  const handleSendInitialCode = () => {
    handleSendCodeOldEmail();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Update your email address associated with your account.
          </DialogDescription>
        </DialogHeader>

        {emailStep.old_code && (
          <div className="space-y-6 px-1 py-2">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">
                Step 1: Verify your current email
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enter the verification code sent to your current email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="old_code">Verification code</Label>
              <Input
                id="old_code"
                name="old_code"
                type="text"
                placeholder="e.g. 1a2b3c"
                value={emailChange.old_code}
                onChange={handleEmailChange}
                maxLength={6}
                inputMode="text"
                pattern=".{6}"
                autoComplete="one-time-code"
              />
            </div>
            {errorEmail && (
              <div className="text-center text-red-500 text-sm font-medium py-1">
                {errorEmail}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleSendInitialCode}
                disabled={false}
              >
                Send Code
              </Button>
              <Button
                className="bg-(--primary) text-(--primary-foreground) min-w-[140px]"
                onClick={() => handleVerifyCodeOldEmail(emailChange.old_code)}
                disabled={!emailChange.old_code}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {emailStep.new_email && (
          <div className="space-y-6 px-1 py-2">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">
                Step 2: Enter your new email
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enter the new email address you want to use.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_email">New email</Label>
              <Input
                id="new_email"
                name="new_email"
                type="email"
                placeholder="e.g. decodenetwork@gmail.com"
                value={emailChange.new_email}
                onChange={handleEmailChange}
              />
            </div>
            {errorEmail && (
              <div className="text-center text-red-500 text-sm font-medium py-1">
                {errorEmail}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setEmailStep((prev) => ({
                    ...prev,
                    old_code: true,
                    new_email: false,
                  }))
                }
              >
                Back
              </Button>
              <Button
                className="bg-(--primary) text-(--primary-foreground) min-w-[140px]"
                onClick={() => handleSendCodeNewEmail(emailChange.new_email)}
              >
                Send verification code
              </Button>
            </div>
          </div>
        )}

        {emailStep.new_code && (
          <div className="space-y-6 px-1 py-2">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">
                Step 3: Verify your new email
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enter the verification code sent to your new email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_code">New verification code</Label>
              <Input
                id="new_code"
                name="new_code"
                type="text"
                placeholder="e.g. 1a2b3c"
                value={emailChange.new_code}
                onChange={handleEmailChange}
                maxLength={6}
                inputMode="text"
                pattern=".{6}"
                autoComplete="one-time-code"
              />
            </div>
            {errorEmail && (
              <div className="text-center text-red-500 text-sm font-medium py-1">
                {errorEmail}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setEmailStep((prev) => ({
                    ...prev,
                    new_code: false,
                    new_email: true,
                  }))
                }
              >
                Back
              </Button>
              <Button
                className="bg-(--primary) text-(--primary-foreground) min-w-[140px]"
                onClick={() => handleVerifyCodeNewEmail(emailChange.new_code)}
              >
                Complete change
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
