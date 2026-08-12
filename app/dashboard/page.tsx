import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  isSubmissionOpen,
  RUN_DATES,
} from "@/lib/run-config";

type ActivityStatus = {
  tanggal: string;
  status: number;
  feedback: string | null;
};

function getStatusLabel(status?: number) {
  if (status === 0) {
    return "Pending";
  }

  if (status === 1) {
    return "Approved";
  }

  if (status === 2) {
    return "Rejected";
  }

  return "Belum Rekam";
}

function getStatusClass(status?: number) {
  if (status === 0) {
    return "status-pending";
  }

  if (status === 1) {
    return "status-approved";
  }

  if (status === 2) {
    return "status-rejected";
  }

  return "status-empty";
}

export default async function DashboardPage() {
  const user = await requireUser();

  /*
   * DISTINCT ON mengambil submission terakhir
   * pada masing-masing tanggal.
   *
   * Ini penting karena satu tanggal dapat mempunyai
   * beberapa histori jika sebelumnya pernah rejected.
   */
  const activities = await sql`
    SELECT DISTINCT ON (tanggal)
      tanggal::text AS tanggal,
      status,
      feedback
    FROM run_activities
    WHERE nip = ${user.nip}
    ORDER BY tanggal, tgl_rekam DESC, id DESC
  `;

  const activityMap = new Map<string, ActivityStatus>(
    activities.map((activity) => [
      String(activity.tanggal),
      {
        tanggal: String(activity.tanggal),
        status: Number(activity.status),
        feedback: activity.feedback
          ? String(activity.feedback)
          : null,
      },
    ])
  );

  const canRecord =
    isSubmissionOpen() &&
    RUN_DATES.some((date) => {
      const activity = activityMap.get(date.value);

      return (
        !activity ||
        activity.status === 2
      );
    });

  return (
    <main className="shell dashboard-shell">
      <section className="card dashboard-card">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">
              ATLANTIK RUN 2026
            </span>

            <h1>Halo, {user.nama}</h1>

            <p>
              {user.subdit} ·{" "}
              {user.gender === "M"
                ? "Pria"
                : "Wanita"}
            </p>
          </div>

          <div className="dashboard-actions">
            {user.isadmin ? (
              <Link
                href="/admin/login"
                className="primary-link"
              >
                Panel Admin
              </Link>
            ) : null}

            <form action={logoutAction}>
              <button
                type="submit"
                className="secondary-button"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        <section className="activity-section">
          <div className="section-heading">
            <div>
              <h2>Aktivitas Saya</h2>

              <p>
                Status perekaman ATLANTIK RUN
                selama tiga hari kegiatan.
              </p>
            </div>

            {canRecord ? (
              <Link
                href="/record"
                className="primary-link"
              >
                Rekam Aktivitas
              </Link>
            ) : null}
          </div>

          <div className="activity-grid">
            {RUN_DATES.map((date) => {
              const activity =
                activityMap.get(date.value);

              return (
                <article
                  key={date.value}
                  className="activity-item"
                >
                  <span className="activity-date">
                    {date.label}
                  </span>

                  <span
                    className={`status-badge ${getStatusClass(
                      activity?.status
                    )}`}
                  >
                    {getStatusLabel(
                      activity?.status
                    )}
                  </span>

                  {activity?.status === 2 &&
                  activity.feedback ? (
                    <p className="activity-feedback">
                      {activity.feedback}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}