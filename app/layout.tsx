import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImmAlert — Monitorizare Firme România",
  description:
    "Știi primul când se schimbă ceva la firmele tale. Monitorizare TVA, insolvență, administrator, sediu și mai mult.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
