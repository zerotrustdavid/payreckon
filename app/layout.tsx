import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://payreckon.co.uk"),
  title: {
    default: "PayReckon — UK contractor and salary take-home calculators",
    template: "%s | PayReckon",
  },
  description:
    "Compare take-home pay inside IR35 through an umbrella company, outside IR35 through a limited company, and on a permanent salary. Precise HMRC methodology, three tax years.",
  keywords: [
    "IR35 calculator",
    "umbrella company calculator",
    "limited company calculator",
    "contractor take home pay",
    "PAYE salary calculator",
  ],
  openGraph: {
    title: "PayReckon — UK contractor and salary take-home calculators",
    description:
      "Work out what you actually keep, whichever way you contract. Inside IR35, outside IR35 and permanent salary, calculated to HMRC methodology.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
