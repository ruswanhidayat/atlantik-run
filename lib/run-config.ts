export const RUN_DATES = [
  {
    value: "2026-08-15",
    label: "15 Agustus 2026",
  },
  {
    value: "2026-08-16",
    label: "16 Agustus 2026",
  },
  {
    value: "2026-08-17",
    label: "17 Agustus 2026",
  },
] as const;

export const RECORDING_START =
  "2026-08-15T05:00:00+07:00";

export const SUBMISSION_DEADLINE =
  "2026-08-18T21:00:00+07:00";

// TEMPORARY — simulasi kondisi pelaporan sudah ditutup.
// Setelah testing selesai, ubah menjadi null.
const RECORD_CLOSED_TEST_NIP: string | null =
  "921102040";

export type RunDate = (typeof RUN_DATES)[number]["value"];

export function isValidRunDate(
  value: string
): value is RunDate {
  return RUN_DATES.some((date) => date.value === value);
}

export function isSubmissionOpen() {
  return new Date().getTime() <= new Date(SUBMISSION_DEADLINE).getTime();
}

export function isSubmissionOpenForUser(
  nip: string
) {
  const isClosedTestUser =
    RECORD_CLOSED_TEST_NIP !== null &&
    nip.trim() === RECORD_CLOSED_TEST_NIP;

  if (isClosedTestUser) {
    return false;
  }

  return isSubmissionOpen();
}

export function isRecordingStarted() {
  return (
    new Date().getTime() >=
    new Date(RECORDING_START).getTime()
  );
}

export function isFinalReportingDay(
  now = new Date()
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  return (
    formatter.format(now) ===
    "2026-08-18"
  );
}

export function isCompetitionLive(
  now = new Date()
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(now);

  const getPart = (
    type: Intl.DateTimeFormatPartTypes
  ) =>
    parts.find(
      (part) => part.type === type
    )?.value ?? "";

  const date =
    `${getPart("year")}-` +
    `${getPart("month")}-` +
    `${getPart("day")}`;

  const hour =
    Number(getPart("hour"));

  const minute =
    Number(getPart("minute"));

  const competitionDates = [
    "2026-08-15",
    "2026-08-16",
    "2026-08-17",
  ];

  if (
    !competitionDates.includes(date)
  ) {
    return false;
  }

  const currentMinutes =
    hour * 60 + minute;

  const startMinutes =
    5 * 60;

  const endMinutes =
    20 * 60;

  return (
    currentMinutes >= startMinutes &&
    currentMinutes <= endMinutes
  );
}