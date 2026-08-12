import Link from "next/link";

import { adminLogoutAction } from "@/app/actions/admin";
import { requireAdminAccess } from "@/lib/auth";
import { sql } from "@/lib/db";

import ActivitiesTable from "./activities-table";

export default async function AdminActivitiesPage() {
  const admin = await requireAdminAccess();

  const statsRows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 0)::int AS pending,
      COUNT(*) FILTER (WHERE status = 1)::int AS approved,
      COUNT(*) FILTER (WHERE status = 2)::int AS rejected
    FROM run_activities
  `;

  const stats = statsRows[0];

  const activities = await sql`
    SELECT
      ra.id,
      ra.nip,
      u.nama,
      u.subdit,
      u.gender,
      ra.tanggal::text AS tanggal,
      ra.jarak,
      ra.tgl_rekam,
      ra.status,
      ra.avg_pace_seconds,
      ra.elapsed_time_seconds,
      ra.feedback
    FROM run_activities ra
    JOIN users u
      ON u.nip = ra.nip
    ORDER BY
      CASE WHEN ra.status = 0 THEN 0 ELSE 1 END,
      ra.tgl_rekam DESC
  `;

  const normalizedActivities = activities.map((activity) => ({
    id: String(activity.id),
    nip: String(activity.nip).trim(),
    nama: String(activity.nama),
    subdit: String(activity.subdit),
    gender: String(activity.gender),
    tanggal: String(activity.tanggal),
    jarak: Number(activity.jarak),
    status: Number(activity.status),
    avgPaceSeconds:
      activity.avg_pace_seconds !== null
        ? Number(activity.avg_pace_seconds)
        : null,
    elapsedTimeSeconds:
      activity.elapsed_time_seconds !== null
        ? Number(activity.elapsed_time_seconds)
        : null,
    feedback: activity.feedback
      ? String(activity.feedback)
      : null,
  }));

  return (
    <main className="run-app admin-activities-v2">
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

        <div className="run-topbar-actions">
          <Link
            href="/dashboard"
            className="run-admin-link"
          >
            Dashboard
          </Link>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="run-icon-button"
            >
              <span>Keluar Admin</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </header>

      <div className="admin-activities-container">
        <section className="admin-activities-heading">
          <div>
            <span className="dashboard-kicker">
              PANEL VERIFIKASI
            </span>

            <h1>Data Perekaman</h1>

            <p>
              Login sebagai <strong>{admin.nama}</strong>
            </p>
          </div>
        </section>

        <section className="admin-stats-v2">
          <article className="admin-stat-card-v2 admin-stat-total">
            <span>Total Data Masuk</span>
            <strong>{Number(stats.total)}</strong>
            <small>seluruh aktivitas</small>
          </article>

          <article className="admin-stat-card-v2 admin-stat-pending">
            <span>Pending</span>
            <strong>{Number(stats.pending)}</strong>
            <small>menunggu verifikasi</small>
          </article>

          <article className="admin-stat-card-v2 admin-stat-approved">
            <span>Approved</span>
            <strong>{Number(stats.approved)}</strong>
            <small>sudah disetujui</small>
          </article>

          <article className="admin-stat-card-v2 admin-stat-rejected">
            <span>Rejected</span>
            <strong>{Number(stats.rejected)}</strong>
            <small>ditolak</small>
          </article>
        </section>

        <ActivitiesTable
          activities={normalizedActivities}
        />
      </div>
    </main>
  );
}