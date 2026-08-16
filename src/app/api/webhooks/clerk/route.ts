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

  if (evt.type === "user.deleted") {
    const { id } = evt.data
    if (id) {
      try {
        await db.delete(quranLogs).where(eq(quranLogs.userId, id))
        console.log("Deleted quran logs for user:", id)
      } catch (err) {
        console.error("Failed to delete quran logs:", err)
        return new Response("Failed to delete quran logs", { status: 500 })
      }
    }
  } else {
    console.log("Webhook received:", evt.type)
  }


  return new Response("OK", { status: 200 })
}
