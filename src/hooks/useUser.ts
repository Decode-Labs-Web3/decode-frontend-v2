import { useCallback } from "react";
import { UserProfile, Wallet } from "@/interfaces/user.interfaces";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  createUser,
  updateUser,
  selectUser,
  updateEmail,
  addWallet,
  removeWallet,
  addPrimary,
} from "@/store/slices/userSlice";

interface UseUserResult {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  updateUserEmail: (email: string) => void;
  updateUserDetail: (
    avatar_ipfs_hash: string,
    display_name: string,
    bio: string
  ) => void;
  addWalletUser: (wallet: Wallet, makePrimary?: boolean) => void;
  removeWalletUser: (address: string) => void;
  setPrimaryWallet: (wallet: Wallet) => void;
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

  const updateUserEmail = useCallback(
    (email: string) => {
      dispatch(updateEmail({ email }));
    },
    [dispatch]
  );

  const addWalletUser = useCallback(
    (wallet: Wallet) => {
      dispatch(addWallet(wallet));
    },
    [dispatch]
  );

  const removeWalletUser = useCallback(
    (address: string) => {
      dispatch(removeWallet({ address }));
    },
    [dispatch]
  );

  const setPrimaryWallet = useCallback(
    (wallet: Wallet) => {
      dispatch(addPrimary(wallet));
    },
    [dispatch]
  );

  return {
    user,
    setUser,
    updateUserDetail,
    updateUserEmail,
    addWalletUser,
    removeWalletUser,
    setPrimaryWallet,
  };
};
