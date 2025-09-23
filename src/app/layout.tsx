import "./globals.css";
import type { Metadata } from "next";
import { defaultMetadata } from "@/seo.config";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
