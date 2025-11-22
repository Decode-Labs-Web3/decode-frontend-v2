"use client";

import { useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
}: ProfileEditModalProps) {
  const { user, updateUserDetail } = useUser();
  const { fingerprintHash } = useFingerprint();
  const [loadingAvatar, setLoadingAvatar] = useState({
    loading: false,
    new: false,
  });

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avatar_ipfs_hash: user?.avatar_ipfs_hash,
    display_name: user?.display_name,
    bio: user?.bio,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUserInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateUserInfo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoadingAvatar((prev) => ({
      ...prev,
      loading: true,
    }));
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError("Please select a valid image file");
      event.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiResponse = await fetch("/api/users/avatar", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash),
        body: formData,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      if (!apiResponse.ok) {
        console.error("Avatar upload failed:", apiResponse);
        toastError("Avatar upload failed");
        return;
      }

      const response = await apiResponse.json();

      setUpdateUserInfo((prev) => ({
        ...prev,
        avatar_ipfs_hash: response.ipfsHash,
      }));

      toastSuccess("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload request error:", error);
      toastError("Avatar upload failed. Please try again.");
      return;
    } finally {
      setLoadingAvatar({
        new: true,
        loading: false,
      });
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const avatarHash = (updateUserInfo.avatar_ipfs_hash ?? "")
      .toString()
      .trim();
    const displayName = (updateUserInfo.display_name ?? "").toString().trim();
    const bio = (updateUserInfo.bio ?? "").toString().trim();

    if (avatarHash === "" || displayName === "" || bio === "") {
      toastError("All fields are required");
      return;
    }

    const pattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!pattern.test(displayName)) {
      toastError(
        "Display name contains invalid characters. Only letters, numbers, whitespace, '-' and '_' are allowed."
      );
      return;
    }

    if (!pattern.test(bio)) {
      toastError(
        "Bio contains invalid characters. Only letters, numbers, whitespace, '-' and '_' are allowed."
      );
      return;
    }
    try {
      const apiResponse = await fetch("/api/users/profile-change", {
        method: "PUT",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          current: updateUserInfo,
          original: {
            avatar_ipfs_hash: user?.avatar_ipfs_hash,
            display_name: user?.display_name,
            bio: user?.bio,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      if (!apiResponse.ok) {
        console.error("Profile update failed:", apiResponse);
        toastError("Update failed");
        return;
      }
      const response = await apiResponse.json();

      if (
        response.statusCode === 200 &&
        response.message === "Profile updated"
      ) {
        toastSuccess(response.message || "Profile updated");
        onClose();
        updateUserDetail(
          updateUserInfo.avatar_ipfs_hash,
          updateUserInfo.display_name,
          updateUserInfo.bio
        );
        setUpdateUserInfo({
          avatar_ipfs_hash: user?.avatar_ipfs_hash,
          display_name: user?.display_name,
          bio: user?.bio,
        });
      }

      if (
        response.statusCode === 207 &&
        response.message === "Partial update"
      ) {
        toastError(response.message || "Partial failed");
      }
    } catch (error) {
      console.error("Profile update request error:", error);
      toastError("Update failed. Please try again.");
      return;
    }
  };

  const handleClose = () => {
    onClose();
    setUpdateUserInfo({
      avatar_ipfs_hash: user?.avatar_ipfs_hash,
      display_name: user?.display_name,
      bio: user?.bio,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Change Account Information</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row gap-4 items-start">
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            className="w-28 h-28 rounded-xl border-2 border-(--border) overflow-hidden relative cursor-pointer group flex items-center justify-center hover-card"
            aria-label="Change avatar"
            title="Click to change avatar"
          >
            {loadingAvatar.loading ? (
              <div className="text-sm text-(--muted-foreground)">
                Loading...
              </div>
            ) : (
              <>
                {loadingAvatar.new ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={
                        updateUserInfo.avatar_ipfs_hash
                          ? `https://ipfs.de-id.xyz/ipfs/${updateUserInfo.avatar_ipfs_hash}`
                          : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt="Avatar"
                    />
                    <AvatarFallback>Avatar</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={
                        user?.avatar_ipfs_hash
                          ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                          : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt="Avatar"
                    />
                    <AvatarFallback>Avatar</AvatarFallback>
                  </Avatar>
                )}
              </>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors grid place-items-center text-white text-sm font-medium">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                Click to upload
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="flex flex-col flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={updateUserInfo.display_name}
                onChange={handleUserInfoChange}
                placeholder="Enter your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                name="bio"
                value={updateUserInfo.bio}
                onChange={handleUserInfoChange}
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex flex-row justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
