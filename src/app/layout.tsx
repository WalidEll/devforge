import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalNavbar from "@/components/navigation/GlobalNavbar";
import Footer from "@/components/Footer";
import { SITE_URL, absoluteUrl } from "@/lib/site";
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
    "Free cloud engineering tutorials and browser-based developer tools for GCP, Kubernetes, Terraform, and DevOps. No signup required.",
  keywords:
    "developer tools, json formatter, base64 encode, jwt decoder, regex tester, uuid generator, online tools, free tools, developer tutorials, IT guides, devops tutorials",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "DevForge",
    type: "website",
    url: absoluteUrl("/"),
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
    canonical: absoluteUrl("/"),
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
        <meta name="google-adsense-account" content="ca-pub-2011454284047011" />
        <meta name="msvalidate.01" content="A29B579C5E1DB36AACE94D9DF165393E" />
        {/* Request non-personalized ads before AdSense loads to minimize third-party cookies */}
        <script
          dangerouslySetInnerHTML={{
            __html: "(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;",
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2011454284047011"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "DevForge",
                url: absoluteUrl("/"),
                description:
                  "Cloud engineering tutorials and free browser tools for GCP, Kubernetes, Terraform, and DevOps.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: absoluteUrl("/tutorials?q={search_term_string}"),
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "DevForge",
                url: absoluteUrl("/"),
                logo: absoluteUrl("/favicon.ico"),
                description:
                  "DevForge is a free cloud engineering learning platform providing GCP, Kubernetes, Terraform, and DevOps tutorials alongside 40+ browser-based developer tools.",
                sameAs: [],
              },
            ]),
          }}
        />
        <GlobalNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
