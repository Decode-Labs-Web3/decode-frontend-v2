"use client";

import dynamic from "next/dynamic";
import { useUser } from "@/hooks/useUser";
import { useState, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfileEditModal from "@/components/(app)/ProfileEditModal";
import EmailChangeModal from "@/components/(app)/EmailChangeModal";
import DeleteAccountModal from "@/components/(app)/DeleteAccountModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonalPage() {
  const { user } = useUser();
  const [modal, setModal] = useState({
    edit: false,
    email: false,
    delete: false,
  });

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
                User ID: {user._id}
              </p>
            </div>
            <Button
              variant="outline"
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
            <div className="flex flex-col items-center lg:items-start">
              <Avatar className="w-32 h-32 rounded-2xl border-2 border-(--border) overflow-hidden shadow-xl">
                <AvatarImage
                  src={
                    user?.avatar_ipfs_hash
                      ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
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
                    {user.display_name || user.username || "Your name"}
                  </h2>
                  <Badge className="bg-(--secondary) text-(--secondary-foreground)">
                    {user.role.charAt(0).toLowerCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="pt-6 border-t border-(--border)">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">About me</h4>
                  <Card className="hover-card">
                    <CardContent className="p-4">
                      <p className="leading-relaxed">{user.bio}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SnapshotChart userId={user?._id} />

      <Button
        className="w-full mt-4 bg-rose-500 text-(--destructive-foreground) shadow-sm hover:opacity-90"
        onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
      >
        Delete Account
      </Button>

      <Button
        className="w-full mt-4 bg-rose-500 text-(--destructive-foreground) shadow-sm hover:opacity-90"
        onClick={() => {
          setModal((prev) => ({ ...prev, email: true }));
        }}
      >
        Change Email
      </Button>

      <Suspense fallback={<div>Loading...</div>}>
        <ProfileEditModal
          isOpen={modal.edit}
          onClose={() => setModal((prev) => ({ ...prev, edit: false }))}
        />

        <EmailChangeModal
          isOpen={modal.email}
          onClose={() => setModal((prev) => ({ ...prev, email: false }))}
        />

        <DeleteAccountModal
          isOpen={modal.delete}
          onClose={() => setModal((prev) => ({ ...prev, delete: false }))}
        />
      </Suspense>
    </>
  );
}
