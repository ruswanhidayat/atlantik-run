import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  getGeneralStats,
  getIndividualLeaderboard,
  getPersonalStats,
  getSubditGenderLeaderboard,
} from "@/lib/dashboard";
import {
  isSubmissionOpen,
  RUN_DATES,
} from "@/lib/run-config";

type ActivityStatus = {
  tanggal: string;
  status: number;
  feedback: string | null;
  jarak: number | null;
  avgPaceSeconds: number | null;
  elapsedTimeSeconds: number | null;
  tautan: string | null;
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

function formatPercentage(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatPace(seconds: number | null) {
  if (!seconds) {
    return "-";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatElapsedTime(seconds: number | null) {
  if (!seconds) {
    return "-";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    activities,
    personalStats,
    generalStats,
    subditLeaderboard,
    individualLeaderboard,
  ] = await Promise.all([
    sql`
      SELECT DISTINCT ON (tanggal)
        tanggal::text AS tanggal,
        status,
        feedback,
        jarak,
        avg_pace_seconds,
        elapsed_time_seconds,
        tautan
      FROM run_activities
      WHERE nip = ${user.nip}
      ORDER BY
        tanggal,
        tgl_rekam DESC,
        id DESC
    `,

    getPersonalStats(user.nip),

    getGeneralStats(),

    getSubditGenderLeaderboard(),

    getIndividualLeaderboard(),
  ]);

  const activityMap = new Map<string, ActivityStatus>(
    activities.map((activity) => [
      String(activity.tanggal),
      {
        tanggal: String(activity.tanggal),
        status: Number(activity.status),
        feedback: activity.feedback
          ? String(activity.feedback)
          : null,
        jarak:
          activity.jarak !== null
            ? Number(activity.jarak)
            : null,
        avgPaceSeconds:
          activity.avg_pace_seconds !== null
            ? Number(activity.avg_pace_seconds)
            : null,
        elapsedTimeSeconds:
          activity.elapsed_time_seconds !== null
            ? Number(activity.elapsed_time_seconds)
            : null,
        tautan: activity.tautan
          ? String(activity.tautan)
          : null,
      },
    ])
  );

  const canRecord =
    isSubmissionOpen() &&
    RUN_DATES.some((date) => {
      const activity = activityMap.get(date.value);

      return !activity || activity.status === 2;
    });

  const maleSubditLeaderboard = subditLeaderboard.filter(
    (row) => row.gender === "M"
  );

  const femaleSubditLeaderboard = subditLeaderboard.filter(
    (row) => row.gender === "F"
  );

  const maleIndividualLeaderboard =
    individualLeaderboard.filter(
      (row) => row.gender === "M"
    );

  const femaleIndividualLeaderboard =
    individualLeaderboard.filter(
      (row) => row.gender === "F"
    );

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
              <span>Total Jarak</span>

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
              <span>Overall Rank</span>

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
              <h2>Aktivitas Saya</h2>

              <p>
                Status dan detail perekaman selama tiga hari kegiatan.
              </p>
            </div>
          </div>

          <div className="activity-grid">
            {RUN_DATES.map((date) => {
              const activity = activityMap.get(date.value);

              return (
                <article
                  key={date.value}
                  className="activity-item activity-item-detail"
                >
                  <div className="activity-item-header">
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
                  </div>

                  {activity ? (
                    <>
                      <div className="activity-detail-grid">
                        <div>
                          <span>Jarak</span>
                          <strong>
                            {activity.jarak !== null
                              ? `${formatDistance(
                                  activity.jarak
                                )} km`
                              : "-"}
                          </strong>
                        </div>

                        <div>
                          <span>Avg. Pace</span>
                          <strong>
                            {formatPace(
                              activity.avgPaceSeconds
                            )}{" "}
                            /km
                          </strong>
                        </div>

                        <div>
                          <span>
                            Elapsed Time
                          </span>

                          <strong>
                            {formatElapsedTime(
                              activity.elapsedTimeSeconds
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Bukti</span>

                          {activity.tautan ? (
                            <a
                              href={activity.tautan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="activity-proof-link"
                            >
                              Lihat Aktivitas
                            </a>
                          ) : (
                            <strong>-</strong>
                          )}
                        </div>
                      </div>

                      {activity.status === 2 &&
                      activity.feedback ? (
                        <div className="activity-feedback-box">
                          <span>
                            Feedback Admin
                          </span>

                          <p>
                            {activity.feedback}
                          </p>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="activity-empty-text">
                      Belum ada aktivitas yang direkam.
                    </p>
                  )}
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
              <span>Total Pelari</span>

              <strong>
                {generalStats.totalRunners}
              </strong>

              <small>peserta</small>
            </article>

            <article className="general-stat-card">
              <span>Total Jarak</span>

              <strong>
                {formatDistance(
                  generalStats.totalDistance
                )}
              </strong>

              <small>km</small>
            </article>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Leaderboard Subdit
              </h2>

              <p>
                Peringkat berdasarkan akumulasi jarak
                aktivitas Approved.
              </p>
            </div>
          </div>

          <div className="leaderboard-gender-grid">
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    Kategori
                  </span>

                  <h3>Pria</h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Subdit</th>
                      <th>Jarak</th>
                      <th>Partisipasi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {maleSubditLeaderboard.map(
                      (row) => (
                        <tr
                          key={`${row.subdit}-${row.gender}`}
                        >
                          <td>
                            <strong>
                              #{row.rank}
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {row.subdit}
                            </strong>
                          </td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>

                          <td>
                            <strong>
                              {formatPercentage(
                                row.participationRate
                              )}
                              %
                            </strong>

                            <small className="leaderboard-subtext">
                              {row.activeRunners}/
                              {row.totalUsers} pelari
                            </small>
                          </td>
                        </tr>
                      )
                    )}

                    {maleSubditLeaderboard.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="table-empty"
                        >
                          Belum ada data.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    Kategori
                  </span>

                  <h3>Wanita</h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Subdit</th>
                      <th>Jarak</th>
                      <th>Partisipasi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {femaleSubditLeaderboard.map(
                      (row) => (
                        <tr
                          key={`${row.subdit}-${row.gender}`}
                        >
                          <td>
                            <strong>
                              #{row.rank}
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {row.subdit}
                            </strong>
                          </td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>

                          <td>
                            <strong>
                              {formatPercentage(
                                row.participationRate
                              )}
                              %
                            </strong>

                            <small className="leaderboard-subtext">
                              {row.activeRunners}/
                              {row.totalUsers} pelari
                            </small>
                          </td>
                        </tr>
                      )
                    )}

                    {femaleSubditLeaderboard.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="table-empty"
                        >
                          Belum ada data.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Leaderboard Individual
              </h2>

              <p>
                Peringkat individu berdasarkan total jarak
                aktivitas Approved.
              </p>
            </div>
          </div>

          <div className="leaderboard-gender-grid">
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    Individual
                  </span>

                  <h3>Pria</h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table individual-leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Overall</th>
                      <th>Nama</th>
                      <th>Subdit</th>
                      <th>Jarak</th>
                    </tr>
                  </thead>

                  <tbody>
                    {maleIndividualLeaderboard.map(
                      (row) => (
                        <tr key={row.nip}>
                          <td>
                            <strong>
                              #{row.genderRank}
                            </strong>
                          </td>

                          <td>
                            #{row.overallRank}
                          </td>

                          <td>
                            <strong>
                              {row.nama}
                            </strong>
                          </td>

                          <td>
                            {row.subdit}
                          </td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>
                        </tr>
                      )
                    )}

                    {maleIndividualLeaderboard.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="table-empty"
                        >
                          Belum ada data Approved.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    Individual
                  </span>

                  <h3>Wanita</h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table individual-leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Overall</th>
                      <th>Nama</th>
                      <th>Subdit</th>
                      <th>Jarak</th>
                    </tr>
                  </thead>

                  <tbody>
                    {femaleIndividualLeaderboard.map(
                      (row) => (
                        <tr key={row.nip}>
                          <td>
                            <strong>
                              #{row.genderRank}
                            </strong>
                          </td>

                          <td>
                            #{row.overallRank}
                          </td>

                          <td>
                            <strong>
                              {row.nama}
                            </strong>
                          </td>

                          <td>
                            {row.subdit}
                          </td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>
                        </tr>
                      )
                    )}

                    {femaleIndividualLeaderboard.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="table-empty"
                        >
                          Belum ada data Approved.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}