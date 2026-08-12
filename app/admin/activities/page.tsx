import Link from "next/link";

import {
  adminLogoutAction,
} from "@/app/actions/admin";
import { requireAdminAccess } from "@/lib/auth";
import { sql } from "@/lib/db";

function getStatusLabel(status: number) {
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

export default async function AdminActivitiesPage() {
  const admin = await requireAdminAccess();

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

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Subdit</th>
                <th>Gender</th>
                <th>Tanggal</th>
                <th>Jarak</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => {
                const status =
                  Number(activity.status);

                return (
                  <tr key={String(activity.id)}>
                    <td>
                      {String(activity.id)}
                    </td>

                    <td>
                      <strong>
                        {String(activity.nama)}
                      </strong>

                      <small className="table-subtext">
                        {String(activity.nip).trim()}
                      </small>
                    </td>

                    <td>
                      {String(activity.subdit)}
                    </td>

                    <td>
                      {activity.gender === "M"
                        ? "Pria"
                        : "Wanita"}
                    </td>

                    <td>
                      {String(activity.tanggal)}
                    </td>

                    <td>
                      {Number(
                        activity.jarak
                      ).toFixed(2)}{" "}
                      km
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td>
                      <Link
                        href={`/admin/activities/${activity.id}`}
                        className="table-action-link"
                      >
                        {status === 0
                          ? "Verifikasi"
                          : "Lihat"}
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {activities.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="table-empty"
                  >
                    Belum ada data perekaman.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}