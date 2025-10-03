"use client";

import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9a-zA-Z]/g, "");
    setCode(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 6 || trimmed.length > 6) {
      toastError("Code length is 6");
      return;
    }

    try {
      setLoading(true);
      const apiResponse = await fetch("/api/auth/verify-forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.log(response.message);
        toastError(response.message);
      }
      router.push("/change-password");
      toastSuccess("Now you will be direct to change password");
    } catch (err) {
      toastError("Maybe the server error can not verify right now ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = code.trim().length < 6 || code.trim().length > 6;

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />

      <Auth.AuthCard title="Verify Forgot">
        <Auth.BackButton href="/" text="Back to Home" />

        <form onSubmit={handleSubmit} className="space-y-3">
          <Auth.TextField
            id="code"
            type="text"
            placeholder="Enter your code"
            value={code}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isInvalid || loading}
            aria-busy={loading}
            className={`w-full rounded-md p-2 transition ${
              isInvalid || loading
                ? "bg-blue-700/50 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}
