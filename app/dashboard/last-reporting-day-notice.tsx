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
            Hari terakhir pelaporan
          </h3>

          <p>
            Hari ini merupakan hari terakhir
            pelaporan aktivitas ATLANTIK RUN.
          </p>

          <p className="record-start-modal-note">
            Pastikan seluruh aktivitas tanggal
            15–17 Agustus 2026 sudah dilaporkan
            sebelum pukul 21.00 WIB.
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