import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KeycloakProvider } from "@/components/KeycloakProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Freelance Marketplace | Premium Platform",
  description: "The ultimate platform for freelancers and clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}
