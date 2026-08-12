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
    feedback: activity.feedback
      ? String(activity.feedback)
      : null,
  }));

  return (
    <main className="admin-shell">
      <section className="admin-container">
        <div className="admin-page-header">
          <div>
            <span className="eyebrow">
              ATLANTIK RUN 2026
            </span>

            <h1>Data Perekaman</h1>

            <p>
              Login sebagai {admin.nama}
            </p>
          </div>

          <div className="dashboard-actions">
            <Link
              href="/dashboard"
              className="secondary-link"
            >
              Dashboard
            </Link>

            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="secondary-button"
              >
                Keluar Admin
              </button>
            </form>
          </div>
        </div>

        <section className="admin-stats">
          <article className="admin-stat-card">
            <span>Total Data Masuk</span>
            <strong>{Number(stats.total)}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Pending</span>
            <strong>{Number(stats.pending)}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Approved</span>
            <strong>{Number(stats.approved)}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Rejected</span>
            <strong>{Number(stats.rejected)}</strong>
          </article>
        </section>

        <ActivitiesTable
          activities={normalizedActivities}
        />
      </section>
    </main>
  );
}