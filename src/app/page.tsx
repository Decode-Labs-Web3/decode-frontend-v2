"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Auth from "@/components/(auth)";
import { useRouter } from "next/navigation";
import { showError, showInfo, showSuccess } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";

declare global {
  interface EthereumProvider {
    request: (args: {
      method: string;
      params?: unknown[] | Record<string, unknown>;
    }) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeAllListeners?: (event?: string) => void;
  }
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ email_or_username: string }>({
    email_or_username: "",
  });
  const [hasProvider, setHasProvider] = useState<boolean>(true);

  useEffect(() => {
    const eth = window?.ethereum;
    setHasProvider(Boolean(eth));
  }, []);

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

  async function connectWallet() {
    try {
      if (!window?.ethereum) {
        showError("No Ethereum provider detected. Please install Wallet Extension.");
        return;
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        showError("No account returned. Please unlock your wallet.");
        return;
      }

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Connected account:", selectedAccount);
      console.log("Signer:", signer);

      // Optional success toast
      showSuccess("Wallet connected");

      // Keep UI in sync with wallet events
      window.ethereum.removeAllListeners?.("accountsChanged");
      window.ethereum.removeAllListeners?.("chainChanged");

      window.ethereum.on?.("accountsChanged", (...args: unknown[]) => {
        const accs = (args?.[0] as string[]) ?? [];
        const next = accs[0] ?? null;
        setAccount(next);
        if (!next) showInfo("No account selected.");
      });

      window.ethereum.on?.("chainChanged", () => {
        // Reload to ensure provider/signer reflect the new chain
        window.location.reload();
      });
    } catch (err: unknown) {
      const code = (err as { code?: unknown })?.code;
      if (
        code === 4001 ||
        (err instanceof Error && err.message === "User rejected request")
      ) {
          console.error("Connection request rejected:", err);
          showError("Connection request rejected. Please try again.");
        return;
      }
      console.error("Failed to connect wallet:", err);
      showError(`Failed to connect wallet. Please try again.`);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      {/* Main Card */}
      <Auth.AuthCard title="Get Started">
        {/* Wallet provider notice + Connect Wallet Button */}
        {!hasProvider && (
          <div className="mb-4 rounded-lg border border-yellow-600 bg-yellow-900/30 text-yellow-200 p-3 text-sm">
            No Ethereum wallet detected. Install MetaMask to continue.
            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://metamask.io/download/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="ml-2 inline-flex items-center rounded-md bg-yellow-600 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-yellow-500 transition"
            >
              Install MetaMask
            </button>
          </div>
        )}
        <button
          onClick={connectWallet}
          disabled={!hasProvider}
          className="group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <FontAwesomeIcon icon={faWallet} className="opacity-90" />
          <span>Connect Wallet</span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="opacity-0 -translate-x-2 group-hover:opacity-90 group-hover:translate-x-0 transition-all"
          />
        </button>
        {account && (
          <div className="-mt-4 mb-6 text-xs text-gray-300 truncate max-w-full">
            Connected: {account}
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
