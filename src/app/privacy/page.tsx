import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy · Quran Tracker",
  description:
    "How Quran Tracker collects, uses, and deletes account and check-in data.",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-6 py-10 sm:px-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back
        </Link>
      </div>

      <article className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p>Last updated: October 5, 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">Overview</h2>
          <p>
            Quran Tracker (&ldquo;the app&rdquo;) is a daily Quran reading
            check-in service. This policy explains what information we collect,
            how it is used, and how you can delete it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            Information we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="text-foreground">Account information.</span>{" "}
              Authentication is provided by Clerk. Depending on how you sign up,
              Clerk may process details such as your email address, name, and
              authentication identifiers. See{" "}
              <a
                href="https://clerk.com/legal/privacy"
                className="underline underline-offset-4 hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                Clerk&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-foreground">Timezone.</span> We store your
              chosen IANA timezone in your Clerk account metadata so streaks and
              &ldquo;today&rdquo; follow your local calendar day.
            </li>
            <li>
              <span className="text-foreground">Check-in history.</span> For each
              day you log, we store your user id, the local calendar date
              (YYYY-MM-DD), and when the record was created. We do not store the
              content of what you read.
            </li>
            <li>
              <span className="text-foreground">Theme preference.</span> Light /
              dark mode preference may be saved in your browser (for example via
              local storage). It is not stored in our database.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            How we use information
          </h2>
          <p>We use this information only to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Authenticate you and keep your account secure</li>
            <li>Record and display daily check-ins and streaks</li>
            <li>Apply the correct local calendar day for your timezone</li>
            <li>Operate and maintain the service</li>
          </ul>
          <p>
            We do not sell your personal information. We do not use third-party
            advertising or analytics SDKs in the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            Service providers
          </h2>
          <p>
            The app is hosted on Vercel. Identity is handled by Clerk. Check-in
            records are stored in a Neon Postgres database. These providers
            process data on our behalf to run the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            Retention and deletion
          </h2>
          <p>
            Check-in records are kept while your account exists. If you delete
            your account through Clerk (for example via the account menu in the
            app), we remove your check-in rows from our database when we receive
            Clerk&apos;s account-deletion webhook. Clerk retains or deletes
            identity data according to its own policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">Cookies</h2>
          <p>
            Clerk sets cookies or similar technologies as needed for
            authentication and session management. Theme preference may also use
            browser storage. We do not set advertising cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            Children&apos;s privacy
          </h2>
          <p>
            The app is not directed at children under 13, and we do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">
            Changes to this policy
          </h2>
          <p>
            We may update this policy from time to time. The &ldquo;Last
            updated&rdquo; date at the top will change when we do. Continued use
            of the app after an update means you accept the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-foreground">Contact</h2>
          <p>
            For privacy questions, use the account controls in the app to manage
            or delete your account, or email us at{" "}
            <a
              href="mailto:support@quran-habit.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              support@quran-habit.com
            </a>
            .
          </p>
        </section>
      </article>

      <footer className="mt-auto space-y-5 pt-12 pb-2">
        <div className="h-px w-full bg-border" />
        <p className="text-center text-xs text-muted-foreground">
          <Link
            href="/privacy"
            className="underline-offset-4 hover:text-foreground hover:underline"
            aria-current="page"
          >
            Privacy
          </Link>
        </p>
      </footer>
    </main>
  )
}
