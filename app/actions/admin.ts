"use server";

import { redirect } from "next/navigation";

import {
  requireAdminUser,
  requireAdminAccess,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  clearAdminAuthenticated,
  setAdminAuthenticated,
} from "@/lib/session";

export type AdminLoginState = {
  error?: string;
};

export async function adminLoginAction(
  _previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  await requireAdminUser();

  const rawPassword = formData.get("password");

  if (typeof rawPassword !== "string") {
    return {
      error: "Password admin wajib diisi.",
    };
  }

  const password = rawPassword.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return {
      error:
        "ADMIN_PASSWORD belum dikonfigurasi.",
    };
  }

  if (password !== adminPassword) {
    return {
      error: "Password admin salah.",
    };
  }

  await setAdminAuthenticated();

  redirect("/admin/activities");
}

export async function adminLogoutAction() {
  await clearAdminAuthenticated();

  redirect("/dashboard");
}

export type VerifyActivityState = {
  error?: string;
};

export async function verifyActivityAction(
  _previousState: VerifyActivityState,
  formData: FormData
): Promise<VerifyActivityState> {
  const admin = await requireAdminAccess();

  const rawId = formData.get("id");
  const rawJarak = formData.get("jarak");
  const rawFeedback = formData.get("feedback");
  const rawDecision = formData.get("decision");

  if (
    typeof rawId !== "string" ||
    typeof rawJarak !== "string" ||
    typeof rawFeedback !== "string" ||
    typeof rawDecision !== "string"
  ) {
    return {
      error: "Data verifikasi tidak lengkap.",
    };
  }

  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return {
      error: "ID aktivitas tidak valid.",
    };
  }

  const jarakText =
    rawJarak.trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(jarakText)) {
    return {
      error:
        "Jarak harus berupa angka dengan maksimal 2 angka desimal.",
    };
  }

  const jarak = Number(jarakText);

  if (!Number.isFinite(jarak) || jarak <= 0) {
    return {
      error: "Jarak harus lebih besar dari 0.",
    };
  }

  const feedback = rawFeedback.trim();

  if (
    rawDecision !== "approve" &&
    rawDecision !== "reject"
  ) {
    return {
      error: "Keputusan verifikasi tidak valid.",
    };
  }

  if (rawDecision === "reject" && !feedback) {
    return {
      error:
        "Feedback wajib diisi jika aktivitas ditolak.",
    };
  }

  if (feedback.length > 500) {
    return {
      error: "Feedback maksimal 500 karakter.",
    };
  }

  const rows = await sql`
    SELECT id, status
    FROM run_activities
    WHERE id = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return {
      error: "Aktivitas tidak ditemukan.",
    };
  }

  const activity = rows[0];

  if (Number(activity.status) !== 0) {
    return {
      error:
        "Aktivitas ini sudah pernah diverifikasi.",
    };
  }

  const status =
    rawDecision === "approve" ? 1 : 2;

  await sql`
    UPDATE run_activities
    SET
      jarak = ${jarak},
      feedback = ${
        feedback ? feedback : null
      },
      status = ${status},
      verified_by = ${admin.nip},
      verified_at = NOW()
    WHERE id = ${id}
      AND status = 0
  `;

  redirect("/admin/activities");
}