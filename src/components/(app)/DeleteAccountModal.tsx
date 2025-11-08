"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastSuccess, toastError } from "@/utils/index.utils";

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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/deactivate", {
        method: "DELETE",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
  };

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
          <Button
            className="border border-(--input) bg-(--background) shadow-sm hover:bg-(--accent) hover:text-(--accent-foreground)"
            onClick={onClose}
          >
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
