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
  values?: {
    tanggal: string;
    jarak: string;
    avgPace: string;
    elapsedTime: string;
    tautan: string;
  };
};

function parsePace(value: string): number | null {
  const match = value.match(/^(\d{1,2}):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);

  const totalSeconds = minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : null;
}

function parseElapsedTime(value: string): number | null {
  const match = value.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);

  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    seconds;

  return totalSeconds > 0 ? totalSeconds : null;
}

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
  const rawAvgPace = formData.get("avgPace");
  const rawElapsedTime = formData.get("elapsedTime");

  if (
    typeof rawTautan !== "string" ||
    typeof rawJarak !== "string" ||
    typeof rawTanggal !== "string" ||
    typeof rawAvgPace !== "string" ||
    typeof rawElapsedTime !== "string"
  ) {
    return {
      error: "Data perekaman tidak lengkap.",
    };
  }

  const tautan = rawTautan.trim();
  const jarakInput = rawJarak.trim();
  const jarakText = jarakInput.replace(",", ".");
  const tanggal = rawTanggal.trim();
  const avgPace = rawAvgPace.trim();
  const elapsedTime = rawElapsedTime.trim();

  const values = {
    tanggal,
    jarak: jarakInput,
    avgPace,
    elapsedTime,
    tautan,
  };

  if (!tautan) {
    return {
      error: "Tautan aktivitas wajib diisi.",
      values,
    };
  }

  if (tautan.length > 500) {
    return {
      error: "Tautan aktivitas maksimal 500 karakter.",
      values,
    };
  }

  if (!isValidRunDate(tanggal)) {
    return {
      error: "Tanggal aktivitas tidak valid.",
      values,
    };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(jarakText)) {
    return {
      error:
        "Jarak harus berupa angka dengan maksimal 2 angka di belakang koma.",
      values,
    };
  }

  const jarak = Number(jarakText);

  if (!Number.isFinite(jarak) || jarak <= 0) {
    return {
      error: "Jarak harus lebih besar dari 0.",
      values,
    };
  }

  const avgPaceSeconds = parsePace(avgPace);

  if (avgPaceSeconds === null) {
    return {
      error:
        "Avg. Pace harus menggunakan format menit:detik, contoh 12:58.",
      values,
    };
  }

  const elapsedTimeSeconds =
    parseElapsedTime(elapsedTime);

  if (elapsedTimeSeconds === null) {
    return {
      error:
        "Elapsed Time harus menggunakan format jam:menit:detik, contoh 01:08:04.",
      values,
    };
  }

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
      values,
    };
  }

  try {
    await sql`
      INSERT INTO run_activities (
        nip,
        tautan,
        jarak,
        avg_pace_seconds,
        elapsed_time_seconds,
        tanggal,
        status
      )
      VALUES (
        ${user.nip},
        ${tautan},
        ${jarak},
        ${avgPaceSeconds},
        ${elapsedTimeSeconds},
        ${tanggal}::date,
        0
      )
    `;
  } catch (error) {
    console.error("Gagal merekam aktivitas:", error);

    return {
      error:
        "Aktivitas gagal direkam. Silakan periksa kembali data atau coba lagi.",
      values,
    };
  }

  redirect("/dashboard?recorded=1");
}