import { Geist_Mono, Inter } from "next/font/google"
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/src/components/theme-provider"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

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

            <Show when="signed-in">
              <header className="flex h-16 items-center justify-end gap-4 p-4">
                <UserButton />
              </header>
              <main className="p-4">{children}</main>
            </Show>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
