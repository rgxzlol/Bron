import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-family",
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bron",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${urbanist.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
