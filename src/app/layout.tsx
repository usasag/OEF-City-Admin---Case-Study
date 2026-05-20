import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OEF City Climate Action Tracker",
  description: "Track and visualize city climate action progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
