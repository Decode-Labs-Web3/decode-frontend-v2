"use client";

import Auth from "@/components/(auth)";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { ChangePasswordData } from "@/interfaces/index.interfaces";
import { toastSuccess, toastError } from "@/utils/index.utils";

export default function ChangePassword() {
  const router = useRouter();
  const [changePasswordData, setChangePasswordData] =
    useState<ChangePasswordData>({
      new_password: "",
      confirm_new_password: "",
    });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChangePasswordData((prevChangePasswordData) => ({
      ...prevChangePasswordData,
      [event.target.id]: event.target.value,
    }));
  };

  const handleChangePassword = async () => {
    if (
      !changePasswordData.new_password.trim() ||
      !changePasswordData.confirm_new_password.trim()
    ) {
      toastError("Please fill in all fields");
      return;
    }

    try {
      const apiResponse = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(changePasswordData),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      const response = await apiResponse.json();

      if (response.success) {
        toastSuccess("Password changed successfully!");
        router.push("/login");
      } else {
        console.error("Change password failed:", response);
        toastError(response.message || "Password change failed");
      }
    } catch (error) {
      console.error("Change password request error:", error);
      toastError("Password change failed. Please try again.");
    }
  };

  // const handleSetCookie = () => {
  //   // document.cookie =
  //   //   "gate-key-for-login=true; Max-Age=60; Path=/login; SameSite=strict";
  //   setCookie({
  //     name: "gate-key-for-login",
  //     value: "true",
  //     maxAge: 60,
  //     path: "/login",
  //     sameSite: "Strict",
  //   });
  //   router.push("/login");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleChangePassword();
  };

  const passwordChecks = useMemo(() => {
    const password = changePasswordData.new_password ?? "";
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      match:
        (changePasswordData.new_password?.length ?? 0) > 0 &&
        (changePasswordData.confirm_new_password?.length ?? 0) > 0 &&
        changePasswordData.new_password ===
          changePasswordData.confirm_new_password,
    };
  }, [
    changePasswordData.new_password,
    changePasswordData.confirm_new_password,
  ]);

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Change Password">
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your new password below.
        </p>

        <Auth.BackButton
          href="/"
          // onClick={handleSetCookie}
          text="Back to Home"
        />

        <form noValidate onSubmit={handleSubmit}>
          <Auth.PasswordField
            id="new_password"
            value={changePasswordData.new_password}
            onChange={handleChange}
            placeholder="New password"
          />

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
            id="confirm_new_password"
            value={changePasswordData.confirm_new_password}
            onChange={handleChange}
            placeholder="Confirm new password"
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

          <Auth.SubmitButton>Save and log in</Auth.SubmitButton>
        </form>
      </Auth.AuthCard>
    </main>
  );
}
