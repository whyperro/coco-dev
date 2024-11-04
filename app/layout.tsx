'use client'

import { Toaster } from "@/components/ui/sonner";
import ClientSessionProvider from "@/providers/AuthProvider";
import QueryClientContextProvider from "@/providers/QueryProvider";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientContextProvider>
    </html>
  );
}
