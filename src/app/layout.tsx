import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientChatbot } from "@/components/layout/ClientChatbot";

const inter = Inter({ subsets: ["latin"], display: "swap" });


export const metadata: Metadata = {
  title: "DJM Audio Productions | Los Angeles Event Sound, DJ & Lighting",
  description:
    "Professional audio, entertainment, and lighting for events of every size in Los Angeles. Over 10 years of experience providing DJ/MC services and equipment rentals.",
  metadataBase: new URL("https://www.djmaudio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DJM Audio Productions | Los Angeles Event Sound & Lighting",
    description: "Professional audio, DJ/MC services, and lighting for events of every size.",
    url: "https://www.djmaudio.com",
    siteName: "DJM Audio Productions",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DJM Audio Productions",
  image: "https://www.djmaudio.com/logo.png",
  "@id": "https://www.djmaudio.com",
  url: "https://www.djmaudio.com",
  telephone: "+16265063824",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Los Angeles",
    addressRegion: "CA",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 34.052235,
    longitude: -118.243683,
  },
  areaServed: {
    "@type": "City",
    name: "Los Angeles",
  },
  sameAs: [
    "https://www.instagram.com/djmaudioproductions",
  ],
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
        <link rel="preconnect" href="https://mawtrnbjfwxqwcdijbzy.supabase.co" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
        <ClientChatbot />
      </body>
    </html>
  );
}
