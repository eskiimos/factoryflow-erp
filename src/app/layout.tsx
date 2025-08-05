import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "FactoryFlow ERP - Система управления материалами",
  description: "Современная система управления материалами с интуитивным интерфейсом",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <TooltipProvider>
            <div className="flex min-h-screen bg-slate-50">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
