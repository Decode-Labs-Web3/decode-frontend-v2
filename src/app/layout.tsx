import "./globals.css";
import type { Metadata } from "next";
import AppKitProvider from "@/app/providers/appkit";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Decode Protocol",
  description:
    "Decode Protocol - Secure Authentication and Identity Management",
  icons: {
    icon: "/images/tokens/3d_token_nobg.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>{children}</AppKitProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
