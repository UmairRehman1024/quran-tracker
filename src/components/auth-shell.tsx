"use client"

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

const PUBLIC_PATHS = ["/privacy"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showPublicPage = isPublicPath(pathname)

  return (
    <>
      <Show when="signed-out">
        {showPublicPage ? (
          children
        ) : (
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
            <footer className="pt-4">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Privacy
              </Link>
            </footer>
          </main>
        )}
      </Show>

      <Show when="signed-in">{children}</Show>
    </>
  )
}
