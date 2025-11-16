import type { RootState } from "@/store/store";
import { UserProfile } from "@/interfaces/user.interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  },
});

export const { createUser, updateUser } = userSlice.actions;
export default userSlice.reducer;

const selectUserState = (state: RootState) => state.user;

export const selectUser = selectUserState;
