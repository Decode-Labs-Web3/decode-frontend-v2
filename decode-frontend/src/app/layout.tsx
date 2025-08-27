import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decode App",
  description: "Your App Description",
  icons: {
    icon: "/public/assets/3d_token_nobg.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
