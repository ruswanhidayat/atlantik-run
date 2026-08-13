import Link from "next/link";

import RecordBottomNav from "./record-bottom-nav";
import RecordForm from "./record-form";

import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  RECORDING_START,
  isSubmissionOpenForUser,
  RUN_DATES,
} from "@/lib/run-config";

export default async function RecordPage() {
  const user = await requireUser();

  const activities = await sql`
    SELECT
      tanggal::text AS tanggal,
      status
    FROM run_activities
    WHERE nip = ${user.nip}
      AND status IN (0, 1)
  `;

  const blockedDates = new Set(
    activities.map((activity) =>
      String(activity.tanggal)
    )
  );

  const availableDates = RUN_DATES.filter(
    (date) =>
      !blockedDates.has(date.value)
  );

  const submissionOpen =
    isSubmissionOpenForUser(
      user.nip
    );

  return (
    <main className="run-app record-v2">
      <div
        className="run-app-glow run-app-glow-one"
        aria-hidden="true"
      />

      <div
        className="run-app-glow run-app-glow-two"
        aria-hidden="true"
      />

      {/* TOP BAR */}
      <header className="run-topbar">
        <div className="run-brand">
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>2026</small>
        </div>

        <Link
          href="/dashboard"
          className="record-back-button"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali</span>
        </Link>
      </header>

      <div className="record-container">
        {/* INTRO */}
        <section className="record-intro">
          <div className="record-intro-copy">
            <span className="dashboard-kicker">
              LAPOR AKTIVITAS
            </span>

            <h1>Rekam Lari</h1>

            <p>
              Catat aktivitas larimu dan bantu
              Subdit-mu bergerak menuju peringkat
              teratas.
            </p>
          </div>

          <div className="record-user">
            <span className="record-user-label">
              PELARI
            </span>

            <strong>
              {user.nama}
            </strong>

            <span>
              {user.subdit}
            </span>
          </div>
        </section>

        {/* TOMBOL DI SINI */}
        <div className="record-mobile-back-wrap">
          <Link
            href="/dashboard"
            className="record-mobile-back"
          >
            <span aria-hidden="true">←</span>
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* CONTENT */}
        <div className="record-layout">
          <section className="record-form-panel">
            <div className="record-panel-heading">
              <div>
                <span className="dashboard-section-kicker">
                  AKTIVITAS BARU
                </span>

                <h2>
                  Detail Lari
                </h2>
              </div>

              <span className="record-required-note">
                Semua kolom wajib diisi
              </span>
            </div>

            {!submissionOpen ? (
              <div className="record-state-card">
                <span
                  className="record-state-icon"
                  aria-hidden="true"
                >
                  ×
                </span>

                <div>
                  <strong>
                    Pelaporan telah ditutup.
                  </strong>

                  <p>
                    Batas akhir pelaporan ATLANTIK RUN adalah
                    18 Agustus 2026 pukul 21.00 WIB.
                  </p>
                </div>
              </div>
            ) : availableDates.length === 0 ? (
              <div className="record-state-card">
                <span
                  className="record-state-icon"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <div>
                  <strong>
                    Semua aktivitas sudah direkam.
                  </strong>

                  <p>
                    Seluruh tanggal ATLANTIK RUN
                    sudah memiliki aktivitas Pending
                    atau Approved.
                  </p>
                </div>
              </div>
            ) : (
              <RecordForm
                availableDates={availableDates}
                recordingStart={RECORDING_START}
              />
            )}
          </section>

          {/* GUIDE */}
          <aside className="record-guide">
            <div className="record-guide-heading">
              <span className="dashboard-section-kicker">
                SEBELUM MENGIRIM
              </span>

              <h2>
                Pastikan datanya benar.
              </h2>
            </div>

            <div className="record-guide-list">
              <article>
                <span className="record-guide-number">
                  01
                </span>

                <div>
                  <strong>
                    Periode perlombaan
                  </strong>

                  <p>
                    Aktivitas ATLANTIK RUN dilakukan pada
                    15–17 Agustus 2026 pukul 05.00–20.00 WIB.
                  </p>
                </div>
              </article>

              <article>
                <span className="record-guide-number">
                  02
                </span>

                <div>
                  <strong>
                    Sesuaikan dengan Strava
                  </strong>

                  <p>
                    Tanggal, waktu mulai, jarak, pace,
                    elapsed time, dan tautan harus sesuai
                    dengan aktivitas Strava yang dilaporkan.
                  </p>
                </div>
              </article>

              <article>
                <span className="record-guide-number">
                  03
                </span>

                <div>
                  <strong>
                    Batas akhir pelaporan
                  </strong>

                  <p>
                    Aktivitas tanggal 15–17 Agustus masih
                    dapat dilaporkan sampai 18 Agustus 2026
                    pukul 21.00 WIB.
                  </p>
                </div>
              </article>

              <article>
                <span className="record-guide-number">
                  04
                </span>

                <div>
                  <strong>
                    Tunggu verifikasi
                  </strong>

                  <p>
                    Aktivitas yang dikirim akan diperiksa
                    admin sebelum masuk ke perhitungan
                    leaderboard.
                  </p>
                </div>
              </article>
            </div>

            <div className="record-guide-accent">
              <span>
                15—17 AUG 2026
              </span>

              <p>
                Every kilometer
                <br />
                moves the team.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <RecordBottomNav
        canRecord={submissionOpen}
        isAdmin={Boolean(
          user.isadmin
        )}
      />
    </main>
  );
}