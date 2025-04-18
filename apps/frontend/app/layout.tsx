import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
        variables: { colorPrimary: "#624cf5" },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
            <footer className="py-6 border-t">
              <div className="container text-center text-sm text-gray-500">
                © 2025 SecureVote. All rights reserved.
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
