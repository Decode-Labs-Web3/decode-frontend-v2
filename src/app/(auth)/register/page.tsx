"use client";
import Link from "next/link";
import Auth from "@/components/(auth)";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordValidationService } from "@/services/password-validation.service";
import { useLoading } from "@/hooks/useLoading";
import { showSuccess, showError } from "@/utils/toast.utils";
import { apiCallWithTimeout } from "@/utils/api.utils";
import { getCookie, setCookie, deleteCookie } from "@/utils/cookie.utils";

export default function Register() {
  const router = useRouter();
  const { loading, withLoading } = useLoading();
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
      deleteCookie("email_or_username");
    }
  }, []);

  const handleCookie = () => {
    setCookie("gate-key-for-login", "true", { maxAge: 60, path: "/login" });
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
      showError("Please fill in all fields");
      return;
    }
    try {
      const data = await apiCallWithTimeout("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      if (!data.success) {
        console.error("Registration failed:", data);
        if (data.message === "Email already exists") {
          showError(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          showError(data.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Check if email verification is required
      if (data.requiresVerification) {
        // Store registration data for verification
        sessionStorage.setItem(
          "registration_data",
          JSON.stringify({
            email: formData.email,
            username: formData.username,
          })
        );
        sessionStorage.setItem("verification_required", "true");

        // Redirect to verify email page
        router.push("/verify/register");
        return;
      }

      // If no verification needed, redirect to login
      showSuccess("Account created successfully!");
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration request error:", error);
      showError("Registration failed. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    await withLoading(handleRegister);
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

          <Auth.SubmitButton
            loading={loading}
            disabled={!isPasswordValid}
            loadingText="Creating account..."
          >
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
