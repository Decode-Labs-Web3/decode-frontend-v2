"use client";
import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError, setCookie } from "@/utils/index.utils";
import { ForgotPasswordData } from "@/interfaces/index.interfaces";

export default function ForgotPassword() {
  const router = useRouter();
  const [forgotData, setForgotData] = useState<ForgotPasswordData>({
    email_or_username: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForgotData((prevForgotData) => ({
      ...prevForgotData,
      [event.target.id]: event.target.value,
    }));
  };

  const handleSetCookie = () => {
    // document.cookie =
    //   "gate-key-for-login=true; Max-Age=60; Path=/login; SameSite=strict";
    setCookie({
      name: "gate-key-for-login",
      value: "true",
      maxAge: 60,
      path: "/login",
      sameSite: "Strict",
    });
    router.push("/login");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!forgotData.email_or_username.trim()) {
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
        body: JSON.stringify(forgotData),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      const response = await apiResponse.json();

      if (response.success) {
        toastSuccess("Reset link sent successfully!");
        router.push("/verify-forgot");
      } else {
        console.error("Forgot password failed:", response);
        toastError(
          response?.message || "Failed to send reset link. Please try again."
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

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />


      {/* Main Card */}
      <Auth.AuthCard title="Reset Password">

        {/* Simple Description */}
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your email to receive a reset link
        </p>

        {/* Back to Login Button */}
        <Auth.BackButton
          href="/login"
          onClick={handleSetCookie}
          text="Back to Login"
        />

        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="email_or_username"
            type="email"
            placeholder="Enter username or email"
            value={forgotData.email_or_username}
            onChange={handleChange}
          />

          <Auth.SubmitButton>Send Reset Password</Auth.SubmitButton>
        </form>
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}
