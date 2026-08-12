"use client";

import { useActionState } from "react";

import {
  verifyActivityAction,
  type VerifyActivityState,
} from "@/app/actions/admin";

type VerifyFormProps = {
  id: string;
  jarak: string;
};

const initialState: VerifyActivityState = {};

export default function VerifyForm({
  id,
  jarak,
}: VerifyFormProps) {
  const [state, formAction, pending] =
    useActionState(
      verifyActivityAction,
      initialState
    );

  return (
    <form
      action={formAction}
      className="verify-form"
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