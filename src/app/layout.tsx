import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { AuthShell } from "@/components/auth-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import { Toaster } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Quran Tracker",
  description: "Daily Quran reading check-in with timezone-aware streaks.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <ClerkProvider>
            <AuthShell>{children}</AuthShell>
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
