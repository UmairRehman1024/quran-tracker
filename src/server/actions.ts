"use server";

import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import { quranLogs } from "../db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

//adds new quran log for a user
export async function addQuranLog() {

    //check auth
    await auth.protect()

    const user = await currentUser()

    if (!user) {
        console.error("User not found");
        return { ok: false as const, error: "user_not_found" };
    }

    const existingLog = await db.select().from(quranLogs).where(and(eq(quranLogs.userId, user.id), eq(quranLogs.date, new Date().toISOString())));
    if (existingLog.length > 0) {
        console.error("Quran log already exists for this user/date");
        return { ok: false as const, error: "already_exists" };
    }

    await db.insert(quranLogs).values({
        userId: user.id,
        date: new Date().toISOString(),
    });
    return { ok: true as const };
}

//gets all quran logs for a user
    export async function getQuranLogs() {
    await auth.protect()

    const user = await currentUser()

    if (!user) {
        console.error("User not found");
        return { ok: false as const, error: "user_not_found" };
    }

    const logs = await db.select().from(quranLogs).where(eq(quranLogs.userId, user.id));
    return { ok: true as const, logs };
}