"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  isSubmissionOpen,
  isValidRunDate,
} from "@/lib/run-config";

export type RecordRunState = {
  error?: string;
};

export async function recordRunAction(
  _previousState: RecordRunState,
  formData: FormData
): Promise<RecordRunState> {
  const user = await requireUser();

  if (!isSubmissionOpen()) {
    return {
      error:
        "Perekaman ATLANTIK RUN telah ditutup pada 20 Agustus 2026 pukul 23.59 WIB.",
    };
  }

  const rawTautan = formData.get("tautan");
  const rawJarak = formData.get("jarak");
  const rawTanggal = formData.get("tanggal");

  if (
    typeof rawTautan !== "string" ||
    typeof rawJarak !== "string" ||
    typeof rawTanggal !== "string"
  ) {
    return {
      error: "Data perekaman tidak lengkap.",
    };
  }

  const tautan = rawTautan.trim();
  const jarakText = rawJarak.trim().replace(",", ".");
  const tanggal = rawTanggal.trim();

  if (!tautan) {
    return {
      error: "Tautan aktivitas wajib diisi.",
    };
  }

  if (tautan.length > 500) {
    return {
      error: "Tautan aktivitas maksimal 500 karakter.",
    };
  }

  if (!isValidRunDate(tanggal)) {
    return {
      error: "Tanggal aktivitas tidak valid.",
    };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(jarakText)) {
    return {
      error:
        "Jarak harus berupa angka dengan maksimal 2 angka di belakang koma.",
    };
  }

  const jarak = Number(jarakText);

  if (!Number.isFinite(jarak) || jarak <= 0) {
    return {
      error: "Jarak harus lebih besar dari 0.",
    };
  }

  /*
   * Cek apakah user sudah mempunyai aktivitas aktif
   * untuk tanggal tersebut.
   *
   * Pending  = 0
   * Approved = 1
   *
   * Rejected tidak menghalangi submission ulang.
   */
  const existing = await sql`
    SELECT id, status
    FROM run_activities
    WHERE nip = ${user.nip}
      AND tanggal = ${tanggal}::date
      AND status IN (0, 1)
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      error:
        "Kamu sudah memiliki perekaman aktif untuk tanggal tersebut.",
    };
  }

  try {
    await sql`
      INSERT INTO run_activities (
        nip,
        tautan,
        jarak,
        tanggal,
        status
      )
      VALUES (
        ${user.nip},
        ${tautan},
        ${jarak},
        ${tanggal}::date,
        0
      )
    `;
  } catch (error) {
    /*
     * Database juga memiliki unique partial index.
     * Ini menjadi lapisan pengaman apabila terjadi
     * double-click / concurrent request.
     */
    console.error("Gagal merekam aktivitas:", error);

    return {
      error:
        "Aktivitas gagal direkam. Silakan periksa kembali data atau coba lagi.",
    };
  }

  redirect("/dashboard?recorded=1");
}