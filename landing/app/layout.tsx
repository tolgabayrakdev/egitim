import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://adivora.com"), // Production URL'inizi buraya ekleyin
  title: {
    default: "Adivora - Profesyonel Koçluk Yönetim Sistemi",
    template: "%s | Adivora",
  },
  description: "Profesyonel koçlar ve katılımcılar için modern koçluk yönetim platformu. Görev takibi, ilerleme analizi, koçluk ilişkileri yönetimi ve daha fazlası. KVKK uyumlu, güvenli platform.",
  keywords: [
    "adivora",
    "koçluk platformu",
    "koçluk yönetim sistemi",
    "profesyonel koçluk",
    "görev takibi",
    "koçluk ilişkileri",
    "ilerleme analizi",
    "koçluk yazılımı",
    "koçluk uygulaması",
    "dijital koçluk",
    "online koçluk",
  ],
  authors: [{ name: "Adivora" }],
  creator: "Adivora",
  publisher: "Adivora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://adivora.com",
    siteName: "Adivora",
    title: "Adivora - Profesyonel Koçluk Yönetim Sistemi",
    description: "Profesyonel koçlar ve katılımcılar için modern koçluk yönetim platformu. Görev takibi, ilerleme analizi ve daha fazlası.",
    images: [
      {
        url: "/og-image.png", // Open Graph görseli ekleyin
        width: 1200,
        height: 630,
        alt: "Adivora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adivora - Profesyonel Koçluk Yönetim Sistemi",
    description: "Profesyonel koçlar ve katılımcılar için modern koçluk yönetim platformu.",
    images: ["/twitter-image.png"], // Twitter görseli ekleyin
    creator: "@adivora", // Twitter handle'ınızı ekleyin
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
  verification: {
    google: "your-google-verification-code", // Google Search Console verification code
    yandex: "your-yandex-verification-code", // Yandex verification code (opsiyonel)
  },
  alternates: {
    canonical: "https://adivora.com",
    languages: {
      "tr-TR": "https://adivora.com",
    },
  },
  category: "Business",
  classification: "Koçluk Yönetim Platformu",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "application-name": "Adivora",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Adivora",
    "mobile-web-app-capable": "yes",
    "theme-color": "#8b5cf6", // Primary color from theme
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Adivora",
              url: "https://adivora.com",
              logo: "https://adivora.com/logo.png",
              description: "Profesyonel koçlar ve katılımcılar için modern koçluk yönetim platformu",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+90-555-123-45-67",
                contactType: "customer service",
                email: "info@adivora.com",
                availableLanguage: "Turkish",
              },
              sameAs: [
                // Sosyal medya linklerinizi buraya ekleyin
                // "https://twitter.com/adivora",
                // "https://linkedin.com/company/adivora",
              ],
            }),
          }}
        />
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Adivora",
              url: "https://adivora.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://adivora.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
