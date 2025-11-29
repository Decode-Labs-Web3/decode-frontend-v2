import userReducer, {
  createUser,
  updateUser,
  updateEmail,
  addWallet,
  removeWallet,
  addPrimary,
} from "../userSlice";
import { UserProfile, Wallet } from "@/interfaces/user.interfaces";

const mockUser: UserProfile = {
  _id: "1",
  username: "testuser",
  email: "test@example.com",
  display_name: "Test User",
  bio: "Test bio",
  avatar_ipfs_hash: "",
  role: "user",
  is_active: true,
  __v: 0,
  following_number: 0,
  followers_number: 0,
  is_online: false,
};

const mockWallet: Wallet = {
  _id: "w1",
  address: "0x123",
  user_id: "1",
  name_service: null,
  is_primary: false,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
  __v: 0,
};

describe("userSlice", () => {
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

  it("should return the initial state", () => {
    expect(userReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle createUser", () => {
    const actual = userReducer(initialState, createUser(mockUser));
    expect(actual).toEqual(mockUser);
  });

  it("should handle updateUser", () => {
    const state = { ...mockUser };
    const updatePayload = {
      avatar_ipfs_hash: "new-hash",
      display_name: "Updated Name",
      bio: "Updated bio",
    };
    const actual = userReducer(state, updateUser(updatePayload));
    expect(actual.avatar_ipfs_hash).toBe("new-hash");
    expect(actual.display_name).toBe("Updated Name");
    expect(actual.bio).toBe("Updated bio");
  });

  it("should handle updateEmail", () => {
    const state = { ...mockUser };
    const actual = userReducer(
      state,
      updateEmail({ email: "new@example.com" })
    );
    expect(actual.email).toBe("new@example.com");
  });

  it("should handle addWallet", () => {
    const state = { ...mockUser };
    const actual = userReducer(state, addWallet(mockWallet));
    expect(actual.wallets).toHaveLength(1);
    expect(actual.wallets![0]).toEqual(mockWallet);
  });

  it("should not add duplicate wallet", () => {
    const state = { ...mockUser, wallets: [mockWallet] };
    const actual = userReducer(state, addWallet(mockWallet));
    expect(actual.wallets).toHaveLength(1);
  });

  it("should handle removeWallet", () => {
    const state = { ...mockUser, wallets: [mockWallet] };
    const actual = userReducer(state, removeWallet({ address: "0x123" }));
    expect(actual.wallets).toHaveLength(0);
  });

  it("should handle addPrimary", () => {
    const state = {
      ...mockUser,
      wallets: [mockWallet, { ...mockWallet, _id: "w2", address: "0x456" }],
    };
    const primaryWallet = { ...mockWallet, is_primary: true };
    const actual = userReducer(state, addPrimary(primaryWallet));
    expect(actual.primary_wallet).toEqual(primaryWallet);
    expect(actual.wallets![0].is_primary).toBe(true);
    expect(actual.wallets![1].is_primary).toBe(false);
  });
});
