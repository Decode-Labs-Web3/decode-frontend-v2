"use client";
import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";

export default function ForgotPassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ email_or_username: string }>({
    email_or_username: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCookie = () => {
    document.cookie = "gate-key-for-login=true; Max-Age=60; Path=/login; SameSite=strict";
    router.push("/login");
  };

  const handleForgotPassword = async () => {
    if (!formData.email_or_username.trim()) {
      toastError("Please enter your email or username");
      return;
    }
    try {
      const apiResponse = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify(formData),
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
        }
      );

      const response = await apiResponse.json();

      if (response.success) {
        toastSuccess("Reset link sent successfully!");
        router.push("/verify/forgot");
      } else {
        console.error("Forgot password failed:", response);
        toastError(
          response?.message ||
            "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password request error:", error);
      toastError("Failed to send reset link. Please try again.");
    } finally {
      console.info(
        "/app/(auth)/forgot-password handleForgotPassword completed"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleForgotPassword();
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Reset Password">
        {/* Back to Login Button */}
        <Auth.BackButton
          href="/login"
          onClick={handleCookie}
          text="Back to Login"
        />

        {/* Simple Description */}
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="email_or_username"
            type="email"
            placeholder="Enter username or email"
            value={formData.email_or_username}
            onChange={handleChange}
          />

          <Auth.SubmitButton disabled={!formData.email_or_username}>
            Send Reset Link
          </Auth.SubmitButton>
        </form>
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}
