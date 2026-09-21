import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nobz — Play. Analyze. Improve.",
  description: "League of Legends player statistics, performance analytics, and actionable coaching.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
