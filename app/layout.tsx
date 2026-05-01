import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "ImmAlert — Monitorizare Firme Romania",
  description:
    "Stii primul cand se schimba ceva la firmele tale. Monitorizare TVA, insolventa, administrator, sediu si mai mult.",
};

export const viewport: Viewport = {
  themeColor: "#006b58",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="bg-background">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
