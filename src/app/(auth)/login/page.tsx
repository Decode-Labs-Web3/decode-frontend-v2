"use client";
import Link from "next/link";
import Auth from "@/components/(auth)";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCallWithTimeout } from "@/utils/api.utils";
import { showSuccess, showError } from "@/utils/toast.utils";
import { getCookie, setCookie, deleteCookie } from "@/utils/cookie.utils";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    email_or_username: string;
    password: string;
  }>({
    email_or_username: "",
    password: "",
  });

  const handleCookie = () => {
    setCookie("gate-key-for-register", "true", {
      maxAge: 60,
      path: "/register",
    });
  };

  const handleCookieForgotPassword = () => {
    setCookie("gate-key-for-forgot-password", "true", {
      maxAge: 60,
      path: "/forgot-password",
    });
  };

  useEffect(() => {
    const value = getCookie("email_or_username");
    if (value) {
      setFormData((prev) => ({ ...prev, email_or_username: value }));
      deleteCookie("email_or_username");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleLogin = async () => {
    if (!formData.email_or_username.trim() || !formData.password.trim()) {
      showError("Please fill in all fields");
      return;
    }
    try {
      const responseData = await apiCallWithTimeout("/api/auth/login", {
        method: "POST",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        body: formData,
      });

      if (
        responseData.success &&
        responseData.statusCode === 200 &&
        responseData.message === "Login successful"
      ) {
        showSuccess("Login successful!");
        router.push("/dashboard");
      } else if (
        responseData.success &&
        responseData.statusCode === 400 &&
        responseData.message ===
          "Device fingerprint not trusted, send email verification"
      ) {
        router.push("/verify/login");
      } else {
        console.error("Login failed:", responseData);
        showError(responseData?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login request error:", error);
      showError("Login failed. Please try again.");
    } finally {
      console.info("/app/(auth)/login handleLogin completed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Log in">
        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="email_or_username"
            type="text"
            placeholder="Enter username or email"
            value={formData.email_or_username}
            onChange={handleChange}
          />

          <Auth.PasswordField
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          <div className="mb-5 text-right">
            <a
              href="/forgot-password"
              onClick={handleCookieForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <Auth.SubmitButton>Log in</Auth.SubmitButton>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-400">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            onClick={handleCookie}
            className="text-blue-500 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}
