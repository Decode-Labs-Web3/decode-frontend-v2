import type { RootState } from "@/store/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, Wallet } from "@/interfaces/user.interfaces";

const initialState: UserProfile = {
  _id: "",
  username: "",
  email: "",
  display_name: "",
  bio: "",
  avatar_ipfs_hash: "",
  role: "",
  is_active: false,
  __v: 0,
  following_number: 0,
  followers_number: 0,
  is_online: false,
};

type UpdateUserPayload = {
  avatar_ipfs_hash: string;
  display_name: string;
  bio: string;
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    createUser(_state, action: PayloadAction<UserProfile>) {
      return action.payload;
    },
    updateUser(state, action: PayloadAction<UpdateUserPayload>) {
      Object.assign(state, action.payload);
    },
    updateEmail(state, action: PayloadAction<{ email: string }>) {
      const { email } = action.payload;
      state.email = email;
    },
    addWallet(state, action: PayloadAction<Wallet>) {
      const newWallet = action.payload;
      const exists = state.wallets?.some(
        (wallet) => wallet.address === newWallet.address
      );
      if (exists) return;
      if (state.wallets) {
        state.wallets.push(newWallet);
      } else {
        state.wallets = [newWallet];
      }
    },
    removeWallet(state, action: PayloadAction<{ address: string }>) {
      const { address } = action.payload;
      if (state.wallets) {
        state.wallets = state.wallets.filter(
          (wallet) => wallet.address !== address
        );
      }
    },
    addPrimary(state, action: PayloadAction<Wallet>) {
      const primaryWallet = action.payload;
      state.primary_wallet = primaryWallet;
      if (state.wallets) {
        state.wallets = state.wallets.map((wallet) => ({
          ...wallet,
          is_primary: wallet.address === primaryWallet.address,
        }));
      }
    },
  },
});

export const {
  createUser,
  updateUser,
  updateEmail,
  addWallet,
  removeWallet,
  addPrimary,
} = userSlice.actions;
export default userSlice.reducer;

const selectUserState = (state: RootState) => state.user;

export const selectUser = selectUserState;
