import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  getGeneralStats,
  getPersonalStats,
} from "@/lib/dashboard";
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
  if (status === 0) return "Pending";
  if (status === 1) return "Approved";
  if (status === 2) return "Rejected";

  return "Belum Rekam";
}

function getStatusClass(status?: number) {
  if (status === 0) return "status-pending";
  if (status === 1) return "status-approved";
  if (status === 2) return "status-rejected";

  return "status-empty";
}

function formatDistance(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    activities,
    personalStats,
    generalStats,
  ] = await Promise.all([
    sql`
      SELECT DISTINCT ON (tanggal)
        tanggal::text AS tanggal,
        status,
        feedback
      FROM run_activities
      WHERE nip = ${user.nip}
      ORDER BY
        tanggal,
        tgl_rekam DESC,
        id DESC
    `,

    getPersonalStats(user.nip),

    getGeneralStats(),
  ]);

  const activityMap =
    new Map<string, ActivityStatus>(
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
      const activity =
        activityMap.get(date.value);

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

            <h1>
              Halo, {user.nama}
            </h1>

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

        <section className="personal-recap">
          <div className="section-heading">
            <div>
              <h2>Recap Saya</h2>

              <p>
                Ringkasan pencapaian ATLANTIK RUN.
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

          <div className="personal-stat-grid">
            <article className="personal-stat-card">
              <span>
                Total Jarak
              </span>

              <strong>
                {formatDistance(
                  personalStats.totalDistance
                )}
              </strong>

              <small>km</small>
            </article>

            <article className="personal-stat-card">
              <span>
                Rank{" "}
                {user.gender === "M"
                  ? "Pria"
                  : "Wanita"}
              </span>

              <strong>
                {personalStats.genderRank
                  ? `#${personalStats.genderRank}`
                  : "-"}
              </strong>
            </article>

            <article className="personal-stat-card">
              <span>
                Overall Rank
              </span>

              <strong>
                {personalStats.overallRank
                  ? `#${personalStats.overallRank}`
                  : "-"}
              </strong>
            </article>
          </div>
        </section>

        <section className="activity-section">
          <div className="section-heading">
            <div>
              <h2>
                Aktivitas Saya
              </h2>

              <p>
                Status perekaman selama tiga hari kegiatan.
              </p>
            </div>
          </div>

          <div className="activity-grid">
            {RUN_DATES.map((date) => {
              const activity =
                activityMap.get(
                  date.value
                );

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

        <section className="general-stats-section">
          <div className="section-heading">
            <div>
              <h2>
                Statistik ATLANTIK RUN
              </h2>

              <p>
                Akumulasi aktivitas yang sudah disetujui.
              </p>
            </div>
          </div>

          <div className="general-stat-grid">
            <article className="general-stat-card">
              <span>
                Total Pelari
              </span>

              <strong>
                {generalStats.totalRunners}
              </strong>

              <small>
                peserta
              </small>
            </article>

            <article className="general-stat-card">
              <span>
                Total Jarak
              </span>

              <strong>
                {formatDistance(
                  generalStats.totalDistance
                )}
              </strong>

              <small>
                km
              </small>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}