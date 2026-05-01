import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "ImmAlert — Monitorizare Firme Romania",
  description:
    "Știi primul când se schimbă ceva la firmele tale. Monitorizare TVA, insolvență, administrator, sediu și mai mult.",
};

export const viewport: Viewport = {
  themeColor: "#1abc9c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${inter.variable} ${manrope.variable} bg-background`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans text-on-surface bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
