"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";

export default function PersonalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};
  const [modal, setModal] = useState({
    edit: false,
    delete: false,
  });

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avartar_ipfs_hash: userInfo?.avatar_ipfs_hash || "",
    display_name: userInfo?.display_name || "",
    bio: userInfo?.bio || "",
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
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError("Please select a valid image file");
      event.target.value = "";
      return;
    }
    setLoading(true);

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
        avartar_ipfs_hash: response.ipfsHash,
      }));
      toastSuccess("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload request error:", error);
      toastError("Avatar upload failed. Please try again.");
      return;
    } finally {
      setLoading(false);
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
            avatar_ipfs_hash: userInfo?.avatar_ipfs_hash || "",
            display_name: userInfo?.display_name || "",
            bio: userInfo?.bio || "",
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
        }
      } else if (response.success) {
        toastSuccess("Profile updated successfully");
        fetchUserInfo?.();
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

  return (
    <>
      {userInfo && (
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] backdrop-blur-sm p-8 mb-8 shadow-2xl hover-card">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-[color:var(--foreground)]">
                Profile Information
              </h3>
              <p className="font-mono text-sm text-[color:var(--muted-foreground)]">
                User ID: {userInfo._id}
              </p>
            </div>
            <button
              onClick={() =>
                setModal((prev) => ({
                  ...prev,
                  edit: true,
                }))
              }
            >
              <FontAwesomeIcon icon={faPen} /> Edit
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-50 h-50 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-[color:var(--border)] overflow-hidden shadow-xl">
                <Image
                  src={
                    userInfo?.avatar_ipfs_hash
                      ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
                      : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-[color:var(--foreground)]">
                    {userInfo.display_name || userInfo.username || "Your name"}
                  </h2>
                  {userInfo.role && (
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-600/80 dark:text-blue-300 text-sm font-medium border border-blue-500/20">
                      {userInfo.role.charAt(0).toUpperCase() +
                        userInfo.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="pt-6 border-t border-[color:var(--border)]">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-[color:var(--foreground)]">
                    About me
                  </h4>
                  <div className="bg-[color:var(--surface)] rounded-xl p-4 border border-[color:var(--border)] hover-card">
                    <p className="leading-relaxed text-[color:var(--foreground)]/90">
                      {userInfo.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal.edit && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({
                ...prev,
                edit: false,
              }));
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl">
            <div className="px-5 py-4 border-b border-[color:var(--border)]">
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                Change Account Information
              </h3>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              className="w-50 h-50 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-[color:var(--border)] overflow-hidden shadow-xl relative cursor-pointer group"
              aria-label="Change avatar"
              title="Click to change avatar"
            >
              <Image
                src={
                  userInfo?.avatar_ipfs_hash
                    ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
                    : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                }
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors grid place-items-center text-white text-sm font-medium">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
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

            <label htmlFor="display_name">Change Display Name</label>
            <input
              id="display_name"
              name="display_name"
              value={updateUserInfo.display_name}
              onChange={handleUserInfoChange}
              placeholder="Change Display Name"
            />
            <label htmlFor="bio">Change Bio</label>
            <input
              id="bio"
              name="bio"
              value={updateUserInfo.bio}
              onChange={handleUserInfoChange}
              placeholder="Change Bio"
            />
            <button
              type="button"
              onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
              className="px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)] text-sm hover:bg-[color:var(--surface)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateProfile}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
      {userInfo?._id && <SnapshotChart userId={userInfo?._id} />}
      <button
        onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
        className="bg-red-500 rounded-xl w-full hover-card text-white py-2 mt-4 disabled:opacity-50"
      >
        Delete Account
      </button>{" "}
      {modal.delete && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({
                ...prev,
                delete: false,
              }));
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setModal((prev) => ({ ...prev, delete: false }))}
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
                onClick={() => setModal((prev) => ({ ...prev, delete: false }))}
                className="px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)] text-sm hover:bg-[color:var(--surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
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
