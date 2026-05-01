import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ImmAlert — Monitorizare Firme Romania",
  description:
    "Stii primul cand se schimba ceva la firmele tale. Monitorizare TVA, insolventa, administrator, sediu si mai mult.",
};

export const viewport: Viewport = {
  themeColor: "#0ea5a0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="bg-background">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
