"use client";
import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/utils/toast.utils";
import { apiCallWithTimeout } from "@/utils/api.utils";
import { setCookie } from "@/utils/cookie.utils";

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
    setCookie("gate-key-for-login", "true", { maxAge: 60, path: "/login" });
  };

  const handleForgotPassword = async () => {
    if (!formData.email_or_username.trim()) {
      showError("Please enter your email or username");
      return;
    }
    try {
      const responseData = await apiCallWithTimeout(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: formData,
        }
      );

      if (responseData.success) {
        showSuccess("Reset link sent successfully!");
        router.push("/verify/forgot");
      } else {
        console.error("Forgot password failed:", responseData);
        showError(
          responseData?.message ||
            "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password request error:", error);
      showError("Failed to send reset link. Please try again.");
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
