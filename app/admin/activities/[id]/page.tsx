import Link from "next/link";
import { notFound } from "next/navigation";

import VerifyForm from "./verify-form";
import { requireAdminAccess } from "@/lib/auth";
import { sql } from "@/lib/db";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatStatus(status: number) {
  if (status === 0) {
    return "Pending";
  }

  if (status === 1) {
    return "Approved";
  }

  return "Rejected";
}

function getStatusClass(status: number) {
  if (status === 0) {
    return "status-pending";
  }

  if (status === 1) {
    return "status-approved";
  }

  return "status-rejected";
}

function formatPace(seconds: number | null) {
  if (!seconds) {
    return "-";
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatElapsedTime(
  seconds: number | null
) {
  if (!seconds) {
    return "-";
  }

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const remainingSeconds =
    seconds % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function normalizeExternalUrl(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default async function AdminActivityDetailPage({
  params,
}: PageProps) {
  await requireAdminAccess();

  const { id } = await params;

  const activityId = Number(id);

  if (
    !Number.isInteger(activityId) ||
    activityId <= 0
  ) {
    notFound();
  }

  const rows = await sql`
    SELECT
      ra.id,
      ra.nip,
      u.nama,
      u.subdit,
      u.gender,
      ra.tautan,
      ra.jarak,
      ra.tanggal::text AS tanggal,
      ra.tgl_rekam,
      ra.status,
      ra.feedback,
      ra.verified_by,
      ra.verified_at,
      ra.avg_pace_seconds,
      ra.elapsed_time_seconds,
      verifier.nama AS verifier_name
    FROM run_activities ra

    JOIN users u
      ON u.nip = ra.nip

    LEFT JOIN users verifier
      ON verifier.nip = ra.verified_by

    WHERE ra.id = ${activityId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    notFound();
  }

  const activity = rows[0];

  const status =
    Number(activity.status);

  const avgPace =
    formatPace(
      activity.avg_pace_seconds !== null
        ? Number(
            activity.avg_pace_seconds
          )
        : null
    );

  const elapsedTime =
    formatElapsedTime(
      activity.elapsed_time_seconds !== null
        ? Number(
            activity.elapsed_time_seconds
          )
        : null
    );

  const evidenceUrl =
    normalizeExternalUrl(
      activity.tautan
        ? String(activity.tautan)
        : null
    );

  return (
    <main className="run-app admin-verify-v2">
      <div
        className="run-app-glow run-app-glow-one"
        aria-hidden="true"
      />

      <div
        className="run-app-glow run-app-glow-two"
        aria-hidden="true"
      />

      <header className="run-topbar">
        <div className="run-brand">
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>ADMIN</small>
        </div>

        <Link
          href="/admin/activities"
          className="run-admin-link"
        >
          ← Kembali
        </Link>
      </header>

      <div className="admin-verify-container">
        <section className="admin-verify-heading">
          <div>
            <span className="dashboard-kicker">
              ADMIN VERIFICATION
            </span>

            <h1>
              {String(activity.nama)}
            </h1>

            <p>
              {String(activity.subdit)}
              <span>·</span>
              {activity.gender === "M"
                ? "Pria"
                : "Wanita"}
            </p>
          </div>

          <span
            className={`status-badge ${getStatusClass(
              status
            )}`}
          >
            {formatStatus(status)}
          </span>
        </section>

        <Link
          href="/admin/activities"
          className="admin-verify-mobile-back"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Data</span>
        </Link>

        <div className="admin-verify-layout">
          {/* SUMMARY */}
          <section className="admin-verify-summary-panel">
            <div className="admin-verify-section-heading">
              <span className="dashboard-section-kicker">
                DATA PELARI
              </span>

              <h2>
                Ringkasan Aktivitas
              </h2>
            </div>

            <div className="admin-verify-summary-grid">
              <article>
                <span>NIP</span>

                <strong>
                  {String(
                    activity.nip
                  ).trim()}
                </strong>
              </article>

              <article>
                <span>Tanggal</span>

                <strong>
                  {String(
                    activity.tanggal
                  )}
                </strong>
              </article>

              <article>
                <span>Jarak Dilaporkan</span>

                <strong>
                  {Number(
                    activity.jarak
                  ).toFixed(2)}{" "}
                  km
                </strong>
              </article>

              <article>
                <span>Avg. Pace</span>

                <strong>
                  {avgPace} /km
                </strong>
              </article>

              <article>
                <span>Elapsed Time</span>

                <strong>
                  {elapsedTime}
                </strong>
              </article>

              <article>
                <span>Status</span>

                <strong>
                  {formatStatus(status)}
                </strong>
              </article>
            </div>

            <div className="admin-evidence-card">
              <div>
                <span>
                  TAUTAN AKTIVITAS
                </span>

                <strong>
                  Bukti Aktivitas
                </strong>
              </div>

              {evidenceUrl ? (
                <a
                  href={evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-evidence-link"
                >
                  <span>
                    Buka Bukti
                  </span>

                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              ) : (
                <span className="admin-evidence-empty">
                  Tidak tersedia
                </span>
              )}
            </div>

            {status !== 0 ? (
              <div
                className={`admin-verification-result ${
                  status === 1
                    ? "is-approved"
                    : "is-rejected"
                }`}
              >
                <span className="dashboard-section-kicker">
                  HASIL VERIFIKASI
                </span>

                <h2>
                  Aktivitas sudah diverifikasi
                </h2>

                <div className="admin-verification-result-list">
                  <div>
                    <span>Status</span>

                    <strong>
                      {formatStatus(
                        status
                      )}
                    </strong>
                  </div>

                  {activity.feedback ? (
                    <div>
                      <span>
                        Feedback
                      </span>

                      <strong>
                        {String(
                          activity.feedback
                        )}
                      </strong>
                    </div>
                  ) : null}

                  {activity.verifier_name ? (
                    <div>
                      <span>
                        Diverifikasi oleh
                      </span>

                      <strong>
                        {String(
                          activity.verifier_name
                        )}
                      </strong>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          {/* VERIFY FORM */}
          <aside className="admin-verify-action-panel">
            {status === 0 ? (
              <>
                <div className="admin-verify-section-heading">
                  <span className="dashboard-section-kicker">
                    VERIFIKASI
                  </span>

                  <h2>
                    Periksa dan putuskan
                  </h2>

                  <p>
                    Sesuaikan data dengan bukti
                    aktivitas sebelum disetujui atau
                    ditolak.
                  </p>
                </div>

                <VerifyForm
                  id={String(
                    activity.id
                  )}
                  jarak={Number(
                    activity.jarak
                  ).toFixed(2)}
                  avgPace={avgPace}
                  elapsedTime={
                    elapsedTime
                  }
                />
              </>
            ) : (
              <div className="admin-verify-complete">
                <span
                  className="admin-verify-complete-icon"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <strong>
                  Verifikasi selesai
                </strong>

                <p>
                  Aktivitas ini sudah memiliki
                  keputusan dan tidak perlu
                  diverifikasi kembali.
                </p>

                <Link
                  href="/admin/activities"
                  className="admin-verify-back-button"
                >
                  Kembali ke Data
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}