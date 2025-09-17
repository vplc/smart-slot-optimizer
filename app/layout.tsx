import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OverbookIQ",
  description: "Optimize appointment overbooking and reminders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
