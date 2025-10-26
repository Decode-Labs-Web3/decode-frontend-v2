"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PersonalPage() {
  const router = useRouter();
  const [loadingAvatar, setLoadingAvartar] = useState({
    loading: false,
    new: false,
  });
  const [loading, setLoading] = useState(false);
  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};
  const [modal, setModal] = useState({
    edit: false,
    email: false,
    delete: false,
  });

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
    display_name: userInfo?.display_name,
    bio: userInfo?.bio,
  });

  const [emailChange, setEmailChange] = useState({
    old_code: "",
    new_email: "",
    new_code: "",
  });

  const [emailStep, setEmailStep] = useState({
    old_code: true,
    new_email: false,
    new_code: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUserInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateUserInfo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvartarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoadingAvartar((prev) => ({
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
      console.log(
        "dwdgeubdwujdbwjedbwejdhwejdwedwed",
        updateUserInfo.avatar_ipfs_hash
      );

      console.log("this is ipfs response hwduewbdjwedbwebdhwejdhwe", response);

      setUpdateUserInfo((prev) => ({
        ...prev,
        avatar_ipfs_hash: response.ipfsHash,
      }));

      console.log(
        "dwdgeubdwujdbwjedbwejdhwejdwedwed",
        updateUserInfo.avatar_ipfs_hash
      );

      toastSuccess("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload request error:", error);
      toastError("Avatar upload failed. Please try again.");
      return;
    } finally {
      setLoadingAvartar({
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
        setModal((prev) => ({
          ...prev,
          edit: false,
        }));
        fetchUserInfo?.();
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
        setModal((prev) => ({ ...prev, delete: false }));
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

  if (loading) {
    return <h1>Loading ....</h1>;
  }

  const handleSendCodeOldEmail = async () => {
    try {
      const apiResponse = await fetch("/api/email/old-email", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.success && response.message === "Email verification sent") {
        setModal((prev) => ({ ...prev, email: true }));
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailChange((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleVerifyCodeOldEmail = async (code: string) => {
    try {
      const apiResponse = await fetch("/api/email/old-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.success &&
        response.message === "Email change code verified"
      ) {
        setEmailStep((prev) => ({ ...prev, old_code: false, new_email: true }));
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleSendCodeNewEmail = async (email: string) => {
    try {
      const apiResponse = await fetch("/api/email/new-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ email, code: emailChange.old_code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.success &&
        response.message === "New email change initiated successfully"
      ) {
        setEmailStep((prev) => ({ ...prev, new_code: true, new_email: false }));
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  const handleVerifyCodeNewEmail = async (code: string) => {
    try {
      const apiResponse = await fetch("/api/email/new-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error("Send old email code API error:", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.success && response.message === "Email verification sent") {
        setEmailStep((prev) => ({ ...prev, new_code: false, old_code: true }));
        setEmailChange({ old_code: "", new_email: "", new_code: "" });
        setModal((prev) => ({ ...prev, email: false }));
        fetchUserInfo?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Handle send old email code failed");
    }
  };

  return (
    <>
      {userInfo && (
        <Card className="relative overflow-hidden mb-8 shadow-2xl hover-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg mb-1">
                  Profile Information
                </CardTitle>
                <p className="font-mono text-sm text-[var(--muted-foreground)]">
                  User ID: {userInfo._id}
                </p>
              </div>
              <Button
                className="border border-[var(--input)] bg-[var(--background)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                size="sm"
                onClick={() =>
                  setModal((prev) => ({
                    ...prev,
                    edit: true,
                  }))
                }
              >
                <FontAwesomeIcon icon={faPen} className="mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* avatar */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 rounded-2xl border-2 border-[var(--border)] overflow-hidden shadow-xl">
                  <AvatarImage
                    src={
                      userInfo?.avatar_ipfs_hash
                        ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt="Avatar"
                    className="object-contain"
                  />
                  <AvatarFallback>Avatar</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">
                      {userInfo.display_name ||
                        userInfo.username ||
                        "Your name"}
                    </h2>
                    {userInfo.role && (
                      <Badge className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                        {userInfo.role.charAt(0).toUpperCase() +
                          userInfo.role.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">About me</h4>
                    <Card className="hover-card">
                      <CardContent className="p-4">
                        <p className="leading-relaxed">{userInfo.bio}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={modal.edit}
        onOpenChange={(open) => setModal((prev) => ({ ...prev, edit: open }))}
      >
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
              className="w-28 h-28 rounded-xl border-2 border-[var(--border)] overflow-hidden relative cursor-pointer group flex items-center justify-center hover-card"
              aria-label="Change avatar"
              title="Click to change avatar"
            >
              {loadingAvatar.loading ? (
                <div className="text-sm text-[var(--muted-foreground)]">
                  Loading...
                </div>
              ) : (
                <>
                  {loadingAvatar.new ? (
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
                onChange={handleAvartarUpload}
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
                  className="border border-[var(--input)] bg-[var(--background)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                  onClick={() => {
                    setModal((prev) => ({ ...prev, edit: false }));
                    setUpdateUserInfo({
                      avatar_ipfs_hash: userInfo?.avatar_ipfs_hash,
                      display_name: userInfo?.display_name,
                      bio: userInfo?.bio,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:opacity-90"
                  onClick={handleUpdateProfile}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {userInfo?._id && <SnapshotChart userId={userInfo?._id} />}

      <Dialog
        open={modal.delete}
        onOpenChange={(open) => setModal((prev) => ({ ...prev, delete: open }))}
      >
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
              className="border border-[var(--input)] bg-[var(--background)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
              onClick={() => setModal((prev) => ({ ...prev, delete: false }))}
            >
              Cancel
            </Button>
            <Button
              className="bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:opacity-90"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        className="w-full mt-4 bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:opacity-90"
        onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
      >
        Delete Account
      </Button>

      <Dialog
        open={modal.email}
        onOpenChange={(open) => setModal((prev) => ({ ...prev, email: open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Update your email address associated with your account.
            </DialogDescription>
          </DialogHeader>

          {emailStep.old_code && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old_code">Verify code</Label>
                <Input
                  id="old_code"
                  type="email"
                  placeholder="decodenetwork@gmail.com"
                  value={emailChange.old_code}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)]"
                  onClick={() => handleVerifyCodeOldEmail(emailChange.old_code)}
                >
                  Send Code To New Email
                </Button>
              </div>
            </div>
          )}

          {emailStep.new_email && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_email">New Email</Label>
                <Input
                  id="new_email"
                  type="email"
                  placeholder="decodenetwork@gmail.com"
                  value={emailChange.new_email}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() =>
                    setEmailStep((prev) => ({
                      ...prev,
                      old_code: true,
                      new_email: false,
                    }))
                  }
                >
                  Back
                </Button>
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)]"
                  onClick={() => handleSendCodeNewEmail(emailChange.new_email)}
                >
                  Send Code To New Email
                </Button>
              </div>
            </div>
          )}

          {emailChange.new_code && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_code">Verify New Email</Label>
                <Input
                  id="new_code"
                  type="email"
                  placeholder="decodenetwork@gmail.com"
                  value={emailChange.new_code}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() =>
                    setEmailStep((prev) => ({
                      ...prev,
                      new_code: false,
                      new_email: true,
                    }))
                  }
                >
                 Back
                </Button>
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)]"
                  onClick={() => handleVerifyCodeNewEmail(emailChange.new_code)}
                >
                 Complete Email Change
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button
        className="w-full mt-4 bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:opacity-90"
        onClick={handleSendCodeOldEmail}
      >
        Change Email
      </Button>
    </>
  );
}
