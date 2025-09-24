import { useState } from "react";
import { toast } from "react-toastify";
import { UseVerificationProps } from "@/interfaces";

export function useVerification({
  type,
  onSuccess,
  onError,
}: UseVerificationProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");

    if (code.length !== 6) {
      setError("Please enter the complete 6-character code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ code, type }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (responseData.success) {
        setError("");
        onSuccess(responseData);
      } else {
        const errorMessage =
          responseData.message ||
          "Invalid verification code. Please check your email and try again.";
        setError(errorMessage);
        setDigits(Array(6).fill(""));
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = "Verification failed. Please try again.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (resendEndpoint?: string) => {
    if (!resendEndpoint) return;

    try {
      const response = await fetch(resendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const responseData = await response.json();
      console.log("Resend response:", responseData);
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
    } finally {
      console.log("Verification code resend operation completed");
    }
  };

  return {
    error,
    loading,
    digits,
    setDigits,
    setError: toast.error,
    handleVerify,
    handleResend,
  };
}
