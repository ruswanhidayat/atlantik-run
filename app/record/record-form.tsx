"use client";

import {
  useActionState,
  useEffect,
  useMemo,
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
  recordingStart: string;
};

const initialState: RecordRunState =
  {};

function sanitizeTimeInput(
  value: string,
  type:
    | "pace"
    | "elapsed"
) {
  const digits =
    value.replace(
      /\D/g,
      ""
    );

  if (
    type === "pace"
  ) {
    const minutes =
      digits.slice(
        0,
        2
      );

    let seconds =
      digits.slice(
        2,
        4
      );

    if (
      seconds.length === 2
    ) {
      seconds =
        String(
          Math.min(
            Number(
              seconds
            ),
            59
          )
        ).padStart(
          2,
          "0"
        );
    }

    return seconds
      ? `${minutes}:${seconds}`
      : minutes;
  }

  const hours =
    digits.slice(
      0,
      2
    );

  let minutes =
    digits.slice(
      2,
      4
    );

  let seconds =
    digits.slice(
      4,
      6
    );

  if (
    minutes.length === 2
  ) {
    minutes =
      String(
        Math.min(
          Number(
            minutes
          ),
          59
        )
      ).padStart(
        2,
        "0"
      );
  }

  if (
    seconds.length === 2
  ) {
    seconds =
      String(
        Math.min(
          Number(
            seconds
          ),
          59
        )
      ).padStart(
        2,
        "0"
      );
  }

  const parts =
    [hours];

  if (minutes) {
    parts.push(
      minutes
    );
  }

  if (seconds) {
    parts.push(
      seconds
    );
  }

  return parts.join(":");
}

function parsePaceSeconds(
  value: string
) {
  const match =
    value.match(
      /^(\d{1,2}):([0-5]\d)$/
    );

  if (!match) {
    return null;
  }

  return (
    Number(match[1]) *
      60 +
    Number(match[2])
  );
}

function parseElapsedSeconds(
  value: string
) {
  const match =
    value.match(
      /^(\d{1,2}):([0-5]\d):([0-5]\d)$/
    );

  if (!match) {
    return null;
  }

  return (
    Number(match[1]) *
      3600 +
    Number(match[2]) *
      60 +
    Number(match[3])
  );
}

function parseStartTimeMinutes(
  value: string
) {
  const match =
    value.match(
      /^([01]\d|2[0-3]):([0-5]\d)$/
    );

  if (!match) {
    return null;
  }

  return (
    Number(match[1]) *
      60 +
    Number(match[2])
  );
}

