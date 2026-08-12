"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

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

function sanitizeTimeInput(
  value: string,
  type: "pace" | "elapsed"
) {
  const digits = value.replace(/\D/g, "");

  if (type === "pace") {
    const minutes = digits.slice(0, 2);

    let seconds = digits.slice(2, 4);

    if (seconds.length === 2) {
      seconds = String(
        Math.min(Number(seconds), 59)
      ).padStart(2, "0");
    }

    return seconds
      ? `${minutes}:${seconds}`
      : minutes;
  }

  const hours = digits.slice(0, 2);

  let minutes = digits.slice(2, 4);
  let seconds = digits.slice(4, 6);

  if (minutes.length === 2) {
    minutes = String(
      Math.min(Number(minutes), 59)
    ).padStart(2, "0");
  }

  if (seconds.length === 2) {
    seconds = String(
      Math.min(Number(seconds), 59)
    ).padStart(2, "0");
  }

  const parts = [hours];

  if (minutes) {
    parts.push(minutes);
  }

  if (seconds) {
    parts.push(seconds);
  }

  return parts.join(":");
}

export default function RecordForm({
  availableDates,
}: RecordFormProps) {
  const [state, formAction, pending] =
    useActionState(
      recordRunAction,
      initialState
    );

  const [tanggal, setTanggal] =
    useState("");

  const [jarak, setJarak] =
    useState("");

  const [avgPace, setAvgPace] =
    useState("");

  const [elapsedTime, setElapsedTime] =
    useState("");

  const [tautan, setTautan] =
    useState("");

  useEffect(() => {
    if (state.values) {
      setTanggal(state.values.tanggal);
      setJarak(state.values.jarak);
      setAvgPace(state.values.avgPace);
      setElapsedTime(
        state.values.elapsedTime
      );
      setTautan(state.values.tautan);
    }
  }, [state]);

  function handleJarakChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    let value = event.target.value;

    value = value.replace(/[^0-9.,]/g, "");

    const separatorIndex =
      value.search(/[.,]/);

    if (separatorIndex !== -1) {
      const beforeDecimal =
        value.slice(0, separatorIndex);

      const separator =
        value[separatorIndex];

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

  function handleAvgPaceChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setAvgPace(
      sanitizeTimeInput(
        event.target.value,
        "pace"
      )
    );
  }

  function handleElapsedTimeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setElapsedTime(
      sanitizeTimeInput(
        event.target.value,
        "elapsed"
      )
    );
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
            setTanggal(
              event.target.value
            )
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
            value={avgPace}
            onChange={handleAvgPaceChange}
            placeholder="12:58"
            maxLength={5}
            autoComplete="off"
            required
          />

          <span>/km</span>
        </div>

        <small>
          Format menit:detik, contoh 12:58.
        </small>
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
          value={elapsedTime}
          onChange={
            handleElapsedTimeChange
          }
          placeholder="01:08:04"
          maxLength={8}
          autoComplete="off"
          required
        />

        <small>
          Format jam:menit:detik,
          contoh 01:08:04.
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
            setTautan(
              event.target.value
            )
          }
          maxLength={500}
          placeholder="Tempel tautan bukti aktivitas"
          autoComplete="off"
          required
        />
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