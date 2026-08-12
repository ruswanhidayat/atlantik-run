"use server";

import { redirect } from "next/navigation";

import { sql } from "@/lib/db";
import {
  createSession,
  deleteSession,
} from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawNip = formData.get("nip");

  if (typeof rawNip !== "string") {
    return {
      error: "NIP wajib diisi.",
    };
  }

  const nip = rawNip.trim();

  if (!/^\d{9}$/.test(nip)) {
    return {
      error: "NIP harus terdiri dari 9 digit.",
    };
  }

  const users = await sql`
    SELECT nip
    FROM users
    WHERE nip = ${nip}
    LIMIT 1
  `;

  if (users.length === 0) {
    return {
      error: "NIP tidak terdaftar.",
    };
  }

  await createSession(nip);

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();

  redirect("/login");
}