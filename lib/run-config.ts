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
  "2026-08-17T21:00:00+07:00";

// TEMPORARY — simulasi kondisi pelaporan sudah ditutup.
// Setelah testing selesai, ubah menjadi null.
const ATLANTIK_TEST_NIP: string | null =
  // "921102040";
  null;

const ATLANTIK_BYPASS_DATE: string | null =
  null;
// contoh testing:
// "2026-08-15";

const ATLANTIK_BYPASS_TIME: string | null =
  null;
// contoh testing:
// "20:30";

const RECORD_CLOSED_TEST_NIP: string | null =
  // "921102040";
  null;

const LAST_REPORT_DAY_TEST_NIP: string | null =
  // "921102040";
  null;

export type RunDate = (typeof RUN_DATES)[number]["value"];

export function getAtlantikRuntime(
  nip?: string,
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

  const realDate =
    `${getPart("year")}-` +
    `${getPart("month")}-` +
    `${getPart("day")}`;

  const realTime =
    `${getPart("hour")}:` +
    `${getPart("minute")}`;

  const isTestUser =
    ATLANTIK_TEST_NIP !== null &&
    nip?.trim() === ATLANTIK_TEST_NIP;

  const hasTimeBypass =
    isTestUser &&
    ATLANTIK_BYPASS_TIME !== null;

  const date =
    isTestUser &&
    ATLANTIK_BYPASS_DATE !== null
      ? ATLANTIK_BYPASS_DATE
      : realDate;

  const time =
    hasTimeBypass
      ? ATLANTIK_BYPASS_TIME
      : realTime;

  const [hour, minute] =
    time.split(":").map(Number);

  return {
    isTestUser,
    hasTimeBypass,
    date,
    time,
    hour,
    minute,
    currentMinutes:
      hour * 60 + minute,
  };
}

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

export function isLastReportingDayForUser(
  nip: string
) {
  const isTestUser =
    LAST_REPORT_DAY_TEST_NIP !== null &&
    nip.trim() === LAST_REPORT_DAY_TEST_NIP;

  if (isTestUser) {
    return true;
  }

  const now = new Date();

  const jakartaDate =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);

  return jakartaDate === "2026-08-18";
}

export function isCompetitionDate(
  date: string
) {
  return RUN_DATES.some(
    (item) =>
      item.value === date
  );
}

export function isDailySubmissionOpenForUser(
  nip: string
) {
  const runtime =
    getAtlantikRuntime(nip);

  if (
    !isCompetitionDate(
      runtime.date
    )
  ) {
    return false;
  }

  const openingMinutes =
    5 * 60;

  const cutoffMinutes =
    21 * 60;

  return (
    runtime.currentMinutes >=
      openingMinutes &&
    runtime.currentMinutes <
      cutoffMinutes
  );
}

export function getCurrentRunDateForUser(
  nip: string
): RunDate | null {
  const runtime =
    getAtlantikRuntime(nip);

  if (
    !isValidRunDate(
      runtime.date
    )
  ) {
    return null;
  }

  return runtime.date;
}