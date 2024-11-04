'use client'

import { Toaster } from "@/components/ui/sonner";
import QueryClientContextProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "@/providers/AuthProvider";
import { Metadata } from "next";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useEffect, useState } from "react";

const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

// export const metadata: Metadata = {
//   title: "Berkana - Viajes",
//   description: "Sistema de Gestión y Control Contable",
// };


const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <html lang="en">
      <QueryClientContextProvider>
        <ClientSessionProvider>
          <body className={`${poppins.className} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <main>
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </body>
        </ClientSessionProvider>
        <ReactQueryDevtools initialIsOpen />
        {showDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtoolsProduction />
          </Suspense>
        )}
      </QueryClientContextProvider>
    </html>
  );
}
