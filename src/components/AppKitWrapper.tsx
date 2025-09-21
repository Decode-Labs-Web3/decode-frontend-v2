"use client";

import { useEffect, useState } from "react";
import { AppKitProvider } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, arbitrum } from "@reown/appkit/networks";

// Global type declarations for wallet detection
declare global {
  interface Window {
    okxwallet?: Record<string, unknown>;
    ethereum?: Record<string, unknown>;
  }
}
import { ethers } from "ethers";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { showError, showInfo, showSuccess } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetwork,
} from "@reown/appkit/react";

// AppKit configuration
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
if (!projectId) console.error("REOWN_PROJECT_ID is missing");

const metadata = {
  name: "Decode Protocol",
  description:
    "Decode Protocol - Secure Authentication and Identity Management",
  url: "http://localhost:3000",
  icons: ["/images/tokens/3d_token_nobg.png"],
};

// Inner component that uses AppKit hooks
function WalletContent() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ email_or_username: string }>({
    email_or_username: "",
  });

  const { open } = useAppKit();
  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155"); // EVM provider
  const { chainId } = useAppKitNetwork();

  console.log("AppKit state:", { address, isConnected, chainId });

  const [balanceEth, setBalanceEth] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!isConnected || !walletProvider || !address) return;
        const provider = new ethers.BrowserProvider(
          walletProvider as ethers.Eip1193Provider
        );
        const bal = await provider.getBalance(address);
        setBalanceEth(ethers.formatEther(bal));
      } catch (e) {
        console.debug("Get balance failed:", e);
      }
    })();
  }, [isConnected, walletProvider, address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setLoading(true);

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
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Login/Register response:", data);

      if (data.success && data.message === "User found") {
        console.log("User found, redirecting to login...");
        showSuccess("User found! Redirecting to login...");
        router.push("/login");
      } else if (!data.success && data.message === "User not found") {
        console.log("User not found, redirecting to register...");
        showInfo("User not found. Redirecting to register...");
        router.push("/register");
      } else {
        console.log("Unexpected response:", data.message);
        showError(data.message || "Something went wrong");
      }
    } catch (err: unknown) {
      console.error("Login/Register error:", err);
      showError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const openConnectModal = async () => {
    try {
      await open();

      await new Promise((r) => setTimeout(r, 100));

      if (!isConnected || !walletProvider || !address) {
        showInfo("Connect cancelled.");
        return;
      }
      showSuccess("Wallet connected");

      const challengeRes = await fetch("/api/wallet/auth-challenge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!challengeRes.ok) throw new Error(`HTTP ${challengeRes.status}`);
      const challengeJson = await challengeRes.json();
      console.log("Challenge data:", challengeJson);
      const messageToSign = challengeJson?.data?.nonceMessage as string;
      if (!messageToSign) throw new Error("Missing nonce message");

      const provider = new ethers.BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);
      console.log("Signature:", signature);

      const verifyRes = await fetch("/api/wallet/auth-validation", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!verifyRes.ok) {
        console.error("Wallet auth response error:", {
          status: verifyRes.status,
          statusText: verifyRes.statusText,
          url: verifyRes.url,
        });
        showError("Wallet auth failed. Please try again.");
        return;
      }

      const verifyJson = await verifyRes.json();
      console.log("Wallet auth response data:", verifyJson);

      if (!verifyJson.success) {
        console.error("Wallet auth validation failed:", {
          success: verifyJson.success,
          statusCode: verifyJson.statusCode,
          message: verifyJson.message,
        });
        showError(
          verifyJson.message ||
            "Wallet authentication failed. Please try again."
        );
        return;
      }

      showSuccess("Signed in with wallet");
      router.push("/dashboard");
    } catch (err: unknown) {
      // Handle user rejection (code 4001) or ACTION_REJECTED
      if (
        (err as { code?: number })?.code === 4001 ||
        (err as { reason?: string })?.reason === "rejected" ||
        (err as { action?: string })?.action === "signMessage"
      ) {
        console.log("User rejected signature request");
        showInfo("Signature request was cancelled.");
        return;
      }

      // Log full error details for debugging
      console.error("Wallet auth error:", err);

      // Show user-friendly error message
      showError("Wallet authentication failed. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Get Started">
        {/* Connect Wallet Button */}
        <button
          onClick={openConnectModal}
          className="group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <FontAwesomeIcon icon={faWallet} className="opacity-90" />
          <span>Connect Wallet</span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="opacity-0 -translate-x-2 group-hover:opacity-90 group-hover:translate-x-0 transition-all"
          />
        </button>

        {isConnected && address && (
          <div className="-mt-4 mb-6 text-xs text-gray-300 truncate max-w-full">
            Connected: {address} • Chain ID: {chainId ?? "-"} • Bal:{" "}
            {balanceEth || "-"} ETH
            <div className="opacity-70">CAIP: {caipAddress ?? "-"}</div>
          </div>
        )}

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
          <Auth.SubmitButton loading={loading} loadingText="Exploring...">
            Explore Decode
          </Auth.SubmitButton>
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
