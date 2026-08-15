// app/actions/session.ts
"use server";

import { refreshSession } from "@/lib/session";

export async function refreshSessionAction() {
  await refreshSession();
}