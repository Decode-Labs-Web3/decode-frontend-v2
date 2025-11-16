"use client";

import { ethers } from "ethers";
import { useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { AppKitProvider } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toastError, toastInfo, toastSuccess } from "@/utils/index.utils";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";

declare global {
  interface Window {
    okxwallet?: Record<string, unknown>;
    ethereum?: Record<string, unknown>;
  }
}

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
if (!projectId) console.error("REOWN_PROJECT_ID is missing");

const appUrl =
  process.env.PUBLIC_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://decode.decodenetwork.app"
    : "http://localhost:3000");

const metadata = {
  name: "Decode Protocol",
  description:
    "Decode Protocol - Secure Authentication and Identity Management",
  url: appUrl,
  icons: ["/images/tokens/3d_token_nobg.png"],
};

function WalletContent() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [formData, setFormData] = useState<{ email_or_username: string }>({
    email_or_username: "",
  });

  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155"); // EVM provider

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login-or-register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(formData),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Login/Register response:", data);

      const waitForCookie = async (name: string, timeoutMs = 800) => {
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
          if (document.cookie.includes(name + "=")) return true;
          await new Promise((r) => setTimeout(r, 25));
        }
        return false;
      };

      if (data.success && data.message === "User found") {
        console.log("User found, redirecting to login...");
        // Ensure gate cookie exists before navigating to avoid middleware race in production
        try {
          document.cookie = `gate-key-for-login=true; Max-Age=120; Path=/login; SameSite=Lax`;
          if (formData.email_or_username) {
            document.cookie = `email_or_username=${encodeURIComponent(
              formData.email_or_username
            )}; Max-Age=120; Path=/; SameSite=Lax`;
          }
        } catch {}
        // Wait briefly until cookie is guaranteed visible to the outgoing /login request (prod race fix)
        await waitForCookie("gate-key-for-login");
        toastSuccess("User found! Redirecting to login...");
        router.push("/login");
      } else if (
        !data.success &&
        data.message === "User not found" &&
        data.statusCode === 404
      ) {
        console.log("User not found, redirecting to register...");
        // Ensure gate cookie exists before navigating to avoid middleware race in production
        try {
          document.cookie = `gate-key-for-register=true; Max-Age=120; Path=/register; SameSite=Lax`;
          if (formData.email_or_username) {
            document.cookie = `email_or_username=${encodeURIComponent(
              formData.email_or_username
            )}; Max-Age=120; Path=/; SameSite=Lax`;
          }
        } catch {}
        await waitForCookie("gate-key-for-register");
        toastInfo("User not found. Redirecting to register...");
        router.push("/register");
      } else {
        console.log("Unexpected response:", data.message);
        toastError(data.message || "Something went wrong");
      }
    } catch (err: unknown) {
      console.error("Login/Register error:", err);
      toastError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const openConnectModal = async () => {
    try {
      await open();

      await new Promise((r) => setTimeout(r, 100));

      if (!isConnected || !walletProvider || !address) {
        toastInfo("Connect cancelled.");
        return;
      }
      toastSuccess("Wallet connected");

      const challengeRes = await fetch("/api/wallet/auth-challenge", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ address }),
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!challengeRes.ok) throw new Error(`HTTP ${challengeRes.status}`);
      const challengeJson = await challengeRes.json();
      const messageToSign = challengeJson?.data?.nonceMessage as string;
      if (!messageToSign) throw new Error("Missing nonce message");

      const provider = new ethers.BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);

      const verifyRes = await fetch("/api/wallet/auth-validation", {
        method: "POST",
        credentials: "include",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ address, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!verifyRes.ok) {
        console.error("Wallet auth response error:", {
          status: verifyRes.status,
          statusText: verifyRes.statusText,
          url: verifyRes.url,
        });
        toastError("Wallet auth failed. Please try again.");
        return;
      }

      const verifyJson = await verifyRes.json();

      if (!verifyJson.success) {
        console.error("Wallet auth validation failed:", {
          success: verifyJson.success,
          statusCode: verifyJson.statusCode,
          message: verifyJson.message,
        });
        toastError(
          verifyJson.message ||
            "Wallet authentication failed. Please try again."
        );
        return;
      }

      toastSuccess("Signed in with wallet");
      try {
        // Ensure the AppKit modal is closed before navigating
        close?.();
      } catch (error) {
        console.error("Close modal error:", error);
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      // Handle user rejection (code 4001) or ACTION_REJECTED
      if (
        (error as { code?: number })?.code === 4001 ||
        (error as { reason?: string })?.reason === "rejected" ||
        (error as { action?: string })?.action === "signMessage"
      ) {
        console.log("User rejected signature request");
        toastInfo("Signature request was cancelled.");
        return;
      }

      console.error("Wallet auth error:", error);

      toastError("Wallet authentication failed. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Get Started">
        <button
          onClick={openConnectModal}
          className="group w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <FontAwesomeIcon icon={faWallet} className="opacity-90" />
          <span>Connect Wallet</span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="opacity-0 -translate-x-2 group-hover:opacity-90 group-hover:translate-x-0 transition-all"
          />
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Auth.TextField
            id="email_or_username"
            type="text"
            placeholder="Enter username or email"
            value={formData.email_or_username}
            onChange={handleChange}
          />
          <Auth.SubmitButton>Explore Decode</Auth.SubmitButton>
        </form>
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}

export default function AppKitWrapper() {
  return (
    <AppKitProvider
      adapters={[new EthersAdapter()]}
      networks={[mainnet, arbitrum]}
      defaultNetwork={mainnet}
      projectId={projectId}
      metadata={metadata}
      features={{
        analytics: true,
        email: false,
        socials: [],
        emailShowWallets: false,
      }}
      themeMode="dark"
      themeVariables={{
        "--w3m-font-family": "system-ui, -apple-system, sans-serif",
      }}
    >
      <WalletContent />
    </AppKitProvider>
  );
}
