# Decode Protocol - User Stories

## Overview
This document contains comprehensive user stories for the Decode Protocol Web3 Authentication & Identity Management System. User stories are organized by feature area and follow the format: "As a [user type], I want [goal], so that [benefit]."

---

## 1. Authentication & Account Management

### 1.1 User Registration

**US-001: Email Registration**
- **As a** new user
- **I want to** register with my email, username, and password
- **So that** I can create an account and access the platform

**Acceptance Criteria:**
- User can enter username, email, and password
- Password must meet strength requirements (8+ chars, uppercase, number, special char)
- Password strength indicator shows weak/fair/strong
- Confirm password field validates matching passwords
- Email verification code is sent after registration
- User is redirected to verification page

**US-002: Email Verification**
- **As a** newly registered user
- **I want to** verify my email with a 6-digit code
- **So that** I can confirm my email address and activate my account

**Acceptance Criteria:**
- User receives 6-digit verification code via email
- Code input accepts only numeric characters
- Invalid code shows error message
- Successful verification redirects to login page
- Verification code expires after set time

### 1.2 User Login

**US-003: Traditional Login**
- **As a** registered user
- **I want to** log in with my email/username and password
- **So that** I can access my account and dashboard

**Acceptance Criteria:**
- User can enter email or username
- Password field has show/hide toggle
- Device fingerprint is generated automatically
- Successful login redirects to dashboard
- Failed login shows appropriate error message

**US-004: Device Trust Verification**
- **As a** user logging in from a new device
- **I want to** verify my device via email
- **So that** my account remains secure from unauthorized access

**Acceptance Criteria:**
- System detects untrusted device fingerprint
- Email verification code is sent automatically
- User enters 6-digit code to trust device
- Successful verification grants access to dashboard
- Device is remembered for future logins

**US-005: Two-Factor Authentication Login**
- **As a** user with 2FA enabled
- **I want to** enter my OTP code after password
- **So that** I have an extra layer of security

**Acceptance Criteria:**
- After password validation, OTP prompt appears
- User enters 6-digit OTP from authenticator app
- Invalid OTP shows error message
- Successful OTP verification grants access
- Session is created with appropriate tokens

### 1.3 Web3 Wallet Authentication

**US-006: Wallet Connection**
- **As a** Web3 user
- **I want to** connect my wallet to authenticate
- **So that** I can access the platform using my blockchain identity

**Acceptance Criteria:**
- AppKit modal opens with wallet options
- User can select from multiple wallets (MetaMask, WalletConnect, etc.)
- Wallet connection request appears in wallet app
- User can approve or reject connection
- Successful connection proceeds to signature request

**US-007: Wallet Signature Authentication**
- **As a** Web3 user
- **I want to** sign a message with my wallet
- **So that** I can prove ownership and authenticate securely

**Acceptance Criteria:**
- System generates unique challenge message
- Signature request appears in wallet
- User can sign or reject the message
- Successful signature validates and creates session
- User is redirected to dashboard
- Rejection shows cancellation message

### 1.4 Password Management

**US-008: Forgot Password**
- **As a** user who forgot my password
- **I want to** request a password reset
- **So that** I can regain access to my account

**Acceptance Criteria:**
- User enters email or username
- Reset code is sent to registered email
- User is redirected to verification page
- Code expires after set time

**US-009: Password Reset Verification**
- **As a** user resetting my password
- **I want to** verify my identity with a code
- **So that** I can proceed to set a new password

**Acceptance Criteria:**
- User enters 6-digit verification code
- Invalid code shows error message
- Successful verification redirects to change password page

**US-010: Change Password**
- **As a** user resetting my password
- **I want to** set a new password
- **So that** I can secure my account with a password I remember

**Acceptance Criteria:**
- Password strength indicator shows real-time feedback
- New password must meet strength requirements
- Confirm password must match new password
- Successful change redirects to login page
- User receives confirmation notification

---

## 2. Dashboard & Profile Management

### 2.1 Dashboard Overview

**US-011: View Dashboard Overview**
- **As a** logged-in user
- **I want to** see my account overview
- **So that** I can quickly understand my account status and activity

