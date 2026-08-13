"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  verifyActivityAction,
  type VerifyActivityState,
} from "@/app/actions/admin";

type VerifyFormProps = {
  id: string;
  jarak: string;
  avgPace: string;
  elapsedTime: string;
  distanceWarning: boolean;
  paceWarning: boolean;
  timeWarning: boolean;
};

const initialState:
  VerifyActivityState = {};

function sanitizeTimeInput(
  value: string,
  groups: number[]
) {
  const digits =
    value.replace(/\D/g, "");

  const parts: string[] = [];

  let index = 0;

  for (const length of groups) {
    if (
      index >= digits.length
    ) {
      break;
    }

    parts.push(
      digits.slice(
        index,
        index + length
      )
    );

    index += length;
  }

  return parts.join(":");
}

export default function VerifyForm({
  id,
  jarak,
  avgPace,
  elapsedTime,
  distanceWarning,
  paceWarning,
  timeWarning,
}: VerifyFormProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    verifyActivityAction,
    initialState
  );

  const [
    paceValue,
    setPaceValue,
  ] = useState(avgPace);

  const [
    elapsedValue,
    setElapsedValue,
  ] = useState(elapsedTime);

  return (
    <form
      action={formAction}
      className="admin-verify-form"
      autoComplete="off"
    >
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <div className="admin-verify-field">
        <div className="admin-verify-field-heading">
          <label htmlFor="jarak">
            Jarak Terverifikasi
          </label>

          <span>01</span>
        </div>

        <div className="admin-verify-input-suffix">
          <input
            id="jarak"
            name="jarak"
            type="text"
            inputMode="decimal"
            defaultValue={jarak}
            required
          />

          <span>KM</span>
        </div>

        {distanceWarning ? (
          <small className="admin-verify-field-warning">
            ⚠ Jarak dilaporkan kurang dari 1 km.
          </small>
        ) : null}
      </div>

      <div className="admin-verify-field">
        <div className="admin-verify-field-heading">
          <label htmlFor="avgPace">
            Avg. Pace
          </label>

          <span>02</span>
        </div>

        <div className="admin-verify-input-suffix">
          <input
            id="avgPace"
            name="avgPace"
            type="text"
            inputMode="numeric"
            value={paceValue}
            onChange={(event) =>
              setPaceValue(
                sanitizeTimeInput(
                  event.target.value,
                  [2, 2]
                )
              )
            }
            maxLength={5}
            required
          />

          <span>/KM</span>
        </div>

        <small>
          Format MM:SS
        </small>

        {paceWarning ? (
          <small className="admin-verify-field-warning">
            ⚠ Pace lebih cepat dari batas
            05:00/km.
          </small>
        ) : null}
      </div>

      <div className="admin-verify-field">
        <div className="admin-verify-field-heading">
          <label htmlFor="elapsedTime">
            Elapsed Time
          </label>

          <span>03</span>
        </div>

        <input
          id="elapsedTime"
          name="elapsedTime"
          className="admin-verify-input"
          type="text"
          inputMode="numeric"
          value={elapsedValue}
          onChange={(event) =>
            setElapsedValue(
              sanitizeTimeInput(
                event.target.value,
                [2, 2, 2]
              )
            )
          }
          maxLength={8}
          required
        />

        <small>
          Format HH:MM:SS
        </small>
      </div>

      <div className="admin-verify-field">
        {timeWarning ? (
          <div className="admin-verify-field-warning-box">
            <strong>
              ⚠ Waktu aktivitas di luar periode
              05.00–20.00 WIB
            </strong>

            <span>
              Periksa waktu mulai dan waktu selesai
              pada ringkasan aktivitas serta bukti
              Strava.
            </span>
          </div>
        ) : null}
        
        <div className="admin-verify-field-heading">
          <label htmlFor="feedback">
            Feedback
          </label>

          <span>04</span>
        </div>

        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          maxLength={500}
          placeholder="Wajib diisi jika aktivitas ditolak"
        />

        <small>
          Opsional untuk Approved, wajib jika
          aktivitas ditolak.
        </small>
      </div>

      {state.error ? (
        <div
          className="admin-verify-error"
          role="alert"
        >
          <span aria-hidden="true">
            !
          </span>

          <p>
            {state.error}
          </p>
        </div>
      ) : null}

      <div className="admin-verify-actions">
        <button
          type="submit"
          name="decision"
          value="approve"
          className="admin-verify-approve"
          disabled={pending}
        >
          <span>
            {pending
              ? "Memproses..."
              : "Setujui"}
          </span>

          <span aria-hidden="true">
            ✓
          </span>
        </button>

        <button
          type="submit"
          name="decision"
          value="reject"
          className="admin-verify-reject"
          disabled={pending}
        >
          <span>
            Tolak
          </span>

          <span aria-hidden="true">
            ×
          </span>
        </button>
      </div>
    </form>
  );
}