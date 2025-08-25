
[Mermaid UI Flow Diagram](https://mermaid.live/edit#pako:eNrtWOlu2zgQfhVCQBcN6tRJmlNYdJE4NlAgiQOrbbArBwYt0TIRWdRSVNJsnHff4SFKlJXjAeofNo_hcObjzDekn7yIxcTzvUXKHqIl5gJ9P59mCH34gH4UhKMRjKMF4-g0iliZCfQHClhEcYpO83yaGdHt7W10wRKaoWucENmVE0U5TzjOl3pKzoRTrxaberdSCqGL61kgYOuPofq53bLDI8ZXYbCUJlCSxoWPSjAqwyvSJytMU_QJ5bgoHhiPa11npRAsK0Lz6xvL-mhCEloIcKqPQHHCBJihF8OIFpo_ohucpkS0TAOXvlYGVW2jX4OgRAdLRiPyNPVuljRaIpIJ_ohyRjPx19R7bhtY6dGrWkrk5LpC62PESQzaAPZia-qttbFBGUWkKLoWVp6urc8K8M4tWlBI9XrIjrximcWryyqSxU6EWPw7g6RpKcSJI2xDZTIb0TQN5ZcNhR5SsdBrh4KWVShPZj8Jp4tHx6p6ZzMLuw5VVKkujbCgDMCvLNlqWDGArAmHmbTvviksswktOFtpmxx5Y8k5iWgBshAmavQepzSu46MWUED_TYq1jcJOiSu2Nht0Yd4OdJXPbejd8w43YsI9g9HsW5aXwrhfnQIaTxyfR7MAbAnll0ZFsNa80qJA0bKm-dpJjeqTcs-oZfBWw9jGUUk7nHGz5RtHMuo4ksESZwlxU2S0eTCjzYOxzrgqwCU98ALqg-vZFXkwjmTkoR3tMH-a0_D0-huKICPRAxVL5XBPSs82pUGbcl8vrMjIxlk7kHS-m-x-heaNhGX65oqa8QMgExLdAeBBMEaplGxQpJmt0QYhKDfhhMSUk0igOYZZCCgmloAGzvPbjpUS_3NcLOcM6xNqu2Qnu92x0-CLK2r9OIcgXjBdoXLOFjQlPhqVAP-VIqYflqKGmqI0WfZk8Sysjit8D0DAN01UONdIaP3qbJRYY4VyMSBC0CyRCJlWW2L4K08ZJ2tkGu15bdC6YvEOlCrN3SBVs4CRI2ghCmbjXDpVhObXR-047yrHRmbYYIxgdhoJnaW6UeNkN1FQVYLuMlO3WpvLuhXMZC80M1WmoHuKEaTTrdbp4NvS-c4S2m2JclEu0dSmu52E0RCoCPARDUrO4Wqg1aCP4-_XNfn9dJgapux4lX0w1ma7nw1iNoLOqjYHWoNdCZl9RtVr9Fd50wSjRXzDBvFdDW90FYF7aCFrRu0UyDWoXjqm6rCkymbdkWIvO68307w4rEtEtchV0eAnJzqceYmD1tqVXDrtulNLzwE2DSGLys3sAi4lofxCD2q--HPO-191hEGSncYyjS7xHcQ6pysMN9E--pGlNLuzKmw-mR1wK630JgqBGyenbtxIlnvV10CYjONwwLIMqLpf0CQzFupMqplmQ0_TWq3JdMJLzO-AYVXnDTXaR7lYt0L98z4bzqCwvFE1DJF2n5mZlDfJhpg9tWH9RAhIC-yhe78OCObwhpAVpJBYjGWpk71O6RGnMhsm5N-SFEIt0EN2pGvVWcogSuUZywWqpzqv7BCUSQL6ZIzVmzQHO3PdGg_AqLZ-XF7rkmnhGc9kJVXl1O-uoOj35_fnHZ-eJT3nOT9--QqhY0-xw9jhuvEm1-moV1mpuE69XrjONE0wrWx1dKg8k0tVI9RJKJ9R71iq6Klxlet4IjlpH25QQ-stN2nUEZrNWZnFfVYK1ahcalcWuNDnAqoJvHaAWYm8reEsIqmrUznzqqmWcMImFbkGnl00DJxLIRIrsJpG-VDY1Jy76G0LNugr7CK6FmSBtsgIVOagT2hVihKncO2QCjrL8TktVhQeQ33tu6ux01yv5yWcxp4veEl63opwoEHoek9SZOpBsKzANh-aKU2WQOTT7BkW5Tj7h7FVtY6zMll6_gKnBfTKPMaCnFMMKNQisB_hA_knn-cfKA2e_-T98vzt_d3Dz8e7x0fHxzsnB7t7BydHPe_R80_2Px8e7xx-2T_4cnh0dHBw8tzz_lOb7n3e2z_Z2T_Z35Piu3t7PQ-eboLxS_1vo_rT8fl_DW5W3Q)
```mermaid
flowchart TD
  %% User Flow for Account & Social App

  %% --- Login Page ---
  subgraph LoginPage["Login Page"]
    LP_Start([Start])
    LP_Form[Show fields: username/email + password]
    LP_Buttons[Buttons: Login / Register / Forgot Password / Login by Wallet]
    LP_Start --> LP_Form --> LP_Buttons

    LP_Choice{"Which entry point?"}
    LP_Buttons --> LP_Choice
    LP_Choice -->|"Login (credentials)"| LoginSuccess
    LP_Choice -->|Register| RegisterPage
    LP_Choice -->|"Forgot Password"| ForgotPassword
    LP_Choice -->|"Login by Wallet"| LoginSuccess
  end

  %% --- Register Page ---
  subgraph RegisterPage["Register Page"]
    R_Fill[Fill username, email, password]
    R_Fill --> R_Verify
  end

  subgraph R_Verify["Email Verification (Register)"]
    R_Code[Enter verification code from email]
    R_Code --> R_Decision{"Code valid?"}
    R_Decision -->|Yes| LP_Start
    R_Decision -->|No| R_Code
  end

  %% --- Forgot Password Flow ---
  subgraph ForgotPassword["Forgot Password Page"]
    F_Input[Enter username OR email]
    F_Send[Send code to email]
    F_Input --> F_Send --> F_Verify
  end

  subgraph F_Verify["Verification (Forgot Password)"]
    F_Code[Enter code]
    F_Code --> F_Decision{"Code valid?"}
    F_Decision -->|Yes| ChangePassword
    F_Decision -->|No| F_Code
  end

  subgraph ChangePassword["Change Password Page"]
    CP_New[Enter new password]
    CP_Api[API call with code, new_password]
    CP_New --> CP_Api --> LP_Start
  end

  %% --- Login Success Page ---
  subgraph LoginSuccess["Login Success Page"]
    LS_Check{"SSO login?"}
    LS_Check -->|Yes| SSOApp[Redirect back to other app]
    LS_Check -->|No| Dashboard
  end

  %% --- Dashboard Page ---
  subgraph Dashboard["Dashboard Page"]
    D_Info[Show profile: Full Name, Username, Email, Wallet, Apps]
    D_Nav{"Navigation?"}
    D_Info --> D_Nav
    D_Nav -->|Settings| Settings
    D_Nav -->|Explore| Explore
    D_Nav -->|Wallet| Wallet
  end

  %% --- Settings Page ---
  subgraph Settings["Settings Page"]
    S_Options[Options: Change Password / Forgot Password / Change Email]
    S_Action{"Action?"}
    S_Options --> S_Action
    S_Action -->|"Change Password"| S_Pass[Change password via API] --> Settings
    S_Action -->|"Forgot Password"| ForgotPassword
    S_Action -->|"Change Email"| VerifyEmail
  end

  subgraph VerifyEmail["Verify Current Email (OTP)"]
    V_Input[Enter OTP]
    V_Check{"OTP valid?"}
    V_Input --> V_Check
    V_Check -->|Yes| ChangeEmail
    V_Check -->|No| V_Input
  end

  subgraph ChangeEmail["Change Email Page"]
    CE_New[Enter NEW email & send OTP]
    CE_Code[Enter OTP from new email]
    CE_Check{"OTP valid?"}
    CE_New --> CE_Code --> CE_Check
    CE_Check -->|Yes| Settings
    CE_Check -->|No| CE_New
  end

  %% --- Wallet Page ---
  subgraph Wallet["Wallet Page"]
    W_List[List wallets<br/>Actions: Add / Make Primary / Unlink]
    W_Action{"Wallet action?"}
    W_List --> W_Action
    W_Action -->|"Add Wallet"| W_Add[Connect/sign wallet] --> Wallet
    W_Action -->|"Make Primary"| W_Primary[Mark primary] --> Wallet
    W_Action -->|Unlink| W_Unlink[Unlink wallet] --> Wallet
    W_Action -->|Back| Dashboard
  end

  %% --- Explore Page ---
  subgraph Explore["Explore Page"]
    E_Choice{"Section?"}
    E_Choice -->|"Search Users"| OtherUser
    E_Choice -->|"Friend Requests"| FriendRequests
    E_Choice -->|"Block List"| BlockList
    E_Choice -->|"Friend Suggestions"| FriendSuggestions
  end

  subgraph OtherUser["Other User Profile"]
    O_Show[Show: Name, Username, Email                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        , Primary Wallet]
    O_Action{"Action?"}
    O_Show --> O_Action
    O_Action -->|"Add Friend"| O_Add[Send request] --> OtherUser
    O_Action -->|Block| O_Block[Block user] --> OtherUser
    O_Action -->|Back| Explore
  end

  subgraph FriendRequests["Friend Requests Page"]
    FR_List[List inbound/outbound requests<br/>Actions: Accept / Decline / Cancel]
    FR_List --> Explore
  end

  subgraph BlockList["Block List Page"]
    BL_List[List blocked users<br/>Action: Unblock]
    BL_List --> Explore
  end

  subgraph FriendSuggestions["Friend Suggestions Page"]
    FS_List[Suggested users + mutual friends<br/>Actions: Add / Dismiss / Block]
    FS_List --> Explore
  end

```