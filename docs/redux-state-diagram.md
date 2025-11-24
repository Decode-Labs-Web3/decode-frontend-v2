# Redux State Class Diagram

This diagram represents the complete Redux store structure for the Decode Frontend application.

```mermaid
classDiagram
    class RootState {
        +user: UserProfile
        +fingerprint: FingerprintState
        +notification: NotificationReceived[]
    }

    class UserProfile {
        +string _id
        +string username
        +string email
        +string display_name
        +string bio
        +string avatar_ipfs_hash
        +string role
        +string last_login
        +boolean is_active
        +number __v
        +string last_account_deactivation
        +Wallet primary_wallet
        +Wallet[] wallets
        +number following_number
        +number followers_number
        +boolean is_online
    }

    class Wallet {
        +string _id
        +string address
        +string user_id
        +string name_service
        +boolean is_primary
        +string createdAt
        +string updatedAt
        +number __v
    }

    class FingerprintState {
        +string fingerprintHash
    }

    class NotificationReceived {
        +string createdAt
        +boolean delivered
        +string delivered_at
        +string _id
        +string message
        +boolean read
        +string read_at
        +string title
        +string type
        +string updatedAt
        +string user_id
        +number __v
    }

    %% Relationships
    RootState --> UserProfile : user
    RootState --> FingerprintState : fingerprint
    RootState --> NotificationReceived : notification[]

    UserProfile *-- Wallet : primary_wallet
    UserProfile *-- Wallet : wallets[]
```

## Store Structure Overview

### State Slices

1. **User Slice** (`userSlice.ts`)
   - Manages user profile data including authentication, profile information, and wallet connections
   - Handles wallet management (add, remove, set primary)
   - Tracks social metrics (followers, following)

2. **Fingerprint Slice** (`fingerprintSlice.ts`)
   - Stores device fingerprint hash for security and tracking purposes
   - Simple state with single string value

3. **Notification Slice** (`notificationSlice.ts`)
   - Manages array of notifications
   - Handles real-time notification updates via socket events
   - Tracks read/unread status and delivery status

### Key Features

- **Type Safety**: Full TypeScript integration with `RootState` and `AppDispatch` types
- **Custom Hooks**: `useAppDispatch` and `useAppSelector` for type-safe Redux usage
- **Redux Provider**: Wraps application with Redux store context
- **Immutable Updates**: Uses Redux Toolkit's Immer for safe state mutations

### Actions Summary

#### User Actions
- `createUser`: Initialize user profile
- `updateUser`: Update profile fields (avatar, display name, bio)
- `updateEmail`: Update user email
- `addWallet`: Add new wallet to user's wallets
- `removeWallet`: Remove wallet by address
- `addPrimary`: Set primary wallet and update is_primary flags

#### Fingerprint Actions
- `setFingerprintHash`: Store device fingerprint

#### Notification Actions
- `setNotification`: Replace all notifications
- `setOldNotification`: Append older notifications (pagination)
- `setReadAll`: Mark all notifications as read
- `setReadOne`: Mark single notification as read
- `setNewNotification`: Add new notification from socket event
- `resetNotifications`: Clear all notifications
