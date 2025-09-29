"use client";

import Link from "next/link";
import Auth from "@/components/(auth)";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/index.utils";
import { LoginData } from "@/interfaces/index.interfaces";
import {
  toastSuccess,
  toastError,
  setCookie,
  deleteCookie,
} from "@/utils/index.utils";

export default function Login() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    email_or_username: "",
    password: "",
  });

  useEffect(() => {
    const value = getCookie("email_or_username");
    if (value) {
      setLoginData((prev) => ({
        ...prev,
        email_or_username: value,
      }));
      // document.cookie = "email_or_username=; Max-Age=0; Path=/; SameSite=lax";
      deleteCookie({ name: "email_or_username", path: "/" });
    }
  }, []);

  const handleCookieRegister = () => {
    // document.cookie = "gate-key-for-register=true; Max-Age=60; Path=/register; SameSite=lax";
    setCookie({
      name: "gate-key-for-register",
      value: "true",
      maxAge: 60,
      path: "/register",
      sameSite: "Lax",
    });
  };

  const handleCookieForgotPassword = () => {
    // document.cookie = "gate-key-for-forgot-password=true; Max-Age=60; Path=/forgot-password; SameSite=lax";
    setCookie({
      name: "gate-key-for-forgot-password",
      value: "true",
      maxAge: 60,
      path: "/forgot-password",
      sameSite: "Lax",
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prevData) => ({
      ...prevData,
      [event.target.id]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginData.email_or_username.trim() || !loginData.password.trim()) {
      toastError("Please fill in all fields");
      return;
    }
    try {
      const responseData = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(loginData),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await responseData.json();

      if (
        response.success &&
        response.statusCode === 200 &&
        response.message === "Login successful"
      ) {
        toastSuccess("Login successful!");
        router.push("/dashboard");
      } else if (
        response.success &&
        response.statusCode === 400 &&
        response.message ===
          "Device fingerprint not trusted, send email verification"
      ) {
        router.push("/verify/login");
      } else {
        console.log("Login failed:", response);
        toastError(response?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login request error:", error);
      toastError("Login failed. Please try again.");
    } finally {
      console.info("/app/(auth)/login handleLogin completed");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Log in">
        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="email_or_username"
            type="text"
            placeholder="Enter username or email"
            value={loginData.email_or_username}
            onChange={handleChange}
          />

          <Auth.PasswordField
            id="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          <div className="mb-5 text-right">
            <Link
              href="/forgot-password"
              onClick={handleCookieForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Auth.SubmitButton>Log in</Auth.SubmitButton>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-400">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            onClick={handleCookieRegister}
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