**Acceptance Criteria:**
- Profile card shows avatar, name, email, bio
- User ID is displayed
- Role badge is visible
- Followers and following counts are shown
- Security status card shows 2FA status
- Wallet card shows primary wallet address
- Device card shows last login time
- Recent activity shows latest 5 notifications

### 2.2 Personal Information

**US-012: View Personal Profile**
- **As a** user
- **I want to** view my complete profile information
- **So that** I can see all my personal details in one place

**Acceptance Criteria:**
- Avatar is displayed prominently
- Display name and username are shown
- Role badge is visible
- Bio/about section is displayed
- Activity snapshot chart is visible
- User ID is shown

**US-013: Edit Profile**
- **As a** user
- **I want to** edit my profile information
- **So that** I can keep my details up to date

**Acceptance Criteria:**
- Edit button opens profile edit modal
- User can update display name
- User can update bio
- Changes are saved to backend
- Success message confirms update
- Profile updates immediately after save

**US-014: Upload Avatar**
- **As a** user
- **I want to** upload a profile picture
- **So that** I can personalize my account

**Acceptance Criteria:**
- User can select image file
- Image is uploaded to IPFS
- IPFS hash is stored in profile
- Avatar updates immediately
- Default avatar is shown if none uploaded

**US-015: Change Email**
- **As a** user
- **I want to** change my email address
- **So that** I can update my contact information

**Acceptance Criteria:**
- Change email button opens modal
- User verifies old email with code
- User enters new email address
- Verification code sent to new email
- Successful verification updates email
- User receives confirmation

**US-016: View Activity Snapshot**
- **As a** user
- **I want to** see my activity chart
- **So that** I can visualize my engagement over time

**Acceptance Criteria:**
- Chart displays activity data
- Data is fetched from backend
- Chart is interactive and responsive
- Time period is clearly labeled

### 2.3 Account Deletion

**US-017: Deactivate Account**
- **As a** user
- **I want to** deactivate my account
- **So that** I can temporarily disable my profile

**Acceptance Criteria:**
- Delete account button opens confirmation modal
- User must confirm deactivation
- Account is marked as inactive
- User is logged out after deactivation
- Account can be reactivated later

---

## 3. Security Management

### 3.1 Two-Factor Authentication

**US-018: Setup 2FA**
- **As a** user
- **I want to** enable two-factor authentication
- **So that** I can add extra security to my account

**Acceptance Criteria:**
- User toggles 2FA switch
- QR code is generated and displayed
- Manual entry key is provided
- User can copy secret key
- User scans QR with authenticator app
- User enters 6-digit code to verify setup
- 2FA is enabled after successful verification

**US-019: View QR Code**
- **As a** user setting up 2FA
- **I want to** view the QR code in a modal
- **So that** I can scan it easily with my authenticator app

**Acceptance Criteria:**
- "Show QR Code" button opens modal
- QR code is large and scannable
- Manual entry key is displayed below QR
- Copy button copies secret to clipboard
- Modal can be closed and reopened

**US-020: Disable 2FA**
- **As a** user with 2FA enabled
- **I want to** disable two-factor authentication
- **So that** I can remove the extra authentication step

**Acceptance Criteria:**
- User toggles 2FA switch off
- Confirmation is requested
- 2FA is disabled immediately
- User receives confirmation message
- Login no longer requires OTP

**US-021: Check 2FA Status**
- **As a** user
- **I want to** see if 2FA is enabled
- **So that** I know my current security status

**Acceptance Criteria:**
- Badge shows "Enabled" or "Disabled"
- Status is fetched on page load
- Status updates after changes
- Loading state is shown during fetch

### 3.2 Password Security

**US-022: Change Password (Authenticated)**
- **As a** logged-in user
- **I want to** change my password from security settings
- **So that** I can update my password periodically for security

**Acceptance Criteria:**
- User enters current password
- User enters new password
- Password strength indicator shows feedback
- Confirm password must match
- Successful change shows confirmation
- User remains logged in after change

---

## 4. Web3 Wallet Management

### 4.1 Wallet Linking

**US-023: Link Additional Wallet**
- **As a** user
- **I want to** link multiple wallets to my account
- **So that** I can access my account from different wallets

**Acceptance Criteria:**
- "Add Wallet" button opens AppKit modal
- User selects wallet to connect
- Challenge message is generated
- User signs message in wallet
- Wallet is added to account
- Wallet appears in wallet list

