"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";
import {
  faEnvelope,
  faCamera,
  faPen,
  faXmark,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function PersonalPage() {
  const router = useRouter();
  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    avatar_ipfs_hash: "",
    display_name: "",
    bio: "",
  });

  const [accountForm, setAccountForm] = useState({
    username: "",
    username_code: "",
    email: "",
    email_code: "",
  });

  const [editSection, setEditSection] = useState<
    "profile" | "username" | "email" | "none"
  >("none");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update form when user context changes
  useEffect(() => {
    if (userInfo) {
      const userForm = {
        username: userInfo.username || "",
        email: userInfo.email || "",
        avatar_ipfs_hash: userInfo.avatar_ipfs_hash || "",
        display_name: userInfo.display_name || "",
        bio: userInfo.bio || "",
      };

      setProfileForm({
        avatar_ipfs_hash: userForm.avatar_ipfs_hash,
        display_name: userForm.display_name,
        bio: userForm.bio,
      });

      setAccountForm((prevAccountForm) => ({
        ...prevAccountForm,
        username: userForm.username,
        email: userForm.email,
      }));
    }
  }, [userInfo]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError("Please select a valid image file");
      e.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    const uploadAvatar = async () => {
      const formData = new FormData();
      formData.append("file", file);

      let apiResponse: {
        success: boolean;
        message?: string;
        avatar_url?: string;
        ipfsHash?: string;
      };
      try {
        const response = await fetch("/api/users/avatar", {
          method: "POST",
          headers: {
            "X-Frontend-Internal-Request": "true",
          },
          body: formData,
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
        });

        apiResponse = await response.json();

        if (!response.ok) {
          console.error("Avatar upload failed:", apiResponse);
          toastError(apiResponse?.message || "Avatar upload failed");
          return;
        }
        toastSuccess("Avatar uploaded successfully");
      } catch (error) {
        console.error("Avatar upload request error:", error);
        toastError("Avatar upload failed. Please try again.");
        return;
      }

      setProfileForm((prevProfileForm) => ({
        ...prevProfileForm,
        avatar_ipfs_hash: apiResponse?.ipfsHash || "",
      }));

      console.log(
        "form.avatar_ipfs_hash from handleUploadAvatar after apiResponse",
        profileForm.avatar_ipfs_hash
      );
    };

    try {
      await uploadAvatar();
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangeProfile = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileForm((prevProfileForm) => ({
      ...prevProfileForm,
      [event.target.id]: event.target.value,
    }));
  };

  const handleSubmitProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    const updateProfile = async () => {
      try {
        const apiResponse = await fetch("/api/users/profile-change", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({
            current: profileForm,
            original: {
              avatar_ipfs_hash: userInfo?.avatar_ipfs_hash || "",
              display_name: userInfo?.display_name || "",
              bio: userInfo?.bio || "",
            },
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
        });

        const response = await apiResponse.json();

        if (!response.success) {
          console.error("Profile update failed:", response);
          toastError(response?.message || "Update failed");
          return;
        }

        if (response.data?.results) {
          let hasErrors = false;
          let hasSuccess = false;

          Object.entries(response.data.results).forEach(([field, result]) => {
            const typedResult = result as { success: boolean; message: string };
            if (typedResult.success) {
              hasSuccess = true;
              const fieldName = field
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              toastSuccess(`${fieldName} updated successfully`);
            } else {
              hasErrors = true;
              const fieldName = field
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              toastError(
                `${fieldName} update failed: ${
                  typedResult.message || "Unknown error"
                }`
              );
            }
          });

          if (hasSuccess && !hasErrors) {
            fetchUserInfo?.();
            setEditSection("none");
          }
        } else if (response.success) {
          toastSuccess("Profile updated successfully");
          fetchUserInfo?.();
          setEditSection("none");
        }
      } catch (error) {
        console.error("Profile update request error:", error);
        toastError("Update failed. Please try again.");
        return;
      }
    };

    await updateProfile();
  };

  const handleChangeProfileFrom = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    setAccountForm((prevAccountForm) => ({
      ...prevAccountForm,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmitUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(false);
    // const updateUsername = async () => {
    //   const apiResponse = await fetch("/api/users/username-change", {
    //     method: "GET",
    //     headers: {
    //       "X-Frontend-Internal-Request": "true",
    //     },
    //     cache: "no-store",
    //     signal: AbortSignal.timeout(20000),
    //   });

    //   const response = await apiResponse.json();

    //   if (response.success && response.message === "Email verification sent") {
    //     setLoading(true);
    //   } else {
    //     setLoading(false);
    //     toastError(response.message || "Username update failed");
    //   }
    // };
    // await updateUsername();
    console.log(accountForm);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(accountForm);
  };

  const handleSendUsernameCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiResponse = await fetch("/api/users/username-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(accountForm),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      const response = await apiResponse.json();
      if (
        response.success &&
        response.message === "Username changed successfully"
      ) {
        fetchUserInfo?.();
        toastSuccess(response.message || "Username code sent successfully");
      } else {
        toastError(response.message || "Username code send failed");
      }
    } catch (error) {
      console.error("Username code send request error:", error);
      toastError("Username code send failed. Please try again.");
    } finally {
      setLoading(false);
      setEditSection("none");
    }
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.refresh();
      } else {
        toastError(response.message || "Account deactivation failed");
      }
    } catch (error) {
      console.error("Account deactivation request error:", error);
      toastError("Account deactivation failed. Please try again.");
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] backdrop-blur-sm p-8 mb-8 shadow-2xl hover-card">
        {/*
        <div className="border p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">profile</h3>
            <button className="px-3 py-1.5 text-sm border rounded">edit</button>
          </div>
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="text-lg font-medium">display name</div>
              <div className="text-sm text-muted-foreground">bio...</div>
            </div>
          </div>
        </div>
        */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-1">
              Profile Information
            </h3>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Manage your personal details and appearance
            </p>
          </div>
          {editSection !== "profile" ? (
            <button
              type="button"
              onClick={() => setEditSection("profile")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FontAwesomeIcon icon={faPen} className="text-sm" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditSection("none")}
                disabled={false}
                className="bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)] disabled:opacity-50 text-[color:var(--foreground)] px-6 py-2.5 rounded-xl font-medium transition-all duration-200 border border-[color:var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitProfile}
                disabled={false}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FontAwesomeIcon icon={faCheck} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative group">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-[color:var(--border)] overflow-hidden shadow-xl hover-card">
                <Image
                  src={
                    profileForm.avatar_ipfs_hash
                      ? `http://35.247.142.76:8080/ipfs/${profileForm.avatar_ipfs_hash}`
                      : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                {uploadingAvatar && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-12 h-12 text-[color:var(--muted-foreground)] mx-auto mb-4 animate-spin"
                  />
                )}
              </div>
              {editSection === "profile" && (
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center"
                >
                  <div className="bg-white/70 dark:bg-white/20 text-black dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium border border-[color:var(--border)]">
                    <FontAwesomeIcon icon={faCamera} />
                    Change Photo
                  </div>
                </button>
              )}
            </div>
            {/* Hidden file input for avatar selection */}
            {editSection === "profile" && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
              />
            )}
            {editSection === "profile" && (
              <p className="text-xs text-[color:var(--muted-foreground)] mt-3 text-center lg:text-left">
                Click to change avatar
              </p>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 space-y-6">
            {/* Display Name */}
            <div>
              {editSection !== "profile" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-[color:var(--foreground)]">
                      {profileForm.display_name || "Your name"}
                    </h2>
                    {userInfo?.role && (
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-600/80 dark:text-blue-300 text-sm font-medium border border-blue-500/20">
                        {userInfo.role
                          ? userInfo.role.charAt(0).toUpperCase() +
                            userInfo.role.slice(1)
                          : "User"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[color:var(--muted-foreground)]">
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    value={profileForm.display_name}
                    onChange={handleChangeProfile}
                    className="w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                    placeholder="Enter your display name"
                  />
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="pt-6 border-t border-[color:var(--border)]">
              {editSection !== "profile" ? (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-[color:var(--foreground)]">
                    About me
                  </h4>
                  <div className="bg-[color:var(--surface)] rounded-xl p-4 border border-[color:var(--border)] hover-card">
                    <p className="text-[color:var(--foreground)]/90 leading-relaxed">
                      {profileForm.bio ||
                        "No bio added yet. Click edit to add a short description about yourself."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[color:var(--muted-foreground)]">
                    About me
                  </label>
                  <textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={handleChangeProfile}
                    rows={4}
                    className="w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl px-4 py-3 text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {userInfo?._id && (
        <>
          <SnapshotChart userId={userInfo?._id} />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] h-full min-h-[240px] hover:bg-[color:var(--surface-muted)] transition shadow-sm hover-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)]">
            <div>
              <h3 className="font-semibold tracking-tight text-[color:var(--foreground)]">
                Username info
              </h3>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                Username
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditSection(editSection === "username" ? "none" : "username")
              }
              className="text-xs bg-[color:var(--surface-muted)] hover:bg-[color:var(--surface)] border border-[color:var(--border)] px-3 py-1.5 rounded-full flex items-center gap-1 text-[color:var(--foreground)]"
            >
              <FontAwesomeIcon
                icon={editSection === "username" ? faXmark : faPen}
              />
              {editSection === "username" ? "Close" : "Edit"}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== "username" ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Username
                  </p>
                  <p className="text-[color:var(--foreground)] font-medium">
                    {accountForm.username || "-"}
                  </p>
                </div>
              </div>
            ) : !loading ? (
              <form onSubmit={handleSubmitUsername} className="space-y-4">
                <div>
                  <label className="text-sm text-[color:var(--muted-foreground)]">
                    {" "}
                    Enter username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={accountForm.username}
                    onChange={handleChangeProfileFrom}
                    className="mt-1 w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg px-3 py-2 text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Your username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={false}
                    className="bg-blue-700 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendUsernameCode} className="space-y-4">
                <label className="text-sm text-[color:var(--muted-foreground)]">
                  Enter username code
                </label>
                <input
                  id="username"
                  type="hidden"
                  value={accountForm.username}
                />
                <input
                  id="username_code"
                  type="text"
                  value={accountForm.username_code}
                  onChange={handleChangeProfileFrom}
                  className="mt-1 w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg px-3 py-2 text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Your username code"
                />
                <button
                  type="submit"
                  disabled={false}
                  className="bg-blue-700 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Save
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] h-full min-h-[240px] hover:bg-[color:var(--surface-muted)] transition shadow-sm hover-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)]">
            <div>
              <h3 className="font-semibold tracking-tight text-[color:var(--foreground)]">
                Contact info
              </h3>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                Email address
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditSection(editSection === "email" ? "none" : "email")
              }
              className="text-xs bg-[color:var(--surface-muted)] hover:bg-[color:var(--surface)] border border-[color:var(--border)] px-3 py-1.5 rounded-full flex items-center gap-1 text-[color:var(--foreground)]"
            >
              <FontAwesomeIcon
                icon={editSection === "email" ? faXmark : faPen}
              />
              {editSection === "email" ? "Close" : "Edit"}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== "email" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center text-green-600 dark:text-green-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Email
                  </p>
                  <p className="text-[color:var(--foreground)] font-medium">
                    {accountForm.email || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div>
                  <label className="text-sm text-[color:var(--muted-foreground)]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={handleChangeProfileFrom}
                    className="mt-1 w-full bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg px-3 py-2 text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={false}
                    className="bg-blue-700 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsDeleteModalOpen(true)}
        className="bg-red-500 rounded-xl w-full hover-card text-white py-2 mt-4 disabled:opacity-50"
      >
        Delete Account
      </button>

      {isDeleteModalOpen && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsDeleteModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl">
            <div className="px-5 py-4 border-b border-[color:var(--border)]">
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                Confirm account deactivation
              </h3>
            </div>
            {/*
            <div className="p-4 border-b">
              <div className="text-sm">deactivate account?</div>
            </div>
            */}
            <div className="px-5 py-4 space-y-2">
              <p className="text-sm text-[color:var(--foreground)]">
                Are you sure you want to deactivate your account?
              </p>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Account deactivated successfully, it will be permanently deleted
                after 1 month.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-[color:var(--border)] flex items-center justify-end gap-3">
              {/*
              <div className="flex gap-2 p-4">
                <button className="px-3 py-1.5 border rounded">cancel</button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded">delete</button>
              </div>
              */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)] text-sm hover:bg-[color:var(--surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setIsDeleteModalOpen(false);
                  deleteAccount(e as unknown as React.FormEvent);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
