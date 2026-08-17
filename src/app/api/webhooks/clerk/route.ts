import { eq } from "drizzle-orm"
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { db } from "@/db/db"
import { quranLogs } from "@/db/schema"

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Verification failed", { status: 400 })
  }

  if (evt.type !== "user.deleted") {
    console.warn("Ignoring Clerk webhook", { type: evt.type })
    return new Response("OK", { status: 200 })
  }

  const { id } = evt.data
  if (!id) {
    console.error("user.deleted webhook missing id", { data: evt.data })
    return new Response("OK", { status: 200 })
  }

  try {
    await db.delete(quranLogs).where(eq(quranLogs.userId, id))
    console.log(`Deleted quran_logs for user ${id}`)
  } catch (err) {
    console.error("Failed to delete quran_logs:", err)
    return new Response("Failed to delete quran logs", { status: 500 })
  }

  return new Response("OK", { status: 200 })
}
