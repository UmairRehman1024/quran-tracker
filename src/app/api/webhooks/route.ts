import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextRequest } from "next/server"

import { db } from "@/db/db"
import { users } from "@/db/schema"

export async function POST(req: NextRequest) {
  let evt

  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Verification failed", { status: 400 })
  }

  if (evt.type === "user.created") {
    const { id } = evt.data

    try {
      await db
        .insert(users)
        .values({ id, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
        .onConflictDoNothing({ target: users.id })
      console.log("User created from webhook:", id)
    } catch (err) {
      console.error("Failed to create user from webhook:", err)
      return new Response("Database error", { status: 500 })
    }
  }

  return new Response("OK", { status: 200 })
}
