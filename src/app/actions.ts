"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/src/db/db"
import { usersTable } from "@/src/db/schema"

type FormState = { ok: true } | { ok: false; error: string }

export async function createUser(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const age = Number(formData.get("age"))

  if (!name || !email || !Number.isFinite(age) || age < 0) {
    return { ok: false, error: "Name, email, and a valid age are required." }
  }

  try {
    await db.insert(usersTable).values({ name, email, age })
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to insert user into the database."
    return { ok: false, error: message }
  }
}
