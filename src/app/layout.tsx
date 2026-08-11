import { Geist_Mono, Inter } from "next/font/google"
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs"

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
              <main className="flex min-h-svh items-center justify-center gap-3 p-4">
                <SignInButton>
                  <Button variant="outline" size="lg">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="lg">Sign up</Button>
                </SignUpButton>
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
