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

    value = value.replace(
      /[^0-9.,]/g,
      ""
    );

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
      className="record-form-v2"
      autoComplete="off"
    >
      {/* DATE */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="tanggal">
            Tanggal Aktivitas
          </label>

          <span>01</span>
        </div>

        <div className="record-select-wrap">
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
              Pilih tanggal aktivitas
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

          <span
            className="record-select-arrow"
            aria-hidden="true"
          >
            ↓
          </span>
        </div>
      </div>

      {/* DISTANCE */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="jarak">
            Jarak
          </label>

          <span>02</span>
        </div>

        <div className="record-input-suffix">
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

          <span>KM</span>
        </div>
      </div>

      {/* METRICS */}
      <div className="record-field-row">
        <div className="record-field">
          <div className="record-field-heading">
            <label htmlFor="avgPace">
              Avg. Pace
            </label>

            <span>03</span>
          </div>

          <div className="record-input-suffix">
            <input
              id="avgPace"
              name="avgPace"
              type="text"
              inputMode="numeric"
              value={avgPace}
              onChange={
                handleAvgPaceChange
              }
              placeholder="12:58"
              maxLength={5}
              autoComplete="off"
              required
            />

            <span>/KM</span>
          </div>

          <small className="record-field-help">
            Format MM:SS
          </small>
        </div>

        <div className="record-field">
          <div className="record-field-heading">
            <label htmlFor="elapsedTime">
              Elapsed Time
            </label>

            <span>04</span>
          </div>

          <input
            id="elapsedTime"
            name="elapsedTime"
            className="record-input"
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

          <small className="record-field-help">
            Format HH:MM:SS
          </small>
        </div>
      </div>

      {/* LINK */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="tautan">
            Tautan Aktivitas
          </label>

          <span>05</span>
        </div>

        <input
          id="tautan"
          name="tautan"
          className="record-input"
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

        <small className="record-field-help">
          Pastikan tautan dapat dibuka oleh admin.
        </small>
      </div>

      {/* ERROR */}
      {state.error ? (
        <div
          className="record-form-error"
          role="alert"
        >
          <span aria-hidden="true">!</span>

          <p>{state.error}</p>
        </div>
      ) : null}

      {/* SUBMIT */}
      <button
        type="submit"
        className="record-submit"
        disabled={pending}
      >
        <span>
          {pending
            ? "Merekam..."
            : "Kirim Aktivitas"}
        </span>

        <span
          className="record-submit-arrow"
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <p className="record-submit-note">
        Aktivitas akan berstatus Pending sampai
        selesai diverifikasi admin.
      </p>
    </form>
  );
}