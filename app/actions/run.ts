"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";

import {
  getCurrentRunDateForUser,
  isDailySubmissionOpenForUser,
  isRecordingStarted,
  isValidRunDate,
} from "@/lib/run-config";

import {
  normalizeStravaInput,
  validateStravaLink,
} from "@/lib/strava";

export type RecordRunState = {
  error?: string;

  values?: {
    tanggal: string;
    waktuMulai: string;
    jarak: string;
    avgPace: string;
    elapsedTime: string;
    tautan: string;
  };
};


function parsePace(
  value: string
): number | null {
  const match =
    value.match(
      /^(\d{1,2}):([0-5]\d)$/
    );

  if (!match) {
    return null;
  }

  const minutes =
    Number(match[1]);

  const seconds =
    Number(match[2]);

  const totalSeconds =
    minutes * 60 +
    seconds;

  return totalSeconds > 0
    ? totalSeconds
    : null;
}


function parseElapsedTime(
  value: string
): number | null {
  const match =
    value.match(
      /^(\d{1,2}):([0-5]\d):([0-5]\d)$/
    );

  if (!match) {
    return null;
  }

  const hours =
    Number(match[1]);

  const minutes =
    Number(match[2]);

  const seconds =
    Number(match[3]);

  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    seconds;

  return totalSeconds > 0
    ? totalSeconds
    : null;
}


function isValidStartTime(
  value: string
) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    value
  );
}


