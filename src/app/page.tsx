"use client";

import { useEffect, useState } from "react";
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

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ email_or_username: string }>({
    email_or_username: "",
  });

  // 🔸 AppKit state (sau khi Connect)
  const { open } = useAppKit();
  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155"); // EVM provider
  const { chainId } = useAppKitNetwork();

  const [balanceEth, setBalanceEth] = useState<string>("");

  // Lấy balance (demo) khi đã connect
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
    if (!formData.email_or_username.trim() || loading) return;
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/auth/login-or-register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "frontend-internal-request": "true",
        },
        body: JSON.stringify(formData),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!apiResponse.ok) {
        throw Object.assign(new Error(`HTTP ${apiResponse.status}`), {
          status: apiResponse.status,
        });
      }

      const responseData = await apiResponse.json();
      console.log("Login or register response data:", responseData);

      if (
        responseData.success &&
        responseData.statusCode === 200 &&
        responseData.message === "User found"
      ) {
        router.push("/login");
      } else if (
        !responseData.success &&
        responseData.statusCode === 400 &&
        responseData.message === "User not found"
      ) {
        router.push("/register");
      } else {
        throw new Error(responseData.message);
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        console.error("Request timeout/aborted");
        showError("Request timeout/aborted. Please try again.");
      } else {
        console.error(error);
        showError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const openConnectModal = async () => {
    try {
      // 1) Mở modal connect
      await open();

      // đợi state cập nhật 1 nhịp (tránh race)
      await new Promise((r) => setTimeout(r, 100));

      if (!isConnected || !walletProvider || !address) {
        showInfo("Connect cancelled.");
        return;
      }
      showSuccess("Wallet connected");

      // 2) Yêu cầu challenge từ backend
      const challengeRes = await fetch("/api/wallet/auth-challenge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "frontend-internal-request": "true",
        },
        body: JSON.stringify({ address }), // <-- gửi JSON, không gửi raw string
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!challengeRes.ok) throw new Error(`HTTP ${challengeRes.status}`);
      const challengeJson = await challengeRes.json();
      console.log("Challenge data:", challengeJson);
      const messageToSign = challengeJson?.data?.nonceMessage as string;
      if (!messageToSign) throw new Error("Missing nonce message");

      // 3) Ký message bằng ví
      const provider = new ethers.BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);

      console.log("Signature:", signature);

      // 4) Gửi chữ ký về backend để verify + set cookie session
      const verifyRes = await fetch("/api/wallet/auth-validation", {
        method: "POST",
        credentials: "include", // để backend set cookie phiên đăng nhập
        headers: {
          "Content-Type": "application/json",
          "frontend-internal-request": "true",
        },
        body: JSON.stringify({
          address,
          signature,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson?.success) {
        throw new Error(verifyJson?.message || "Signature verify failed");
      }

      showSuccess("Signed in with wallet");
      router.push("/dashboard"); // tuỳ trang bạn muốn vào sau khi login
    } catch (err: unknown) {
      // 4001 = user rejected request (Metamask)
      if ((err as { code?: number })?.code === 4001) {
        showInfo("You rejected the signature.");
        return;
      }
      console.error("Wallet auth error:", err);
      showError(err instanceof Error ? err.message : "Wallet auth failed");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Get Started">
        {/* Wallet Button */}

        <button
          onClick={openConnectModal}
          className="group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all shadow-lg"
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
