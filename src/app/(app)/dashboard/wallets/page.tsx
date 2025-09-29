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

      if (!challengeRes.ok) console.log("challengeRes:", challengeRes);
      const challengeJson = await challengeRes.json();
      const messageToSign =
        challengeJson?.data?.nonceMessage || challengeJson?.data?.message;
      if (!messageToSign) {
        toastError("Missing link nonce message");
        return;
      }

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
      if (!apiResponse.ok) {
        console.log("Remove wallet error:", response);
        toastError(response.message || "Remove wallet failed");
        return;
      }
      handleGetAllWallets();
      toastSuccess("Wallet removed successfully");
    } catch (error) {
      console.error("Remove wallet error:", error);
      toastError(
        error instanceof Error ? error.message : "Remove wallet failed"
      );
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
            Wallets
          </h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Link multiple wallets and set a primary wallet for your account.
          </p>
        </div>
        <button
          onClick={handleAddWallet}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add wallets
        </button>
      </div>

      {allWallets.length > 0 &&
        !user?.primary_wallet?.is_primary &&
        !user?.primary_wallet?.address && (
          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  No primary wallet set
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Add your primary wallet to unlock more features.
                </p>
              </div>
              <button
                onClick={handleAddPrimaryWallet}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add primary wallet
              </button>
            </div>
          </div>
        )}

      {user?.primary_wallet?.address && (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Primary wallet
              </p>
              <h1 className="text-sm font-medium text-[color:var(--foreground)] truncate max-w-[70vw] md:max-w-[40vw]">
                {user?.primary_wallet?.address}
              </h1>
            </div>
          </div>
        </div>
      )}

      {allWallets.length > 0 ? (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              All wallets
            </h3>
            <span className="text-xs rounded-md border border-[color:var(--border)] px-2 py-0.5 text-[color:var(--muted-foreground)]">
              {allWallets.length}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {allWallets.map((wallet) => {
              if (wallet.address !== user?.primary_wallet?.address) {
                return (
                  <li
                    key={wallet.id || wallet.address}
                    className="group flex items-center justify-between gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 hover:bg-[color:var(--surface)]"
                  >
                    <span className="text-[color:var(--foreground)] font-mono text-sm truncate">
                      {wallet.address || "-"}
                    </span>
                    <button
                      onClick={() => handleRemoveWallet(wallet.address)}
                      className="text-xs px-2 py-1 rounded-md border border-red-200/30 text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Remove
                    </button>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No wallets linked yet. Click
            <span className="mx-1 inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-0.5 text-[color:var(--foreground)]">
              <FontAwesomeIcon icon={faPlus} /> Add wallets
            </span>
            to link your first wallet.
          </p>
        </div>
      )}
    </div>
  );
}
