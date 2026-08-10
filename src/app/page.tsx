import { desc } from "drizzle-orm"

import { DbTestForm } from "@/src/app/db-test-form"
import { db } from "@/src/db/db"
import { usersTable } from "@/src/db/schema"

export default async function Page() {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.id))

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full max-w-md min-w-0 flex-col gap-8 text-sm leading-loose">
        <div>
          <h1 className="font-medium">DB smoke test</h1>
          <p className="text-muted-foreground">
            Add a user to confirm Neon + Drizzle are wired up.
          </p>
        </div>

        <DbTestForm />

        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Users ({users.length})</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 font-mono text-xs">
              {users.map((user) => (
                <li key={user.id} className="border-b border-border pb-2">
                  #{user.id} · {user.name} · {user.email} · age {user.age}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
