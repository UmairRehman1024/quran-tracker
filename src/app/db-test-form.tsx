"use client"

import { useActionState } from "react"

import { createUser } from "@/src/app/actions"
import { Button } from "@/src/components/ui/button"

type FormState = { ok: true } | { ok: false; error: string }

export function DbTestForm() {
  const [state, formAction, pending] = useActionState(createUser, {
    ok: true,
  } satisfies FormState)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Name</span>
        <input
          name="name"
          required
          className="h-8 rounded-lg border border-border bg-background px-2.5 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Email</span>
        <input
          name="email"
          type="email"
          required
          className="h-8 rounded-lg border border-border bg-background px-2.5 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Age</span>
        <input
          name="age"
          type="number"
          min={0}
          required
          className="h-8 rounded-lg border border-border bg-background px-2.5 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add user"}
      </Button>
      {!state.ok ? (
        <p className="text-destructive" aria-live="polite">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
