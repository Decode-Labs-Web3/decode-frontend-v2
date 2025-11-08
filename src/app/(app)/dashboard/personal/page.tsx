"use client";

import { useState, Suspense } from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserInfoContext } from "@/contexts/UserInfoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dynamic imports for code splitting
const ProfileEditModal = dynamic(
  () => import("@/components/(app)/ProfileEditModal"),
  {
    loading: () => <div>Loading...</div>,
  }
);

const EmailChangeModal = dynamic(
  () => import("@/components/(app)/EmailChangeModal"),
  {
    loading: () => <div>Loading...</div>,
  }
);

const DeleteAccountModal = dynamic(
  () => import("@/components/(app)/DeleteAccountModal"),
  {
    loading: () => <div>Loading...</div>,
  }
);

export default function PersonalPage() {
  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};
  const [modal, setModal] = useState({
    edit: false,
    email: false,
    delete: false,
  });

  const handleProfileUpdate = () => {
    fetchUserInfo?.();
  };

  const handleEmailUpdate = () => {
    fetchUserInfo?.();
  };

  if (!userInfo) {
    return <h1>Loading ....</h1>;
  }

  return (
    <>
      <Card className="relative overflow-hidden mb-8 shadow-2xl hover-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg mb-1">
                Profile Information
              </CardTitle>
              <p className="font-mono text-sm text-(--muted-foreground)">
                User ID: {userInfo._id}
              </p>
            </div>
            <Button
              className="border border-(--input) bg-(--background) shadow-sm hover:bg-(--accent) hover:text-(--accent-foreground)"
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
              <Avatar className="w-32 h-32 rounded-2xl border-2 border-(--border) overflow-hidden shadow-xl">
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
                    {userInfo.display_name || userInfo.username || "Your name"}
                  </h2>
                  {userInfo.role && (
                    <Badge className="bg-(--secondary) text-(--secondary-foreground)">
                      {userInfo.role.charAt(0).toUpperCase() +
                        userInfo.role.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-(--border)">
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

      {userInfo?._id && <SnapshotChart userId={userInfo?._id} />}

      <Button
        className="w-full mt-4 bg-(--destructive) text-(--destructive-foreground) shadow-sm hover:opacity-90"
        onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
      >
        Delete Account
      </Button>

      <Button
        className="w-full mt-4 bg-(--destructive) text-(--destructive-foreground) shadow-sm hover:opacity-90"
        onClick={() => {
          setModal((prev) => ({ ...prev, email: true }));
        }}
      >
        Change Email
      </Button>

      {/* Dynamic modals with code splitting */}
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileEditModal
          isOpen={modal.edit}
          onClose={() => setModal((prev) => ({ ...prev, edit: false }))}
          userInfo={userInfo}
          onProfileUpdate={handleProfileUpdate}
        />

        <EmailChangeModal
          isOpen={modal.email}
          onClose={() => setModal((prev) => ({ ...prev, email: false }))}
          onEmailUpdate={handleEmailUpdate}
        />

        <DeleteAccountModal
          isOpen={modal.delete}
          onClose={() => setModal((prev) => ({ ...prev, delete: false }))}
        />
      </Suspense>
    </>
  );
}
