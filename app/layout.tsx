import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
