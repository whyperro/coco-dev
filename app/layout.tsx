import { Toaster } from "@/components/ui/sonner";
import ClientSessionProvider from "@/providers/AuthProvider";
import QueryClientContextProvider from "@/providers/QueryProvider";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Berkana - Viajes",
  description: "Sistema de Gestión y Control Contable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
