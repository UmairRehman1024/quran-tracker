import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { ClerkProvider, Show, SignInButton, SignUpButton } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
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
            <Show when="signed-out">
              <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    Quran Tracker
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Check in once a day. Streaks follow your local calendar.
                  </p>
                </div>
                <div className="flex gap-3">
                  <SignInButton>
                    <Button variant="outline" size="lg">
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="lg">Sign up</Button>
                  </SignUpButton>
                </div>
              </main>
            </Show>

            <Show when="signed-in">{children}</Show>
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
