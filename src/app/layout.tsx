import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevForge — Free Online Developer Tools & Tutorials",
    template: "%s | DevForge",
  },
  description:
    "Free online developer tools and IT tutorials. JSON formatter, Base64 encoder, JWT decoder, regex tester, UUID generator, and 30+ guides on networking, security, DevOps, and more. No signup required.",
  keywords:
    "developer tools, json formatter, base64 encode, jwt decoder, regex tester, uuid generator, online tools, free tools, developer tutorials, IT guides, devops tutorials",
  metadataBase: new URL("https://devforge.tools"),
  openGraph: {
    siteName: "DevForge",
    type: "website",
    url: "https://devforge.tools",
    title: "DevForge — Free Online Developer Tools & Tutorials",
    description:
      "Free online developer tools and IT tutorials. JSON formatter, Base64 encoder, JWT decoder, and more. No signup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevForge — Free Online Developer Tools & Tutorials",
    description:
      "Free online developer tools and IT tutorials. No signup required.",
  },
  alternates: {
    canonical: "https://devforge.tools",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-6534388008809310" />
        {/* Request non-personalized ads before AdSense loads to minimize third-party cookies */}
        <script
          dangerouslySetInnerHTML={{
            __html: "(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;",
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6534388008809310"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DevForge",
              url: "https://devforge.tools",
              description:
                "Free online developer tools and IT tutorials. No signup required.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://devforge.tools/tutorials?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
