"use client";
import Link from "next/link";
import Auth from "@/components/(auth)";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/index.utils";
import { RegisterData } from "@/interfaces/index.interfaces";
import {
  toastSuccess,
  toastError,
  setCookie,
  deleteCookie,
} from "@/utils/index.utils";

export default function Register() {
  const router = useRouter();
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const value = getCookie("email_or_username");
    if (value) {
      if (value.includes("@")) {
        setRegisterData((prev) => ({ ...prev, email: value }));
      } else {
        setRegisterData((prev) => ({ ...prev, username: value }));
      }
      // document.cookie = "email_or_username=; Max-Age=0; Path=/; SameSite=lax";
      deleteCookie({ name: "email_or_username", path: "/" });
    }
  }, []);

  const handleCookie = () => {
    // document.cookie = "gate-key-for-login=true; Max-Age=60; Path=/login; SameSite=lax";
    setCookie({
      name: "gate-key-for-login",
      value: "true",
      maxAge: 60,
      path: "/login",
      sameSite: "Lax",
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData((prevRegisterData) => ({
      ...prevRegisterData,
      [event.target.id]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !registerData.email.trim() ||
      !registerData.username.trim() ||
      !registerData.password.trim() ||
      !registerData.confirmPassword.trim()
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
        body: JSON.stringify(registerData),
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
          toastError(
            response.message || "Registration failed. Please try again."
          );
        }
        return;
      }

      if (response.requiresVerification) {
        // document.cookie =
        //   "registration_data=" +
        //   JSON.stringify({
        //     email: registerData.email,
        //     username: registerData.username,
        //   }) +
        //   "; Max-Age=60; Path=/; SameSite=lax";
        setCookie({
          name: "registration_data",
          value: JSON.stringify({
            email: registerData.email,
            username: registerData.username,
          }),
          maxAge: 60,
          path: "/",
          sameSite: "Lax",
        });

        // document.cookie = "verification_required=true; Max-Age=60; Path=/; SameSite=lax";
        setCookie({
          name: "verification_required",
          value: "true",
          maxAge: 60,
          path: "/",
          sameSite: "Lax",
        });

        router.push("/verify/register");
        return;
      }

      toastSuccess("Account created successfully!");
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration request error:", error);
      toastError("Registration failed. Please try again.");
    } finally {
      console.info("/app/(auth)/register handleRegister completed");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />

      <Auth.AuthCard title="Get Started">
        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="username"
            type="text"
            placeholder="Enter username"
            value={registerData.username}
            onChange={handleChange}
          />

          <Auth.TextField
            id="email"
            type="email"
            placeholder="Enter email"
            value={registerData.email}
            onChange={handleChange}
          />

          <Auth.PasswordField
            id="password"
            value={registerData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <Auth.PasswordField
            id="confirmPassword"
            value={registerData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />

          <Auth.SubmitButton>Register</Auth.SubmitButton>
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
