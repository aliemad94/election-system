import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/election/toastprovider";
import { ExplanationModalProvider } from "@/context/ExplanationModalContext";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata: Metadata = {
  title: "منصة إدارة الماكينة الانتخابية المركزية",
  description: "Central Election Campaign Management System - منصة إدارة الماكينة الانتخابية المركزية",
  keywords: ["election", "campaign", "management", "إدارة", "انتخابات", "ماكينة"],
  authors: [{ name: "Election Management Team" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </head>
      <body className={`${ibmPlexSansArabic.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ExplanationModalProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </ExplanationModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


