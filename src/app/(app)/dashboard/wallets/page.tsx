"use client";

import { ethers } from "ethers";
import { useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toastError, toastSuccess, toastInfo } from "@/utils/index.utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";

export default function WalletsPage() {
  const { open, close } = useAppKit();
  const { fingerprintHash } = useFingerprint();
  const { user, addWalletUser, removeWalletUser, setPrimaryWallet } = useUser();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ address }),
        credentials: "include",
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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ address, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status}`);
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success)
        throw new Error(verifyJson.message || "Link failed");

      try {
        close?.();
      } catch (error) {
        console.error("Close modal error:", error);
      }
      addWalletUser(verifyJson.data);
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
  }, [
    open,
    close,
    fingerprintHash,
    isConnected,
    walletProvider,
    address,
    addWalletUser,
  ]);

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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ address, signature }),
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status}`);
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success)
        throw new Error(verifyJson.message || "Link failed");

      try {
        close?.();
      } catch (error) {
        console.error("Close modal error:", error);
      }
      setPrimaryWallet(verifyJson.data);
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
  }, [
    open,
    close,
    fingerprintHash,
    isConnected,
    walletProvider,
    address,
    setPrimaryWallet,
  ]);

  const handleRemoveWallet = useCallback(
    async (address: string) => {
      try {
        const apiResponse = await fetch("/api/wallet/unlink-wallet", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          credentials: "include",
          body: JSON.stringify({ address }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        const response = await apiResponse.json();
        if (!apiResponse.ok) {
          console.log("Remove wallet error:", response);
          toastError(response.message || "Remove wallet failed");
          return;
        }
        removeWalletUser(address);
        toastSuccess("Wallet removed successfully");
      } catch (error) {
        console.error("Remove wallet error:", error);
        toastError(
          error instanceof Error ? error.message : "Remove wallet failed"
        );
      }
    },
    [fingerprintHash, removeWalletUser]
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">Wallets</h2>
          <p className="text-sm text-(--muted-foreground)">
            Link multiple wallets and set a primary wallet for your account.
          </p>
        </div>
        <Button onClick={handleAddWallet} className="gap-2">
          <FontAwesomeIcon icon={faPlus} />
          Add wallets
        </Button>
      </div>

      {(user.wallets?.length ?? 0) > 0 &&
        !user?.primary_wallet?.is_primary &&
        !user?.primary_wallet?.address && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">No primary wallet set</p>
                  <p className="text-sm text-(--muted-foreground)">
                    Add your primary wallet to unlock more features.
                  </p>
                </div>
                <Button onClick={handleAddPrimaryWallet} className="gap-2">
                  <FontAwesomeIcon icon={faPlus} />
                  Add primary wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {user?.primary_wallet?.address && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <Badge
                  variant="secondary"
                  className="w-fit text-xs uppercase tracking-wide"
                >
                  Primary wallet
                </Badge>
                <h1 className="text-sm font-medium truncate max-w-[70vw] md:max-w-[40vw]">
                  {user?.primary_wallet?.address}
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(user.wallets?.length ?? 0) > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All wallets</CardTitle>
              <Badge variant="outline">{user.wallets?.length ?? 0}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(user.wallets ?? []).map((wallet) => {
                if (wallet.address !== user?.primary_wallet?.address) {
                  return (
                    <div
                      key={wallet._id}
                      className="group flex items-center justify-between gap-3 rounded-md border bg-(--background) px-3 py-2 hover:bg-(--accent) transition-colors"
                    >
                      <span className="font-mono text-sm truncate">
                        {wallet.address || "-"}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveWallet(wallet.address)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-sm text-(--muted-foreground)">
              No wallets linked yet. Click
              <Badge variant="outline" className="mx-1 gap-1">
                <FontAwesomeIcon icon={faPlus} />
                Add wallets
              </Badge>
              to link your first wallet.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
