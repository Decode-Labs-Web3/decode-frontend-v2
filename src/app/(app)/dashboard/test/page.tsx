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
    delete: false,
    edit: false,
  });

  const { userInfo, fetchUserInfo } = useUserInfoContext() || {};

  return <>{userInfo?._id && <SnapshotChart userId={userInfo?._id} />}</>;
}
