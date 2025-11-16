import "./globals.css";
import { defaultMetadata } from "@/seo.config";
import type { Metadata, Viewport } from "next";
import { ReduxProvider } from "@/store/ReduxProvider";
import ToastProvider from "@/components/ToastProvider";
import AppKitRootProvider from "@/components/AppKitRootProvider";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AppKitRootProvider>{children}</AppKitRootProvider>
        </ReduxProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
