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

  for (
    const length of groups
  ) {
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
      className="verify-form"
      autoComplete="off"
    >
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <div className="field">
        <label htmlFor="jarak">
          Jarak Terverifikasi
        </label>

        <div className="input-suffix">
          <input
            id="jarak"
            name="jarak"
            type="text"
            inputMode="decimal"
            defaultValue={jarak}
            required
          />

          <span>km</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="avgPace">
          Avg. Pace
        </label>

        <div className="input-suffix">
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

          <span>/km</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="elapsedTime">
          Elapsed Time
        </label>

        <input
          id="elapsedTime"
          name="elapsedTime"
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
      </div>

      <div className="field">
        <label htmlFor="feedback">
          Feedback
        </label>

        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          maxLength={500}
          placeholder="Wajib diisi jika aktivitas ditolak"
        />
      </div>

      {state.error ? (
        <p className="form-error">
          {state.error}
        </p>
      ) : null}

      <div className="verify-actions">
        <button
          type="submit"
          name="decision"
          value="approve"
          className="approve-button"
          disabled={pending}
        >
          Setujui
        </button>

        <button
          type="submit"
          name="decision"
          value="reject"
          className="reject-button"
          disabled={pending}
        >
          Tolak
        </button>
      </div>
    </form>
  );
}