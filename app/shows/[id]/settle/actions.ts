"use server";

import { db } from "@/db";
import { settlements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitSettlement(showId: string) {
  const existing = await db
    .select()
    .from(settlements)
    .where(eq(settlements.showId, showId))
    .limit(1);

  const now = new Date();

  if (existing.length > 0 && existing[0].status === "draft") {
    await db
      .update(settlements)
      .set({ status: "submitted", submittedAt: now })
      .where(eq(settlements.showId, showId));
  } else if (existing.length === 0) {
    await db.insert(settlements).values({
      id: `settlement_${showId}_${Date.now()}`,
      showId,
      status: "submitted",
      draftedAt: now,
      submittedAt: now,
    });
  }

  revalidatePath(`/shows/${showId}/settle`);
}
