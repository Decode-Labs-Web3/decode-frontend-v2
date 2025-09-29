"use client";

import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { ethers } from "ethers";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";
import { useCallback, useContext, useEffect, useState } from "react";
import { toastError, toastSuccess, toastInfo } from "@/utils/index.utils";

interface AllWallets {
  id: string;
  address: string;
  user_id: string;
  name_service: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function WalletsPage() {
  const userContext = useContext(UserInfoContext);
  const user = userContext?.user;
  const refetchUserData = userContext?.refetchUserData;

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [allWallets, setAllWallets] = useState<AllWallets[]>([]);

  const handleGetAllWallets = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/wallet/all-wallet", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        console.error("Get all wallets error:", error);
        toastError(error.message || `HTTP ${apiResponse.status}`);
        return;
      }
      const response = await apiResponse.json();
      console.log("all wallets data:", response);
      setAllWallets(response.data);
      toastSuccess("Wallets fetched successfully");
    } catch (error) {
      console.error("Get all wallets error:", error);
      toastError(
        error instanceof Error ? error.message : "Get all wallets failed"
      );
    }
  }, []);

  useEffect(() => {
    handleGetAllWallets();
  }, [handleGetAllWallets]);

  const handleAddWallet = useCallback(async () => {
    try {
      await open();

      await new Promise((r) => setTimeout(r, 100));

      if (!isConnected || !walletProvider || !address) {
        toastInfo("Connect cancelled.");
        return;
      }

      const challengeRes = await fetch("/api/wallet/link-challenge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!challengeRes.ok) throw new Error(`HTTP ${challengeRes.status}`);
      const challengeJson = await challengeRes.json();
      const messageToSign =
        challengeJson?.data?.nonceMessage || challengeJson?.data?.message;
      if (!messageToSign) throw new Error("Missing link nonce message");

      const provider = new ethers.BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);

      const verifyRes = await fetch("/api/wallet/link-validation", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status}`);
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success)
        throw new Error(verifyJson.message || "Link failed");

      try {
        // Ensure the AppKit modal is closed before navigating
        close?.();
      } catch (error) {
        console.error("Close modal error:", error);
      }
      if (refetchUserData) {
        await refetchUserData();
      }
      handleGetAllWallets();
      toastSuccess("Wallet linked successfully");
    } catch (error: unknown) {
      // Handle user rejection (code 4001) or ACTION_REJECTED
      if (
        (error as { code?: number })?.code === 4001 ||
        (error as { reason?: string })?.reason === "rejected" ||
        (error as { action?: string })?.action === "signMessage"
      ) {
        toastInfo("Signature request was cancelled.");
        return;
      }
      console.error("Add wallet error:", error);
      toastError(error instanceof Error ? error.message : "Add wallet failed");
    }
  }, []);

  const handleAddPrimaryWallet = useCallback(async () => {
    try {
      await open();

      await new Promise((r) => setTimeout(r, 100));

      if (!isConnected || !walletProvider || !address) {
        toastInfo("Connect cancelled.");
        return;
      }

      const challengeRes = await fetch("/api/wallet/primary-challenge", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!challengeRes.ok) throw new Error(`HTTP ${challengeRes.status}`);
      const challengeJson = await challengeRes.json();
      const messageToSign =
        challengeJson?.data?.nonceMessage || challengeJson?.data?.message;
      if (!messageToSign) throw new Error("Missing link nonce message");

      const provider = new ethers.BrowserProvider(
        walletProvider as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);

      const verifyRes = await fetch("/api/wallet/primary-validation", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status}`);
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success)
        throw new Error(verifyJson.message || "Link failed");

      try {
        // Ensure the AppKit modal is closed before navigating
        close?.();
      } catch (error) {
        console.error("Close modal error:", error);
      }
      if (refetchUserData) {
        await refetchUserData();
      }
      handleGetAllWallets();
      toastSuccess("Wallet linked successfully");
    } catch (error: unknown) {
      // Handle user rejection (code 4001) or ACTION_REJECTED
      if (
        (error as { code?: number })?.code === 4001 ||
        (error as { reason?: string })?.reason === "rejected" ||
        (error as { action?: string })?.action === "signMessage"
      ) {
        toastInfo("Signature request was cancelled.");
        return;
      }
      console.error("Add wallet error:", error);
      toastError(error instanceof Error ? error.message : "Add wallet failed");
    }
  }, []);

  const handleRemoveWallet = useCallback(async (address: string) => {
    try {
      const apiResponse = await fetch("/api/wallet/unlink-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      // console.log("Remove wallet response:", response);
      if (!apiResponse.ok){
        console.log("Remove wallet error:", response);
        toastError(response.message || "Remove wallet failed");
        return;
      }
      handleGetAllWallets();
      toastSuccess("Wallet removed successfully");
    } catch (error) {
      console.error("Remove wallet error:", error);
      toastError(error instanceof Error ? error.message : "Remove wallet failed");
    }
  }, []);

  return (
    <div className="flex items-start flex-col gap-2">

      {allWallets.length > 0 && !user?.primary_wallet?.is_primary && !user?.primary_wallet?.address && (
        <div className="flex items-start flex-col gap-2">
          <button
            onClick={handleAddPrimaryWallet}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add primary wallet
          </button>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Please add your primary wallet to your account to activate more
            features.
          </p>
        </div>
      )}

      {user?.primary_wallet?.address && (
        <div className="flex items-start flex-col gap-2">
          <h1 className="text-sm text-[color:var(--muted-foreground)]">
            Primary wallet: {user?.primary_wallet?.address}
          </h1>
        </div>
      )}
      <button
        onClick={handleAddWallet}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} />
        Add wallets
      </button>
      {allWallets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">
            All Wallets
          </h3>
          <ul className="space-y-2">
            {allWallets.map((wallet) => {
              if (wallet.address !== user?.primary_wallet?.address) {
                return (
                  <div
                    key={wallet.id || wallet.address}
                    className="flex items-center gap-2 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg px-3 py-2"
                  >
                    <h1 className="text-[color:var(--foreground)]">
                      {wallet.address || "-"}
                    </h1>
                    <button
                      onClick={() => handleRemoveWallet(wallet.address)}
                      className="text-sm text-red-600 dark:text-red-400 hover:opacity-80 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              }
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
