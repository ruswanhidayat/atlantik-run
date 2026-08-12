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

export const SUBMISSION_DEADLINE =
  "2026-08-20T23:59:59+07:00";

export type RunDate = (typeof RUN_DATES)[number]["value"];

export function isValidRunDate(
  value: string
): value is RunDate {
  return RUN_DATES.some((date) => date.value === value);
}

export function isSubmissionOpen() {
  return new Date().getTime() <= new Date(SUBMISSION_DEADLINE).getTime();
}