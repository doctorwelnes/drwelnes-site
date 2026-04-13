import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

const interFont = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dr.Welnes — Твой гид по здоровью и фитнесу",
    template: "%s | Dr.Welnes",
  },
  description:
    "Рецепты, тренировки и полезные статьи для твоего прогресса. Твой личный помощник в мире здорового образа жизни.",
  metadataBase: new URL("https://dr-welnes.ru"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Dr.Welnes",
    description: "Твой гид по здоровью и фитнесу",
    url: "https://dr-welnes.ru",
    siteName: "Dr.Welnes",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo-new.png",
    apple: "/logo-new.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${interFont.variable} ${outfitFont.variable}`}>
      <body className="antialiased font-sans">
        <Providers>
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
