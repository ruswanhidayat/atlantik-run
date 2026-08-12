export type VerifyActivityState = {
  error?: string;
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
    minutes * 60 + seconds;

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

export async function verifyActivityAction(
  _previousState: VerifyActivityState,
  formData: FormData
): Promise<VerifyActivityState> {
  const admin =
    await requireAdminAccess();

  const rawId =
    formData.get("id");

  const rawJarak =
    formData.get("jarak");

  const rawAvgPace =
    formData.get("avgPace");

  const rawElapsedTime =
    formData.get("elapsedTime");

  const rawFeedback =
    formData.get("feedback");

  const rawDecision =
    formData.get("decision");

  if (
    typeof rawId !== "string" ||
    typeof rawJarak !== "string" ||
    typeof rawAvgPace !== "string" ||
    typeof rawElapsedTime !== "string" ||
    typeof rawFeedback !== "string" ||
    typeof rawDecision !== "string"
  ) {
    return {
      error:
        "Data verifikasi tidak lengkap.",
    };
  }

  const id = Number(rawId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return {
      error:
        "ID aktivitas tidak valid.",
    };
  }

  const jarakText =
    rawJarak
      .trim()
      .replace(",", ".");

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      jarakText
    )
  ) {
    return {
      error:
        "Jarak harus berupa angka dengan maksimal 2 angka desimal.",
    };
  }

  const jarak =
    Number(jarakText);

  if (
    !Number.isFinite(jarak) ||
    jarak <= 0
  ) {
    return {
      error:
        "Jarak harus lebih besar dari 0.",
    };
  }

  const avgPaceSeconds =
    parsePace(
      rawAvgPace.trim()
    );

  if (
    avgPaceSeconds === null
  ) {
    return {
      error:
        "Avg. Pace harus menggunakan format menit:detik.",
    };
  }

  const elapsedTimeSeconds =
    parseElapsedTime(
      rawElapsedTime.trim()
    );

  if (
    elapsedTimeSeconds === null
  ) {
    return {
      error:
        "Elapsed Time harus menggunakan format jam:menit:detik.",
    };
  }

  const feedback =
    rawFeedback.trim();

  if (
    rawDecision !== "approve" &&
    rawDecision !== "reject"
  ) {
    return {
      error:
        "Keputusan verifikasi tidak valid.",
    };
  }

  if (
    rawDecision === "reject" &&
    !feedback
  ) {
    return {
      error:
        "Feedback wajib diisi jika aktivitas ditolak.",
    };
  }

  if (
    feedback.length > 500
  ) {
    return {
      error:
        "Feedback maksimal 500 karakter.",
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
      error:
        "Aktivitas tidak ditemukan.",
    };
  }

  const activity = rows[0];

  if (
    Number(activity.status) !== 0
  ) {
    return {
      error:
        "Aktivitas ini sudah pernah diverifikasi.",
    };
  }

  const status =
    rawDecision === "approve"
      ? 1
      : 2;

  await sql`
    UPDATE run_activities
    SET
      jarak = ${jarak},
      avg_pace_seconds = ${avgPaceSeconds},
      elapsed_time_seconds = ${elapsedTimeSeconds},
      feedback = ${
        feedback
          ? feedback
          : null
      },
      status = ${status},
      verified_by = ${admin.nip},
      verified_at = NOW()
    WHERE id = ${id}
      AND status = 0
  `;

  redirect(
    "/admin/activities"
  );
}