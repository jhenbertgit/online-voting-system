import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { WagmiProvider } from "@/components/shared/WagmiProvider";
import { ElectionsProvider } from "@/contexts/electionsContext";
import { ContractProvider } from "@/contexts/contractContext";
import LayoutWithConditionalSiteChrome from "@/components/shared/LayoutWithConditionalSiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Vote",
  description:
    "Cast your vote from anywhere with blockchain-verified security and real-time results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#624cf5",
          fontFamily: geistSans.variable,
        },
        elements: {
          footer: "hidden",
        },
      }}
    >
      <WagmiProvider>
        <ElectionsProvider>
          <ContractProvider>
            <html lang="en">
              <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              >
                <LayoutWithConditionalSiteChrome>
                  {children}
                </LayoutWithConditionalSiteChrome>
                <Toaster richColors position="top-right" />
              </body>
            </html>
          </ContractProvider>
        </ElectionsProvider>
      </WagmiProvider>
    </ClerkProvider>
  );
}