export async function recordRunAction(
  _previousState: RecordRunState,
  formData: FormData
): Promise<RecordRunState> {

  const user =
    await requireUser();


  /*
   * Perekaman belum dimulai.
   *
   * Rule awal tetap dipertahankan:
   * 15 Agustus 2026 pukul 05.00 WIB.
   */
  if (
    !isRecordingStarted()
  ) {
    return {
      error:
        "Perekaman ATLANTIK RUN belum dibuka. Perekaman dimulai 15 Agustus 2026 pukul 05.00 WIB.",
    };
  }


  /*
   * Tanggal efektif user.
   *
   * Untuk user testing, tanggal dapat berasal
   * dari ATLANTIK_BYPASS_DATE di run-config.
   *
   * Untuk user biasa, selalu menggunakan
   * tanggal WIB sebenarnya.
   */
  const currentRunDate =
    getCurrentRunDateForUser(
      user.nip
    );


  /*
   * Perekaman hanya tersedia
   * pada 15–17 Agustus 2026.
   */
  if (
    !currentRunDate
  ) {
    return {
      error:
        "Perekaman ATLANTIK RUN hanya dapat dilakukan pada tanggal 15–17 Agustus 2026.",
    };
  }


  /*
   * Cutoff harian pukul 21.00 WIB.
   *
   * Berlaku hanya untuk submission baru user.
   * Tidak mempengaruhi admin verify/update.
   */
  if (
    !isDailySubmissionOpenForUser(
      user.nip
    )
  ) {
    return {
      error:
        "Perekaman aktivitas hari ini telah ditutup pada pukul 21.00 WIB.",
    };
  }


  const rawTautan =
    formData.get("tautan");

  const rawJarak =
    formData.get("jarak");

  const rawTanggal =
    formData.get("tanggal");

  const rawWaktuMulai =
    formData.get("waktuMulai");

  const rawAvgPace =
    formData.get("avgPace");

  const rawElapsedTime =
    formData.get("elapsedTime");


  if (
    typeof rawTautan !== "string" ||
    typeof rawJarak !== "string" ||
    typeof rawTanggal !== "string" ||
    typeof rawWaktuMulai !== "string" ||
    typeof rawAvgPace !== "string" ||
    typeof rawElapsedTime !== "string"
  ) {
    return {
      error:
        "Data perekaman tidak lengkap.",
    };
  }


  const tautan =
    normalizeStravaInput(
      rawTautan
    );


  const stravaStatus =
    validateStravaLink(
      rawTautan
    );


  const jarakInput =
    rawJarak.trim();


  const jarakText =
    jarakInput.replace(
      ",",
      "."
    );


  const tanggal =
    rawTanggal.trim();


  const waktuMulai =
    rawWaktuMulai.trim();


  const avgPace =
    rawAvgPace.trim();


  const elapsedTime =
    rawElapsedTime.trim();


  const values = {
    tanggal,
    waktuMulai,
    jarak: jarakInput,
    avgPace,
    elapsedTime,
    tautan,
  };


  if (
    !rawTautan.trim()
  ) {
    return {
      error:
        "Tautan aktivitas wajib diisi.",
      values,
    };
  }


  if (
    tautan.length > 500
  ) {
    return {
      error:
        "Tautan aktivitas maksimal 500 karakter.",
      values,
    };
  }


  if (
    stravaStatus === "invalid"
  ) {
    return {
      error:
        "Tautan aktivitas tidak valid. Gunakan link aktivitas Strava.",
      values,
    };
  }


  if (
    stravaStatus === "share-link"
  ) {
    console.info(
      "Menggunakan Strava share link:",
      tautan
    );
  }


  if (
    !isValidRunDate(
      tanggal
    )
  ) {
    return {
      error:
        "Tanggal aktivitas tidak valid.",
      values,
    };
  }


  /*
   * Aktivitas hanya boleh dilaporkan
   * pada tanggal yang sama.
   *
   * Contoh:
   * 15 Agustus → hanya 15 Agustus.
   * 16 Agustus → hanya 16 Agustus.
   * 17 Agustus → hanya 17 Agustus.
   *
   * Validasi dilakukan di server sehingga
   * manipulasi tanggal dari browser tetap ditolak.
   */
  if (
    tanggal !== currentRunDate
  ) {
    return {
      error:
        "Aktivitas hanya dapat direkam pada tanggal yang sama dengan hari pelaporan.",
      values,
    };
  }


  if (
    !isValidStartTime(
      waktuMulai
    )
  ) {
    return {
      error:
        "Waktu mulai harus menggunakan format HH:MM.",
      values,
    };
  }


  if (
    !/^\d+(\.\d{1,2})?$/.test(
      jarakText
    )
  ) {
    return {
      error:
        "Jarak harus berupa angka dengan maksimal 2 angka di belakang koma.",
      values,
    };
  }


  const jarak =
    Number(jarakText);


  if (
    !Number.isFinite(
      jarak
    ) ||
    jarak <= 0
  ) {
    return {
      error:
        "Jarak harus lebih besar dari 0.",
      values,
    };
  }


  const avgPaceSeconds =
    parsePace(
      avgPace
    );


  if (
    avgPaceSeconds === null
  ) {
    return {
      error:
        "Avg. Pace harus menggunakan format menit:detik, contoh 12:58.",
      values,
    };
  }


  const elapsedTimeSeconds =
    parseElapsedTime(
      elapsedTime
    );


  if (
    elapsedTimeSeconds === null
  ) {
    return {
      error:
        "Elapsed Time harus menggunakan format jam:menit:detik, contoh 01:08:04.",
      values,
    };
  }


  const existing =
    await sql`
      SELECT id, status
      FROM run_activities
      WHERE nip = ${user.nip}
        AND tanggal = ${tanggal}::date
        AND status IN (0, 1)
      LIMIT 1
    `;


  if (
    existing.length > 0
  ) {
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
        waktu_mulai,
        avg_pace_seconds,
        elapsed_time_seconds,
        tanggal,
        status
      )
      VALUES (
        ${user.nip},
        ${tautan},
        ${jarak},
        ${waktuMulai}::time,
        ${avgPaceSeconds},
        ${elapsedTimeSeconds},
        ${tanggal}::date,
        0
      )
    `;
  } catch (error) {

    console.error(
      "Gagal merekam aktivitas:",
      error
    );


    return {
      error:
        "Aktivitas gagal direkam. Silakan periksa kembali data atau coba lagi.",
      values,
    };
  }


  redirect(
    "/dashboard?recorded=1"
  );
}