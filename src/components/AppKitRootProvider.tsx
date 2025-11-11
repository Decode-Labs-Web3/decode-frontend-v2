"use client";

import { ReactNode } from "react";
import { AppKitProvider } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

type Props = { children: ReactNode };

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
if (!projectId) console.error("REOWN_PROJECT_ID is missing");

const appUrl =
  process.env.PUBLIC_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://decode.decodenetwork.app"
    : "http://localhost:3000");

const metadata = {
  name: "Decode Protocol",
  description:
    "Decode Protocol - Secure Authentication and Identity Management",
  url: appUrl,
  icons: ["/images/tokens/3d_token_nobg.png"],
};

export default function AppKitRootProvider({ children }: Props) {
  return (
    <AppKitProvider
      adapters={[new EthersAdapter()]}
      networks={[mainnet, arbitrum]}
      defaultNetwork={mainnet}
      projectId={projectId}
      metadata={metadata}
      features={{
        analytics: true,
        email: false,
        socials: [],
        emailShowWallets: false,
      }}
      themeMode="dark"
      themeVariables={{
        "--w3m-font-family": "system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </AppKitProvider>
  );
}
