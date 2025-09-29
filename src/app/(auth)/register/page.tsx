"use client";
import Link from "next/link";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/index.utils";
import { useEffect, useState, useMemo } from "react";
import { RegisterData } from "@/interfaces/index.interfaces";
import {
  toastSuccess,
  toastError,
  setCookie,
  deleteCookie,
} from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";

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

  const { barBg, barPct } = useMemo(() => {
    const pw = registerData.password || "";
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const longEnough = pw.length >= 8;

    let level: "weak" | "fair" | "strong" = "weak";
    if (hasLetter && hasDigit && hasSpecial && longEnough) level = "strong";
    else if (hasLetter && hasDigit && hasSpecial) level = "fair";
    else if (hasLetter && hasDigit) level = "weak";
    else level = "weak";

    const bg =
      level === "strong"
        ? "bg-green-500"
        : level === "fair"
        ? "bg-yellow-500"
        : "bg-red-500";

    const pct = !pw ? 0 : level === "strong" ? 100 : level === "fair" ? 60 : 30;

    return { barBg: bg, barPct: pct };
  }, [registerData.password]);

  const passwordChecks = useMemo(() => {
    const password = registerData.password ?? "";
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      match:
        (registerData.password?.length ?? 0) > 0 &&
        (registerData.confirmPassword?.length ?? 0) > 0 &&
        registerData.password === registerData.confirmPassword,
    };
  }, [registerData.password, registerData.confirmPassword]);

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

          {/* Password strength color + length */}
          <div className="mb-2" aria-hidden="true">
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full ${barBg} transition-all duration-300 ease-out`}
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>

          <div className="mb-5">
            {!passwordChecks.number ? (
              <p className="text-red-400">
                <FontAwesomeIcon icon={faX} className="mr-2" />
                Password must contain at least one number
              </p>
            ) : !passwordChecks.uppercase ? (
              <p className="text-red-400">
                <FontAwesomeIcon icon={faX} className="mr-2" />
                Password must contain at least one uppercase letter
              </p>
            ) : !passwordChecks.special ? (
              <p className="text-red-400">
                <FontAwesomeIcon icon={faX} className="mr-2" />
                Password must contain at least one special character
              </p>
            ) : !passwordChecks.length ? (
              <p className="text-red-400">
                <FontAwesomeIcon icon={faX} className="mr-2" />
                Password must be at least 8 characters long
              </p>
            ) : (
              <p className="text-green-400">
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Password meets all requirements
              </p>
            )}
          </div>

          <Auth.PasswordField
            id="confirmPassword"
            value={registerData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />

          <div className="mb-5">
            {passwordChecks.match ? (
              <p className="text-green-500">
                <FontAwesomeIcon icon={faCheck} className="text-green-500" />{" "}
                Passwords match
              </p>
            ) : (
              <p className="text-red-400">
                <FontAwesomeIcon icon={faX} className="text-red-400" />{" "}
                Passwords do not match
              </p>
            )}
          </div>

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