**US-024: Set Primary Wallet**
- **As a** user with multiple wallets
- **I want to** set one wallet as primary
- **So that** I can designate my main wallet

**Acceptance Criteria:**
- "Add Primary Wallet" button is shown if no primary
- User connects wallet via AppKit
- User signs challenge message
- Wallet is set as primary
- Primary badge is displayed
- Primary wallet shown in overview

**US-025: View All Wallets**
- **As a** user
- **I want to** see all my connected wallets
- **So that** I can manage my wallet connections

**Acceptance Criteria:**
- All wallets are listed in cards
- Wallet addresses are displayed
- Primary wallet is marked with badge
- Wallet count is shown
- Empty state shown if no wallets

**US-026: Unlink Wallet**
- **As a** user
- **I want to** remove a wallet from my account
- **So that** I can disconnect wallets I no longer use

**Acceptance Criteria:**
- Remove button appears on each wallet
- User confirms removal
- Wallet is removed from account
- Success message is shown
- Wallet list updates immediately
- Cannot remove primary wallet

---

## 5. Device & Session Management

### 5.1 Device Management

**US-027: View All Devices**
- **As a** user
- **I want to** see all devices that have accessed my account
- **So that** I can monitor for unauthorized access

**Acceptance Criteria:**
- All devices are displayed in cards
- Device type icon is shown (laptop, mobile, tablet)
- Device name and browser are displayed
- Sessions for each device are listed
- Current device is marked with badge

**US-028: View Device Sessions**
- **As a** user
- **I want to** see all sessions for each device
- **So that** I can track which apps I'm logged into

**Acceptance Criteria:**
- Sessions are grouped by device
- App name and logo are displayed
- Last used timestamp is shown
- Current session is marked with badge
- Session count is visible

**US-029: Revoke Device Access**
- **As a** user
- **I want to** revoke access for a device
- **So that** I can remove devices I no longer use

**Acceptance Criteria:**
- "Revoke Device" button appears on each device
- User confirms revocation
- All sessions for device are terminated
- If current device, user is logged out
- Device is removed from list
- Success message is shown

**US-030: Revoke Individual Session**
- **As a** user
- **I want to** revoke a specific session
- **So that** I can log out from individual apps

**Acceptance Criteria:**
- "Revoke" button appears on each session
- User confirms revocation
- Session is terminated
- If current session, user is logged out
- Session is removed from list
- Success message is shown

---

## 6. Social Features & Connections

### 6.1 User Search

**US-031: Search Users**
- **As a** user
- **I want to** search for other users by name or username
- **So that** I can find and connect with people

**Acceptance Criteria:**
- Search input accepts text
- Search is triggered on form submit
- Results show user avatar, name, username, bio
- "View" button links to user profile
- Empty state shown if no results
- Loading state shown during search

**US-032: View User Suggestions**
- **As a** user
- **I want to** see suggested users based on shared interests
- **So that** I can discover people with similar interests

**Acceptance Criteria:**
- Suggestions appear when no search query
- Users with shared interests are shown
- Shared interest count is displayed
- Interest tags are shown (up to 3)
- Online status indicator is visible
- Following badge shown if already following

### 6.2 Interest Management

**US-033: Set User Interests**
- **As a** new user
- **I want to** select my interests
- **So that** I can get personalized user suggestions

**Acceptance Criteria:**
- Interest modal opens on first visit
- User can select multiple interests
- Interests are saved to backend
- Modal closes after saving
- User suggestions are updated

**US-034: Update Interests**
- **As a** user
- **I want to** update my interests
- **So that** I can refine my user suggestions

**Acceptance Criteria:**
- User can reopen interest modal
- Current interests are pre-selected
- User can add or remove interests
- Changes are saved to backend
- Suggestions update after save

### 6.3 User Profiles

**US-035: View User Profile**
- **As a** user
- **I want to** view another user's profile
- **So that** I can learn more about them

**Acceptance Criteria:**
- Profile shows avatar, name, username
- Bio is displayed
- Follower and following counts shown
- Shared interests are visible
- Online status is indicated
- Relationship status is shown (following, blocked, etc.)

**US-036: Follow User**
- **As a** user
- **I want to** follow another user
- **So that** I can see their updates

