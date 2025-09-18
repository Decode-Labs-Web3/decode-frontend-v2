"use client";

import Image from "next/image";
import App from "@/components/(app)";
import { UserInfoContext } from "@/contexts/UserInfoContext";
import { useState, useContext, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCamera,
  faPen,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useLoading } from "@/hooks/useLoading";
import { showSuccess, showError } from "@/utils/toast.utils";
import { apiCallWithTimeout } from "@/utils/api.utils";

export default function PersonalPage() {
  const userContext = useContext(UserInfoContext);
  const user = userContext?.user;
  const refetchUserData = userContext?.refetchUserData;
  const [form, setForm] = useState({
    avatar_ipfs_hash: "",
    display_name: "",
    bio: "",
  });

  const [originalForm, setOriginalForm] = useState({
    avatar_ipfs_hash: "",
    display_name: "",
    bio: "",
  });

  const [username] = useState(user?.username || "");
  const [email] = useState(user?.email || "");
  const { loading: saving, withLoading } = useLoading();
  const [editSection, setEditSection] = useState<
    "profile" | "username" | "email" | "none"
  >("none");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update form when user context changes
  useEffect(() => {
    if (user) {
      const userForm = {
        avatar_ipfs_hash: user.avatar_ipfs_hash || "",
        display_name: user.display_name || "",
        bio: user.bio || "",
      };
      setForm(userForm);
      setOriginalForm(userForm);
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      e.target.value = "";
      return;
    }

    const uploadAvatar = async () => {
      const formData = new FormData();
      formData.append("file", file);

      let apiResponse: any;
      try {
        const response = await fetch("/api/users/avatar", {
          method: "POST",
          headers: {
            "frontend-internal-request": "true",
          },
          body: formData,
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });

        apiResponse = await response.json();

        if (!response.ok) {
          console.error("Avatar upload failed:", apiResponse);
          showError(apiResponse?.message || "Avatar upload failed");
          return;
        }
      } catch (error) {
        console.error("Avatar upload request error:", error);
        showError("Avatar upload failed. Please try again.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        avatar_ipfs_hash: apiResponse.ipfsHash,
      }));
    };

    await withLoading(uploadAvatar);
  };

  const handleChangeProfile = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateProfile = async () => {
      let response: any;
      try {
        response = await apiCallWithTimeout("/api/users/profile-change", {
          method: "PUT",
          body: {
            current: form,
            original: originalForm,
          },
        });
      } catch (error) {
        console.error("Profile update request error:", error);
        showError("Update failed. Please try again.");
        return;
      }

      if (!response.success) {
        console.error("Profile update failed:", response);
        showError(response?.message || "Update failed");
        return;
      }

      if (response.results) {
        let hasErrors = false;
        let hasSuccess = false;

        Object.entries(response.results).forEach(([field, result]) => {
          const typedResult = result as { success: boolean; message: string };
          if (typedResult.success) {
            hasSuccess = true;
            const fieldName = field
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            showSuccess(`${fieldName} updated successfully`);
          } else {
            hasErrors = true;
            const fieldName = field
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            showError(
              `${fieldName} update failed: ${
                typedResult.message || "Unknown error"
              }`
            );
          }
        });

        if (hasSuccess && !hasErrors) {
          // All updates successful, refetch user data
          if (refetchUserData) {
            await refetchUserData();
          }
          setEditSection("none");
        }
      } else if (response.success) {
        // Fallback for single field updates
        showSuccess("Profile updated successfully");
        if (refetchUserData) {
          await refetchUserData();
        }
        setEditSection("none");
      }
    };

    await withLoading(updateProfile);
  };

  const handleChange = () => {
    console.log("Username/email change not implemented yet");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showError("Username and email changes are not implemented yet");
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader
        title="Personal info"
        description="Manage your personal details and how they appear."
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm p-8 mb-8 shadow-2xl">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Profile Information
            </h3>
            <p className="text-sm text-gray-400">
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
                disabled={saving}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitProfile}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FontAwesomeIcon icon={faCheck} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative group">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-xl">
                <Image
                  src={
                    form.avatar_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${form.avatar_ipfs_hash}`
                      : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              {editSection === "profile" && (
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center"
                >
                  <div className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
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
              <p className="text-xs text-gray-400 mt-3 text-center lg:text-left">
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
                    <h2 className="text-3xl font-bold text-white">
                      {form.display_name || "Your name"}
                    </h2>
                    {user?.role && (
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                        {user.role
                          ? user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)
                          : "User"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300">
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    value={form.display_name}
                    onChange={handleChangeProfile}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                    placeholder="Enter your display name"
                  />
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="pt-6 border-t border-white/10">
              {editSection !== "profile" ? (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">About me</h4>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gray-200 leading-relaxed">
                      {form.bio ||
                        "No bio added yet. Click edit to add a short description about yourself."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300">
                    About me
                  </label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={handleChangeProfile}
                    rows={4}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 h-full min-h-[240px] hover:bg-white/[0.06] transition shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold tracking-tight">Username info</h3>
              <p className="text-xs text-gray-400">Username</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditSection(editSection === "username" ? "none" : "username")
              }
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1"
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
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="text-white font-medium">{username || "-"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <input
                    name="username"
                    value={username}
                    onChange={handleChange}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Your username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 h-full min-h-[240px] hover:bg-white/[0.06] transition shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold tracking-tight">Contact info</h3>
              <p className="text-xs text-gray-400">Email address</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditSection(editSection === "email" ? "none" : "email")
              }
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1"
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
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-green-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{email || "-"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
