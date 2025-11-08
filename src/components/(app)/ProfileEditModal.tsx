"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toastSuccess, toastError } from "@/utils/index.utils";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: any;
  onProfileUpdate: () => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  userInfo,
  onProfileUpdate,
}: ProfileEditModalProps) {
  const [loadingAvatar, setLoadingAvatar] = useState({
    loading: false,
    new: false,
  });

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
    display_name: userInfo?.display_name,
    bio: userInfo?.bio,
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
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
    try {
      const apiResponse = await fetch("/api/users/profile-change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          current: updateUserInfo,
          original: {
            avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
            display_name: userInfo?.display_name,
            bio: userInfo?.bio,
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
        onProfileUpdate();
        setUpdateUserInfo({
          avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
          display_name: userInfo?.display_name,
          bio: userInfo?.bio,
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
      avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
      display_name: userInfo?.display_name,
      bio: userInfo?.bio,
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
                        userInfo?.avatar_ipfs_hash
                          ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
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
              <Button
                className="border border-(--input) bg-(--background) shadow-sm hover:bg-(--accent) hover:text-(--accent-foreground)"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-(--primary) text-(--primary-foreground) shadow hover:opacity-90"
                onClick={handleUpdateProfile}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
