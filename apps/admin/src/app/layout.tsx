import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mediverse Admin — Content Management",
  description:
    "Admin panel for managing Mediverse content, questions, and ingestion pipelines.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
