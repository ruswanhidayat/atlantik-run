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

import {
  normalizeStravaInput,
  validateStravaLink,
} from "@/lib/strava";

type AvailableDate = {
  value: string;
  label: string;
};

type RecordFormProps = {
  currentDate: AvailableDate;
  initialRuntimeDate: string;
  initialRuntimeTime: string;
  useBypassClock: boolean;
};

const initialState: RecordRunState =
  {};

const DAILY_OPEN_SECONDS = 5 * 60 * 60;
const DAILY_WARNING_SECONDS = 20 * 60 * 60;
const DAILY_CUTOFF_SECONDS = 21 * 60 * 60;
const SECONDS_PER_DAY = 24 * 60 * 60;

function parseRuntimeTime(
  value: string
) {
  const match =
    value.match(
      /^([01]\d|2[0-3]):([0-5]\d)$/
    );

  if (!match) {
    return 0;
  }

  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60
  );
}

function addDaysToDate(
  value: string,
  days: number
) {
  const date =
    new Date(
      `${value}T00:00:00Z`
    );

  date.setUTCDate(
    date.getUTCDate() +
      days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function getJakartaClock() {
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
        second: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(
      new Date()
    );

  const getPart = (
    type: Intl.DateTimeFormatPartTypes
  ) =>
    parts.find(
      (part) =>
        part.type === type
    )?.value ?? "";

  const date =
    `${getPart("year")}-` +
    `${getPart("month")}-` +
    `${getPart("day")}`;

  const hour =
    Number(
      getPart("hour")
    );

  const minute =
    Number(
      getPart("minute")
    );

  const second =
    Number(
      getPart("second")
    );

  return {
    date,
    seconds:
      hour * 3600 +
      minute * 60 +
      second,
  };
}

function formatCountdown(
  totalSeconds: number
) {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        totalSeconds
      )
    );

  const hours =
    Math.floor(
      safeSeconds / 3600
    );

  const minutes =
    Math.floor(
      (safeSeconds % 3600) /
        60
    );

  const seconds =
    safeSeconds % 60;

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
  currentDate,
  initialRuntimeDate,
  initialRuntimeTime,
  useBypassClock,
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

  const [
    runtimeClock,
    setRuntimeClock,
  ] = useState(() => ({
    date: initialRuntimeDate,
    seconds:
      parseRuntimeTime(
        initialRuntimeTime
      ),
  }));

  const [
    showRecordingNotice,
    setShowRecordingNotice,
  ] = useState(
    () =>
      initialRuntimeDate ===
        "2026-08-15" &&
      parseRuntimeTime(
        initialRuntimeTime
      ) <
        DAILY_OPEN_SECONDS
  );

  useEffect(() => {
    const startedAt =
      Date.now();

    const initialSeconds =
      parseRuntimeTime(
        initialRuntimeTime
      );

    function updateRuntimeClock() {
      if (
        !useBypassClock
      ) {
        setRuntimeClock(
          getJakartaClock()
        );
        return;
      }

      const elapsedSeconds =
        Math.floor(
          (
            Date.now() -
            startedAt
          ) /
            1000
        );

      const totalSeconds =
        initialSeconds +
        elapsedSeconds;

      const dayOffset =
        Math.floor(
          totalSeconds /
            SECONDS_PER_DAY
        );

      setRuntimeClock({
        date:
          addDaysToDate(
            initialRuntimeDate,
            dayOffset
          ),
        seconds:
          totalSeconds %
          SECONDS_PER_DAY,
      });
    }

    updateRuntimeClock();

    const interval =
      window.setInterval(
        updateRuntimeClock,
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    initialRuntimeDate,
    initialRuntimeTime,
    useBypassClock,
  ]);

  const isCurrentRunDate =
    runtimeClock.date ===
    currentDate.value;

  const submissionOpen =
    isCurrentRunDate &&
    runtimeClock.seconds >=
      DAILY_OPEN_SECONDS &&
    runtimeClock.seconds <
      DAILY_CUTOFF_SECONDS;

  const showCutoffCountdown =
    isCurrentRunDate &&
    runtimeClock.seconds >=
      DAILY_WARNING_SECONDS &&
    runtimeClock.seconds <
      DAILY_CUTOFF_SECONDS;

  const cutoffRemainingSeconds =
    Math.max(
      0,
      DAILY_CUTOFF_SECONDS -
        runtimeClock.seconds
    );

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

  const stravaLinkStatus =
    tautan.trim()
      ? validateStravaLink(
          tautan
        )
      : null;

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
      {showCutoffCountdown ? (
        <div className="record-soft-warning record-cutoff-countdown">
          <span>
            ⏱ Pelaporan hari ini ditutup dalam{" "}
            <strong>
              {formatCountdown(
                cutoffRemainingSeconds
              )}
            </strong>
            . Batas submit pukul 21.00 WIB.
          </span>
        </div>
      ) : null}

      {/* DATE */}
      <div className="record-field record-field-full">
        <div className="record-field-heading">
          <label htmlFor="tanggal-display">
            Tanggal Aktivitas
          </label>

          <span>01</span>
        </div>

        <input
          id="tanggal-display"
          className="record-input"
          type="text"
          value={currentDate.label}
          readOnly
          aria-readonly="true"
        />

        <input
          type="hidden"
          name="tanggal"
          value={currentDate.value}
        />

        <small className="record-field-help">
          Aktivitas hanya dapat dilaporkan pada tanggal yang sama.
        </small>
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

        <div
          className="record-time-wrap"
          onClick={() => {
            const input =
              document.getElementById(
                "waktuMulai"
              ) as HTMLInputElement | null;

            if (!input) return;

            if (typeof input.showPicker === "function") {
              input.showPicker();
            } else {
              input.focus();
              input.click();
            }
          }}
        >
          <input
            id="waktuMulai"
            name="waktuMulai"
            className="record-time-native"
            type="time"
            value={waktuMulai}
            onChange={(event) =>
              setWaktuMulai(event.target.value)
            }
            autoComplete="off"
            required
          />

          <div className="record-time-display">
            <span
              className={
                waktuMulai
                  ? "record-time-value"
                  : "record-time-placeholder"
              }
            >
              {waktuMulai || "--:--"}
            </span>

            <span
              className="record-time-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                />
                <path d="M12 7.5V12l3 2" />
              </svg>
            </span>
          </div>
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
          Bisa menggunakan link aktivitas Strava,
          misalnya strava.com/activities/..., atau
          paste langsung teks share dari aplikasi Strava.
        </small>

        {stravaLinkStatus === "invalid" ? (
          <div className="record-soft-warning">
            <span>
              ⚠ Tautan belum dikenali sebagai link aktivitas Strava.
            </span>
          </div>
        ) : null}
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
          !submissionOpen
        }
      >
        <span>
          {pending
            ? "Merekam..."
            : !isCurrentRunDate
              ? "Pelaporan Hari Ini Ditutup"
              : runtimeClock.seconds <
                    DAILY_OPEN_SECONDS
                ? "Perekaman Belum Dibuka"
                : runtimeClock.seconds >=
                      DAILY_CUTOFF_SECONDS
                  ? "Pelaporan Ditutup"
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
        {!isCurrentRunDate
          ? "Tanggal pelaporan telah berganti. Buka kembali halaman Record untuk merekam aktivitas hari ini."
          : runtimeClock.seconds <
                DAILY_OPEN_SECONDS
            ? "Tombol Simpan akan aktif pukul 05.00 WIB."
            : runtimeClock.seconds >=
                  DAILY_CUTOFF_SECONDS
              ? "Pelaporan hari ini telah ditutup. Perekaman dibuka kembali pukul 05.00 WIB pada hari perlombaan berikutnya."
              : "Aktivitas akan berstatus Pending sampai selesai diverifikasi admin."}
      </p>
    </form>
    </>
  );
}