function formatFinishTime(
  totalSeconds: number
) {
  const normalized =
    totalSeconds %
    (24 * 3600);

  const hours =
    Math.floor(
      normalized /
        3600
    );

  const minutes =
    Math.floor(
      (normalized %
        3600) /
        60
    );

  const seconds =
    normalized % 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

function normalizeStravaInput(
  value: string
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  let normalized =
    trimmed.replace(
      /^https?:\/\//i,
      ""
    );

  normalized =
    normalized.replace(
      /^www\./i,
      ""
    );

  return `https://www.${normalized}`;
}

function formatElapsedFromSeconds(
  totalSeconds: number
) {
  const roundedSeconds =
    Math.round(totalSeconds);

  const hours =
    Math.floor(
      roundedSeconds / 3600
    );

  const minutes =
    Math.floor(
      (roundedSeconds % 3600) / 60
    );

  const seconds =
    roundedSeconds % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

export default function RecordForm({
  availableDates,
  recordingStart,
}: RecordFormProps) {
  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      recordRunAction,
      initialState
    );

  const [
    tanggal,
    setTanggal,
  ] =
    useState("");

  const [
    waktuMulai,
    setWaktuMulai,
  ] =
    useState("");

  const [
    jarak,
    setJarak,
  ] =
    useState("");

  const [
    avgPace,
    setAvgPace,
  ] =
    useState("");

  const [
    elapsedTime,
    setElapsedTime,
  ] =
    useState("");

  const [
    elapsedTimeEdited,
    setElapsedTimeEdited,
  ] =
    useState(false);

  const [
    tautan,
    setTautan,
  ] =
    useState("");

  useEffect(() => {
    if (
      state.values
    ) {
      setTanggal(
        state.values.tanggal
      );

      setWaktuMulai(
        state.values
          .waktuMulai
      );

      setJarak(
        state.values.jarak
      );

      setAvgPace(
        state.values.avgPace
      );

      setElapsedTime(
        state.values
          .elapsedTime
      );

      setTautan(
        state.values.tautan
      );
    }
  }, [state]);

  useEffect(() => {
    if (elapsedTimeEdited) {
      return;
    }

    const distance =
      Number(
        jarak.replace(
          ",",
          "."
        )
      );

    const paceSeconds =
      parsePaceSeconds(
        avgPace
      );

    if (
      !Number.isFinite(distance) ||
      distance <= 0 ||
      paceSeconds === null
    ) {
      return;
    }

    const estimatedSeconds =
      distance * paceSeconds;

    setElapsedTime(
      formatElapsedFromSeconds(
        estimatedSeconds
      )
    );
  }, [
    jarak,
    avgPace,
    elapsedTimeEdited,
  ]);

  const distanceWarning =
    useMemo(() => {
      if (!jarak) {
        return false;
      }

      const value =
        Number(
          jarak.replace(
            ",",
            "."
          )
        );

      return (
        Number.isFinite(
          value
        ) &&
        value > 0 &&
        value < 1
      );
    }, [jarak]);

  const paceWarning =
    useMemo(() => {
      const seconds =
        parsePaceSeconds(
          avgPace
        );

      return (
        seconds !== null &&
        seconds < 300
      );
    }, [avgPace]);

  const timeInfo =
    useMemo(() => {
      const startMinutes =
        parseStartTimeMinutes(
          waktuMulai
        );

      const elapsedSeconds =
        parseElapsedSeconds(
          elapsedTime
        );

      if (
        startMinutes ===
          null ||
        elapsedSeconds ===
          null
      ) {
        return null;
      }

      const startSeconds =
        startMinutes *
        60;

      const finishSeconds =
        startSeconds +
        elapsedSeconds;

      return {
        finishTime:
          formatFinishTime(
            finishSeconds
          ),

        warning:
          startSeconds <
            5 *
              3600 ||
          finishSeconds >
            20 *
              3600,
      };
    }, [
      waktuMulai,
      elapsedTime,
    ]);

  const [recordingStarted, setRecordingStarted] =
    useState(
      () =>
        Date.now() >=
        new Date(recordingStart).getTime()
    );

  const [
    showRecordingNotice,
    setShowRecordingNotice,
  ] = useState(
    () =>
      Date.now() <
      new Date(recordingStart).getTime()
  );

  useEffect(() => {
    const startTime =
      new Date(recordingStart).getTime();

    function updateRecordingStatus() {
      setRecordingStarted(
        Date.now() >= startTime
      );
    }

    updateRecordingStatus();

    const interval =
      window.setInterval(
        updateRecordingStatus,
        1000
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [recordingStart]);

  function handleJarakChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    let value =
      event.target.value;

    value =
      value.replace(
        /[^0-9.,]/g,
        ""
      );

    const separatorIndex =
      value.search(
        /[.,]/
      );

    if (
      separatorIndex !==
      -1
    ) {
      const beforeDecimal =
        value.slice(
          0,
          separatorIndex
        );

      const separator =
        value[
          separatorIndex
        ];

      const afterDecimal =
        value
          .slice(
            separatorIndex +
              1
          )
          .replace(
            /[.,]/g,
            ""
          )
          .slice(
            0,
            2
          );

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
    setElapsedTimeEdited(true);

    setElapsedTime(
      sanitizeTimeInput(
        event.target.value,
        "elapsed"
      )
    );
  }

  function handleStravaBlur() {
    if (!tautan.trim()) {
      return;
    }

    setTautan(
      normalizeStravaInput(
        tautan
      )
    );
  }

  return (
    <>
      {showRecordingNotice ? (
        <div
          className="record-start-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-start-modal-title"
        >
          <div className="record-start-modal">
            <span
              className="record-start-modal-icon"
              aria-hidden="true"
            >
              ⏱
            </span>

            <div>
              <span className="dashboard-section-kicker">
                ATLANTIK RUN
              </span>

              <h3 id="record-start-modal-title">
                Belum waktu perekaman
              </h3>

              <p>
                Perekaman aktivitas mulai dapat
                dikirim pada 15 Agustus 2026
                pukul 05.00 WIB.
              </p>

              <p className="record-start-modal-note">
                Kamu tetap dapat mencoba dan
                mempelajari form perekaman
                sebelum perlombaan dimulai.
              </p>
            </div>

            <button
              type="button"
              className="record-start-modal-button"
              onClick={() =>
                setShowRecordingNotice(false)
              }
            >
              Mengerti
            </button>
          </div>
        </div>
      ) : null}

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
            onChange={(
              event
            ) =>
              setTanggal(
                event.target
                  .value
              )
            }
            autoComplete="off"
            required
          >
            <option
              value=""
              disabled
            >
              Pilih tanggal
              aktivitas
            </option>

            {availableDates.map(
              (date) => (
                <option
                  key={
                    date.value
                  }
                  value={
                    date.value
                  }
                >
                  {date.label}
                </option>
              )
            )}
          </select>

          <span
            className="record-select-arrow"
            aria-hidden="true"
          >
            ↓
          </span>
        </div>
      </div>

      {/* START TIME */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="waktuMulai">
            Waktu Mulai
            Aktivitas
          </label>

          <span>02</span>
        </div>

        <div className="record-time-wrap">
          <input
            id="waktuMulai"
            name="waktuMulai"
            className="record-input record-time-input"
            type="time"
            value={waktuMulai}
            onChange={(event) =>
              setWaktuMulai(event.target.value)
            }
            autoComplete="off"
            required
          />

          <span
            className="record-time-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </span>
        </div>

        <small className="record-field-help">
          Gunakan waktu mulai
          sesuai aktivitas
          Strava.
        </small>

        {timeInfo ? (
          <div
            className={`record-soft-info ${
              timeInfo.warning
                ? "record-soft-warning"
                : ""
            }`}
          >
            <span>
              Perkiraan waktu
              selesai
            </span>

            <strong>
              {
                timeInfo.finishTime
              }
            </strong>

            {timeInfo.warning ? (
              <p>
                Aktivitas berada
                di luar periode
                perlombaan
                05.00–20.00 WIB.
                Data tetap dapat
                dikirim dan akan
                diverifikasi
                panitia.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* DISTANCE */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="jarak">
            Jarak
          </label>

          <span>03</span>
        </div>

        <div className="record-input-suffix">
          <input
            id="jarak"
            name="jarak"
            type="text"
            inputMode="decimal"
            value={jarak}
            onChange={
              handleJarakChange
            }
            placeholder="Contoh: 5,25"
            autoComplete="off"
            required
          />

          <span>KM</span>
        </div>

        {distanceWarning ? (
          <div className="record-soft-warning">
            <span>
              ⚠ Jarak minimum
              yang diperhitungkan
              adalah 1 km. Data
              tetap dapat dikirim
              dan akan
              diverifikasi
              panitia.
            </span>
          </div>
        ) : null}
      </div>

      {/* METRICS */}
      <div className="record-metrics-group">
        <div className="record-field-row record-field-row-metrics">
          {/* AVG PACE */}
          <div className="record-field">
            <div className="record-field-heading">
              <label htmlFor="avgPace">
                Avg. Pace
              </label>

              <span>04</span>
            </div>

            <div className="record-input-suffix">
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

              <span>/KM</span>
            </div>

            <small className="record-field-help">
              Format MM:SS
            </small>
          </div>

          {/* ELAPSED TIME */}
          <div className="record-field">
            <div className="record-field-heading">
              <label htmlFor="elapsedTime">
                Elapsed Time
              </label>

              <span>05</span>
            </div>

            <input
              id="elapsedTime"
              name="elapsedTime"
              className="record-input"
              type="text"
              inputMode="numeric"
              value={elapsedTime}
              onChange={handleElapsedTimeChange}
              placeholder="01:08:04"
              maxLength={8}
              autoComplete="off"
              required
            />

            <small className="record-field-help">
              Format HH:MM:SS · Terisi otomatis dari jarak × avg. pace · Tetap dapat diedit
            </small>
          </div>
        </div>

        {paceWarning ? (
          <div className="record-soft-warning record-metrics-warning">
            <span>
              ⚠ Pace lebih cepat dari batas 05:00/km.
              Data tetap dapat dikirim dan akan diverifikasi panitia.
            </span>
          </div>
        ) : null}
      </div>

      {/* LINK */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="tautan">
            Tautan Aktivitas
            Strava
          </label>

          <span>06</span>
        </div>

        <input
          id="tautan"
          name="tautan"
          className="record-input"
          type="text"
          value={tautan}
          onChange={(
            event
          ) =>
            setTautan(
              event.target
                .value
            )
          }
          onBlur={
            handleStravaBlur
          }
          maxLength={500}
          placeholder="www.strava.com/activities/..."
          autoComplete="off"
          required
        />

        <small className="record-field-help">
          Gunakan tautan
          aktivitas dari
          www.strava.com.
        </small>
      </div>

      {/* ERROR */}
      {state.error ? (
        <div
          className="record-form-error"
          role="alert"
        >
          <span
            aria-hidden="true"
          >
            !
          </span>

          <p>
            {state.error}
          </p>
        </div>
      ) : null}

      {/* SUBMIT */}
      <button
        type="submit"
        className="record-submit"
        disabled={
          pending ||
          !recordingStarted
        }
      >
        <span>
          {pending
            ? "Merekam..."
            : recordingStarted
              ? "Kirim Aktivitas"
              : "Perekaman Belum Dibuka"}
        </span>

        <span
          className="record-submit-arrow"
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <p className="record-submit-note">
        {recordingStarted
          ? "Aktivitas akan berstatus Pending sampai selesai diverifikasi admin."
          : "Tombol akan aktif mulai 15 Agustus 2026 pukul 05.00 WIB."}
      </p>
    </form>
    </>
  );
}