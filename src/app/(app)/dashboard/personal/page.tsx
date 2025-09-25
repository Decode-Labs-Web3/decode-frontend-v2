"use client";

import Image from "next/image";
import App from "@/components/(app)";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { useState, useContext, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";
import { faEnvelope, faCamera, faPen, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function PersonalPage() {
  const userContext = useContext(UserInfoContext);
  const user = userContext?.user;
  const refetchUserData = userContext?.refetchUserData;
  const [loading, setLoading] = useState(false);

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
    if (user) {
      const userForm = {
        username: user.username || "",
        email: user.email || "",
        avatar_ipfs_hash: user.avatar_ipfs_hash || "",
        display_name: user.display_name || "",
        bio: user.bio || "",
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
  }, [user]);

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
              avatar_ipfs_hash: user?.avatar_ipfs_hash || "",
              display_name: user?.display_name || "",
              bio: user?.bio || "",
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
            if (refetchUserData) {
              await refetchUserData();
            }
            setEditSection("none");
          }
        } else if (response.success) {
          toastSuccess("Profile updated successfully");
          if (refetchUserData) {
            await refetchUserData();
          }
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
    setLoading(false);
    const updateUsername = async () => {
      const apiResponse = await fetch("/api/users/username-change", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      const response = await apiResponse.json();

      if (response.success && response.message === "Email verification sent") {
        setLoading(true);
      } else {
        setLoading(false);
        toastError(response.message || "Username update failed");
      }
    };
    await updateUsername();
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
        if (refetchUserData) {
          await refetchUserData();
        }
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
                disabled={false}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
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
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-xl">
                <Image
                  src={
                    profileForm.avatar_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${profileForm.avatar_ipfs_hash}`
                      : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    </div>
                  </div>
                )}
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
                      {profileForm.display_name || "Your name"}
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
                    value={profileForm.display_name}
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
                      {profileForm.bio ||
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
                    value={profileForm.bio}
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
                  <p className="text-white font-medium">
                    {accountForm.username || "-"}
                  </p>
                </div>
              </div>
            ) : !loading ? (
              <form onSubmit={handleSubmitUsername} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">
                    {" "}
                    Enter username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={accountForm.username}
                    onChange={handleChangeProfileFrom}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Your username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={false}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendUsernameCode} className="space-y-4">
                <label className="text-sm text-gray-400">
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
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Your username code"
                />
                <button
                  type="submit"
                  disabled={false}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Save
                </button>
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
                  <p className="text-white font-medium">
                    {accountForm.email || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={handleChangeProfileFrom}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={false}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2"
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
    </div>
  );
}
