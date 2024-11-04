'use client'

import { Toaster } from "@/components/ui/sonner";
import ClientSessionProvider from "@/providers/AuthProvider";
import QueryClientContextProvider from "@/providers/QueryProvider";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { lazy, Suspense, useEffect, useState } from "react";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });


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
    // @ts-expect-error: El módulo se carga dinámicamente y puede que no esté disponible en build
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
