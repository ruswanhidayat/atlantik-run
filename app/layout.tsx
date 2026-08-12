import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans, Rammetto_One } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const rammettoOne = Rammetto_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rammetto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATLANTIK RUN",
  description: "Portal pelaporan dan leaderboard ATLANTIK RUN 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${openSans.variable} ${rammettoOne.variable}`}>
        {children}
      </body>
    </html>
  );
}
