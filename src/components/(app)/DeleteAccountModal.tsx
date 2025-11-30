"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const handleDeleteAccount = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const apiResponse = await fetch("/api/users/deactivate", {
          method: "DELETE",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        const response = await apiResponse.json();
        if (response.success) {
          toastSuccess(
            "Account deactivated successfully, it will be permanently deleted after 1 month"
          );
          onClose();
          router.refresh();
        } else {
          toastError(response.message || "Account deactivation failed");
        }
      } catch (error) {
        console.error("Account deactivation request error:", error);
        toastError("Account deactivation failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [fingerprintHash, onClose, router]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm account deactivation</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate your account? Account
            deactivated successfully, it will be permanently deleted after 1
            month.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-(--destructive) text-(--destructive-foreground) shadow-sm hover:opacity-90"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
