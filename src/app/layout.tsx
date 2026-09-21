import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DJM Audio 3D Builder",
  description: "Interactively piece together your ideal audio and lighting configuration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-gray-50 dark:bg-slate-950`}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
