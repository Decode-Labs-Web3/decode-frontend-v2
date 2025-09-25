"use client";
import Link from "next/link";
import Auth from "@/components/(auth)";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordValidationService } from "@/services/password-validation.services";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { getCookie } from "@/utils/index.utils";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { isPasswordValid } = PasswordValidationService.validate(
    formData.password,
    formData.confirmPassword
  );

  useEffect(() => {
    const value = getCookie("email_or_username");
    if (value) {
      if (value.includes("@")) {
        setFormData((prev) => ({ ...prev, email: value }));
      } else {
        setFormData((prev) => ({ ...prev, username: value }));
      }
      document.cookie = "email_or_username=; Max-Age=0; Path=/; SameSite=lax";
    }
  }, []);

  const handleCookie = () => {
    document.cookie = "gate-key-for-login=true; Max-Age=60; Path=/login; SameSite=lax";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleRegister = async () => {
    if (
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toastError("Please fill in all fields");
      return;
    }
    try {
      const apiResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(formData),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      const response = await apiResponse.json();

      if (!response.success) {
        console.error("Registration failed:", response);
        if (response.message === "Email already exists") {
          toastError(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          toastError(response.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Check if email verification is required
      if (response.requiresVerification) {
        // Store registration data in cookies for API access
        document.cookie = "registration_data=" + JSON.stringify({
          email: formData.email,
          username: formData.username,
        }) + "; Max-Age=600; Path=/; SameSite=lax";

        document.cookie = "verification_required=true; Max-Age=600; Path=/; SameSite=lax";

        // Redirect to verify email page
        router.push("/verify/register");
        return;
      }

      // If no verification needed, redirect to login
      toastSuccess("Account created successfully!");
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration request error:", error);
      toastError("Registration failed. Please try again.");
    } finally {
      console.info("/app/(auth)/register handleRegister completed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister();
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      <Auth.AuthCard title="Get Started">
        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="username"
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
          />

          <Auth.TextField
            id="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />

          <Auth.PasswordField
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <Auth.PasswordValidation
            password={formData.password}
            confirmPassword={formData.confirmPassword}
          />

          <Auth.PasswordField
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />

          <Auth.SubmitButton disabled={!isPasswordValid}>
            Register
          </Auth.SubmitButton>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            onClick={handleCookie}
            className="text-blue-500 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </Auth.AuthCard>
      <Auth.BrandLogos />
    </main>
  );
}
