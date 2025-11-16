import { UserProfile } from "@/interfaces/user.interfaces";
import { createUser, updateUser, selectUser } from "@/store/slices/userSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useCallback } from "react";

interface UseUserResult {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  updateUserDetail: (
    avatar_ipfs_hash: string,
    display_name: string,
    bio: string
  ) => void;
}

export const useUser = (): UseUserResult => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const setUser = useCallback(
    (user: UserProfile) => {
      dispatch(createUser(user));
    },
    [dispatch]
  );

  const updateUserDetail = useCallback(
    (avatar_ipfs_hash: string, display_name: string, bio: string) => {
      dispatch(updateUser({ avatar_ipfs_hash, display_name, bio }));
    },
    [dispatch]
  );

  return {
    user,
    setUser,
    updateUserDetail,
  };
};
