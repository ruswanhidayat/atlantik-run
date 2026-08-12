"use client";

import { useActionState } from "react";

import {
  recordRunAction,
  type RecordRunState,
} from "@/app/actions/run";

type AvailableDate = {
  value: string;
  label: string;
};

type RecordFormProps = {
  availableDates: AvailableDate[];
};

const initialState: RecordRunState = {};

export default function RecordForm({
  availableDates,
}: RecordFormProps) {
  const [state, formAction, pending] = useActionState(
    recordRunAction,
    initialState
  );

  return (
    <form action={formAction} className="record-form">
      <div className="field">
        <label htmlFor="tanggal">
          Tanggal Aktivitas
        </label>

        <select
          id="tanggal"
          name="tanggal"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Pilih tanggal
          </option>

          {availableDates.map((date) => (
            <option
              key={date.value}
              value={date.value}
            >
              {date.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="jarak">
          Jarak
        </label>

        <div className="input-suffix">
          <input
            id="jarak"
            name="jarak"
            type="text"
            inputMode="decimal"
            placeholder="Contoh: 5,25"
            required
          />

          <span>km</span>
        </div>

        <small>
          Maksimal 2 angka di belakang koma.
        </small>
      </div>

      <div className="field">
        <label htmlFor="tautan">
          Tautan Aktivitas
        </label>

        <input
          id="tautan"
          name="tautan"
          type="text"
          maxLength={500}
          placeholder="Tempel tautan bukti aktivitas"
          required
        />

        <small>
          Masukkan tautan aktivitas sebagai bukti
          perekaman.
        </small>
      </div>

      {state.error ? (
        <p className="form-error">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Merekam..."
          : "Rekam Aktivitas"}
      </button>
    </form>
  );
}