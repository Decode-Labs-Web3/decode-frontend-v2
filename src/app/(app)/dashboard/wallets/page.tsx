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
import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const handleGetAllWallets = async () => {
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
        if (response.data.length === 0) {
          setAllWallets([
            {
              id: "",
              address: "",
              user_id: "",
              name_service: "",
              is_primary: false,
              created_at: "",
              updated_at: "",
            },
          ]);
          toastInfo("No wallets found. Please add a wallet.");
        } else {
          setAllWallets(response.data);
          toastSuccess("Wallets fetched successfully");
        }
      } catch (error) {
        console.error("Get all wallets error:", error);
        toastError(
          error instanceof Error ? error.message : "Get all wallets failed"
        );
      }
    };
    handleGetAllWallets();
  }, []);

  const handleAddWallet = async () => {
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
  };

  const handleAddPrimaryWallet = async () => {
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
  };

  return (
    <div className="flex items-start flex-col gap-2">
      {allWallets.length > 0 && !user?.primary_wallet?.address && (
        <div className="flex items-start flex-col gap-2">
          <button
            onClick={handleAddPrimaryWallet}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add primary wallet
          </button>
          <p className="text-sm text-gray-400">
            Please add your primary wallet to your account to activate more
            features.
          </p>
        </div>
      )}
      {user?.primary_wallet?.address && (
        <div className="flex items-start flex-col gap-2">
          <h1 className="text-sm text-gray-400">
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
          <h3 className="text-lg font-semibold text-white mb-2">All Wallets</h3>
          <ul className="space-y-2">
            {allWallets.map((wallet) => {
              if (wallet.address !== user?.primary_wallet?.address) {
                return (
                  <div
                    key={wallet.id || wallet.address}
                    className="flex items-center gap-2"
                  >
                    <h1>{wallet.address || "-"}</h1>
                    <button className="text-sm text-gray-400 hover:text-red-500 transition-colors">
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
