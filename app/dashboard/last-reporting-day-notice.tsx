"use client";

import { useState } from "react";

type LastReportingDayNoticeProps = {
  show: boolean;
};

export default function LastReportingDayNotice({
  show,
}: LastReportingDayNoticeProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(show);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="record-start-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="last-reporting-day-title"
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

          <h3 id="last-reporting-day-title">
            Pelaporan segera ditutup
          </h3>

          <p>
            Waktu pelaporan aktivitas hari ini
            tinggal kurang dari satu jam.
          </p>

          <p className="record-start-modal-note">
            Pastikan aktivitas hari ini sudah
            dilaporkan sebelum pukul 21.00 WIB.
            Setelah waktu tersebut, pelaporan
            untuk hari ini akan ditutup.
          </p>
        </div>

        <button
          type="button"
          className="record-start-modal-button"
          onClick={() =>
            setIsOpen(false)
          }
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}