**Acceptance Criteria:**
- Follow button is visible on profile
- Click toggles follow status
- Button updates to "Following"
- Follower count increments
- Success message is shown

**US-037: Unfollow User**
- **As a** user
- **I want to** unfollow a user
- **So that** I stop seeing their updates

**Acceptance Criteria:**
- "Following" button is visible
- Click toggles follow status
- Button updates to "Follow"
- Follower count decrements
- Success message is shown

**US-038: Block User**
- **As a** user
- **I want to** block another user
- **So that** they cannot interact with me

**Acceptance Criteria:**
- Block button is visible on profile
- User confirms blocking
- User is added to blocked list
- Blocked user cannot see profile
- Success message is shown

**US-039: Unblock User**
- **As a** user
- **I want to** unblock a user
- **So that** they can interact with me again

**Acceptance Criteria:**
- Unblock button visible in blocked list
- User confirms unblocking
- User is removed from blocked list
- Success message is shown

### 6.4 Connection Lists

**US-040: View Followers**
- **As a** user
- **I want to** see who follows me
- **So that** I know who is interested in my content

**Acceptance Criteria:**
- Followers tab shows all followers
- Each follower card shows avatar, name, username
- Follow back button is available
- Empty state shown if no followers

**US-041: View Following**
- **As a** user
- **I want to** see who I follow
- **So that** I can manage my connections

**Acceptance Criteria:**
- Following tab shows all followed users
- Each card shows avatar, name, username
- Unfollow button is available
- Empty state shown if not following anyone

**US-042: View Blocked Users**
- **As a** user
- **I want to** see my blocked users list
- **So that** I can manage blocked accounts

**Acceptance Criteria:**
- Blocked tab shows all blocked users
- Each card shows avatar, name, username
- Unblock button is available
- Empty state shown if no blocked users

---

## 7. Notifications

### 7.1 Notification Center

**US-043: View Notifications**
- **As a** user
- **I want to** see all my notifications
- **So that** I stay informed about account activity

**Acceptance Criteria:**
- All notifications are listed chronologically
- Read/unread status is indicated with icons
- Notification title and message are shown
- Timestamp is displayed
- Infinite scroll loads more notifications

**US-044: Mark Notification as Read**
- **As a** user
- **I want to** mark a notification as read
- **So that** I can track which notifications I've seen

**Acceptance Criteria:**
- "Read" button appears on unread notifications
- Click marks notification as read
- Icon changes to checkmark
- Unread count decrements
- Button disappears after marking read

**US-045: Mark All as Read**
- **As a** user
- **I want to** mark all notifications as read
- **So that** I can quickly clear my notification list

**Acceptance Criteria:**
- "Mark all as read" button is visible
- Click marks all notifications as read
- All icons change to checkmarks
- Unread count resets to zero
- Success message is shown

**US-046: Real-time Notifications**
- **As a** user
- **I want to** receive notifications in real-time
- **So that** I'm immediately informed of important events

**Acceptance Criteria:**
- SSE connection is established on login
- New notifications appear automatically
- Toast notification shows for new items
- Unread badge updates in real-time
- Notification list updates without refresh

**US-047: View Unread Count**
- **As a** user
- **I want to** see my unread notification count
- **So that** I know when I have new notifications

**Acceptance Criteria:**
- Badge shows unread count in sidebar
- Count updates in real-time
- Badge is hidden when count is zero
- Count is accurate across all pages

---

## 8. Content & News

### 8.1 News Feed

**US-048: View News Feed**
- **As a** user
- **I want to** see a feed of news posts
- **So that** I can stay updated with platform content

**Acceptance Criteria:**
- News posts are displayed in cards
- Each post shows title, excerpt, author
- Thumbnail image is displayed
- Post date is shown
- Click opens full post

**US-049: View News Post Detail**
- **As a** user
- **I want to** read a full news post
- **So that** I can get complete information

**Acceptance Criteria:**
- Full post content is displayed
- Author information is shown
- Post date and time are visible
- Related posts may be suggested
- Back button returns to feed

### 8.2 Blog Post Creation

**US-050: Create Blog Post**
- **As a** user
- **I want to** create a blog post
- **So that** I can share content with the community

