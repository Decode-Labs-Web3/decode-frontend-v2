"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import {
  faEnvelope,
  faCamera,
  faPen,
  faXmark,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";

export default function PersonalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    delete: false,
  });

  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};

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
                      ? `http://35.247.142.76:8080/ipfs/${userInfo.avatar_ipfs_hash}`
                      : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
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
          className="fixed inset-0 flex items-center justify-center"
        >
          <div
            onClick={() =>
              setModal((prev) => ({
                ...prev,
                edit: false,
              }))
            }
            className="fixed inset-0 bg-black/80 z-50"
          />
          <div className="bg-red-500 w-100 h-100 z-[100]">
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-50 h-50 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-[color:var(--border)] overflow-hidden shadow-xl">
                <Image
                  src={
                    userInfo?.avatar_ipfs_hash
                      ? `http://35.247.142.76:8080/ipfs/${userInfo.avatar_ipfs_hash}`
                      : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <input

              placeholder="Input Change Display Name Here"/>
              <input

              placeholder="Input Change Bio Name Here"/>
            </div>
          </div>
        </div>
      )}

      {userInfo?._id && <SnapshotChart userId={userInfo?._id} />}
    </>
  );
}
