import type { Metadata } from "next";
import { Lora, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import QueryProvider from "@/lib/queryProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const CompanyProfile = {
  name: "Pempek Cek Emmy",
  logoUrl: "/Cek_Emmy-logo-clean.png",
};

export const metadata: Metadata = {
  title: "Pempek Cek Emmy",
  icons: {
    icon: CompanyProfile.logoUrl,
  },
  description: "Website Kedai Pempek Cek Emmy Khas Palembang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            // disableTransitionOnChange
          >
            <TooltipProvider>
              <SidebarProvider
                defaultOpen={true}
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                <AppSidebar
                  name={CompanyProfile.name}
                  logoUrl={CompanyProfile.logoUrl}
                  props={{ variant: "sidebar" }}
                />
                <SidebarInset>
                  <SiteHeader
                    name={CompanyProfile.name}
                    logoUrl={CompanyProfile.logoUrl}
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {children}
                        <Toaster
                          position="bottom-left"
                          richColors
                          closeButton
                        />
                      </div>
                    </div>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
