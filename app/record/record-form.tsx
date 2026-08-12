"use client";

import { useActionState, useEffect, useState } from "react";

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

  const [tanggal, setTanggal] = useState("");
  const [jarak, setJarak] = useState("");
  const [tautan, setTautan] = useState("");

  useEffect(() => {
    if (state.values) {
      setTanggal(state.values.tanggal);
      setJarak(state.values.jarak);
      setTautan(state.values.tautan);
    }
  }, [state]);

  function handleJarakChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    let value = event.target.value;

    // Hanya izinkan angka, koma dan titik
    value = value.replace(/[^0-9.,]/g, "");

    // Samakan separator sementara untuk validasi
    const separatorIndex = value.search(/[.,]/);

    if (separatorIndex !== -1) {
      const beforeDecimal = value.slice(0, separatorIndex);

      const separator = value[separatorIndex];

      const afterDecimal = value
        .slice(separatorIndex + 1)
        .replace(/[.,]/g, "")
        .slice(0, 2);

      value =
        beforeDecimal +
        separator +
        afterDecimal;
    }

    setJarak(value);
  }

  return (
    <form
      action={formAction}
      className="record-form"
      autoComplete="off"
    >
      <div className="field">
        <label htmlFor="tanggal">
          Tanggal Aktivitas
        </label>

        <select
          id="tanggal"
          name="tanggal"
          value={tanggal}
          onChange={(event) =>
            setTanggal(event.target.value)
          }
          autoComplete="off"
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
            value={jarak}
            onChange={handleJarakChange}
            placeholder="Contoh: 5,25"
            autoComplete="off"
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
          value={tautan}
          onChange={(event) =>
            setTautan(event.target.value)
          }
          maxLength={500}
          placeholder="Tempel tautan bukti aktivitas"
          autoComplete="off"
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