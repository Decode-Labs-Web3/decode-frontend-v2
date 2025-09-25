"use client";

import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { PasswordValidationService } from "@/services/password-validation.services";
import { toastSuccess, toastError } from "@/utils/index.utils";

export default function ChangePassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    new_password: string;
    confirm_new_password: string;
  }>({
    new_password: "",
    confirm_new_password: "",
  });
  const { isPasswordValid } = PasswordValidationService.validate(
    formData.new_password,
    formData.confirm_new_password
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleChangePassword = async () => {
    if (
      !formData.new_password.trim() ||
      !formData.confirm_new_password.trim()
    ) {
      toastError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      toastError("Please meet all password requirements.");
      return;
    }

    try {
      const apiResponse = await fetch("/api/auth/change-password",
        {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleChangePassword();
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Change Password">
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your new password below.
        </p>

        <form noValidate onSubmit={handleSubmit}>
          <Auth.PasswordField
            id="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="New password"
          />

          <Auth.PasswordValidation
            password={formData.new_password}
            confirmPassword={formData.confirm_new_password}
          />

          <Auth.PasswordField
            id="confirm_new_password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            placeholder="Confirm new password"
          />

          <Auth.SubmitButton disabled={!isPasswordValid}>
            Save and log in
          </Auth.SubmitButton>
        </form>
      </Auth.AuthCard>
    </main>
  );
}