**Acceptance Criteria:**
- Post creation form is accessible
- User can enter title
- User can enter content (rich text)
- User can add tags
- User can upload images
- Post is saved to backend
- Success message confirms creation
- User is redirected after posting

---

## 9. System & Navigation

### 9.1 Navigation

**US-051: Navigate Dashboard**
- **As a** user
- **I want to** easily navigate between dashboard sections
- **So that** I can access different features quickly

**Acceptance Criteria:**
- Sidebar shows all main sections
- Active section is highlighted
- Sidebar is collapsible on mobile
- Navigation is responsive
- Icons and labels are clear

**US-052: View Breadcrumbs**
- **As a** user
- **I want to** see my current location in the app
- **So that** I know where I am and can navigate back

**Acceptance Criteria:**
- Breadcrumbs show current path
- Each level is clickable
- Breadcrumbs update on navigation
- Home icon links to dashboard

**US-053: Access User Menu**
- **As a** user
- **I want to** access my account options from anywhere
- **So that** I can quickly log out or access settings

**Acceptance Criteria:**
- User menu is accessible from navbar
- Avatar shows in navbar
- Dropdown shows profile, settings, logout
- Logout ends session and redirects to home

### 9.2 Theme & Preferences

**US-054: Dark Mode**
- **As a** user
- **I want to** use the app in dark mode
- **So that** I can reduce eye strain

**Acceptance Criteria:**
- App uses dark theme by default
- All pages respect theme
- Colors are optimized for readability
- Theme persists across sessions

### 9.3 Loading States

**US-055: View Loading Indicators**
- **As a** user
- **I want to** see loading indicators during data fetches
- **So that** I know the app is working

**Acceptance Criteria:**
- Skeleton loaders shown during initial load
- Spinners shown for actions
- Loading text provides context
- UI remains responsive during loading

**US-056: Error Handling**
- **As a** user
- **I want to** see clear error messages
- **So that** I understand what went wrong

**Acceptance Criteria:**
- Error toasts show for failed actions
- Error messages are descriptive
- Errors don't crash the app
- User can retry failed actions

---

## 10. Legal & Compliance

### 10.1 Legal Pages

**US-057: View Terms of Service**
- **As a** user
- **I want to** read the terms of service
- **So that** I understand the platform rules

**Acceptance Criteria:**
- Terms page is accessible from footer
- Content is well-formatted
- Sections are clearly organized
- Last updated date is shown

**US-058: View Privacy Policy**
- **As a** user
- **I want to** read the privacy policy
- **So that** I understand how my data is used

**Acceptance Criteria:**
- Privacy page is accessible from footer
- Content is well-formatted
- Data practices are clearly explained
- Last updated date is shown

---

## 11. Single Sign-On (SSO)

### 11.1 SSO Integration

**US-059: SSO Authentication**
- **As a** partner application user
- **I want to** authenticate via SSO
- **So that** I can access multiple apps with one login

**Acceptance Criteria:**
- SSO page accepts authorization request
- User is already logged in or prompted to login
- User approves access for partner app
- Authorization token is generated
- User is redirected back to partner app
- Token is valid and secure

---

## Summary Statistics

- **Total User Stories**: 59
- **Feature Areas**: 11
- **Authentication Stories**: 10
- **Dashboard Stories**: 6
- **Security Stories**: 5
- **Wallet Stories**: 4
- **Device Stories**: 4
- **Social Stories**: 12
- **Notification Stories**: 5
- **Content Stories**: 3
- **Navigation Stories**: 6
- **Legal Stories**: 2
- **SSO Stories**: 1

---

## User Story Priority Matrix

### Must Have (P0)
- US-001 to US-010: All authentication flows
- US-011: Dashboard overview
- US-023: Link wallet
- US-027: View devices
- US-043: View notifications

### Should Have (P1)
- US-012 to US-017: Profile management
- US-018 to US-021: 2FA setup
- US-024 to US-026: Wallet management
- US-031 to US-042: Social features
- US-044 to US-047: Notification management

### Could Have (P2)
- US-048 to US-050: Content features
- US-051 to US-056: Navigation & UX
- US-057 to US-058: Legal pages
- US-059: SSO integration

---

**Document Version**: 1.0
**Last Updated**: Based on current codebase analysis
**Framework**: Next.js 15.5.3 with App Router
**Total Features**: 11 major feature areas
