"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, arbitrum } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
if (!projectId) console.error("REOWN_PROJECT_ID is missing");

const metadata = {
  name: "Decode Protocol",
  description:
    "Decode Protocol - Secure Authentication and Identity Management",
  url: "http://localhost:3000",
  icons: ["/images/tokens/3d_token_nobg.png"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  projectId,
  metadata,
  features: { analytics: true },
  themeMode: "light",
  themeVariables: {
    "--w3m-font-family": "system-ui, -apple-system, sans-serif",
  },
});

export default function AppKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
