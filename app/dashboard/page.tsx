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
  if (!seconds) return "-";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatElapsedTime(seconds: number | null) {
  if (!seconds) return "-";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
}

function normalizeExternalUrl(value: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
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

  const maleIndividualLeaderboard = individualLeaderboard.filter(
    (row) => row.gender === "M"
  );

  const femaleIndividualLeaderboard = individualLeaderboard.filter(
    (row) => row.gender === "F"
  );

  return (
    <main className="run-app dashboard-v2">
      {/* Ambient */}
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
        <Link href="/dashboard" className="run-brand">
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>2026</small>
        </Link>

        <div className="run-topbar-actions">
          {user.isadmin ? (
            <Link
              href="/admin/login"
              className="run-admin-link"
            >
              Panel Admin
            </Link>
          ) : null}

          <form action={logoutAction}>
            <button
              type="submit"
              className="run-icon-button"
              aria-label="Keluar"
            >
              <span>Keluar</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </header>

      <div className="run-dashboard-container">
        {/* WELCOME */}
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-kicker">
              DASHBOARD PELARI
            </span>

            <h1>Halo, {user.nama}</h1>

            <p>
              <span>{user.subdit}</span>
              <span className="dashboard-meta-dot">·</span>
              <span>
                {user.gender === "M" ? "Pria" : "Wanita"}
              </span>
            </p>
          </div>

          {canRecord ? (
            <Link
              href="/record"
              className="dashboard-record-desktop"
            >
              <span>Rekam Aktivitas</span>
              <span aria-hidden="true">＋</span>
            </Link>
          ) : null}
        </section>

        {/* RECAP SAYA */}
        <section className="dashboard-recap-v2">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                PENCAPAIAN SAYA
              </span>

              <h2>Recap Saya</h2>
            </div>

            <p>
              Ringkasan aktivitas yang telah disetujui.
            </p>
          </div>

          <div className="dashboard-recap-grid">
            {/* TOTAL DISTANCE */}
            <article className="dashboard-distance-card">
              <div className="dashboard-distance-top">
                <span>Total Jarak</span>

                <span className="dashboard-distance-status">
                  APPROVED
                </span>
              </div>

              <div className="dashboard-distance-value">
                <strong>
                  {formatDistance(
                    personalStats.totalDistance
                  )}
                </strong>

                <span>km</span>
              </div>

              <div
                className="dashboard-distance-line"
                aria-hidden="true"
              >
                <span />
              </div>

              <p>
                Akumulasi seluruh aktivitas lari yang telah
                disetujui.
              </p>
            </article>

            {/* PERSONAL RANK */}
            <div className="dashboard-rank-grid">
              <article
                className={`dashboard-rank-card ${
                  user.gender === "M"
                    ? "dashboard-rank-male"
                    : "dashboard-rank-female"
                }`}
              >
                <div className="dashboard-rank-header">
                  <span>
                    Rank{" "}
                    {user.gender === "M"
                      ? "Pria"
                      : "Wanita"}
                  </span>

                  <button
                    type="button"
                    className="dashboard-info-button"
                    aria-label={`Informasi Rank ${
                      user.gender === "M"
                        ? "Pria"
                        : "Wanita"
                    }`}
                  >
                    ?

                    <span className="dashboard-stat-tooltip">
                      Peringkat personal berdasarkan total
                      jarak Approved dibandingkan dengan
                      seluruh pelari{" "}
                      {user.gender === "M"
                        ? "pria"
                        : "wanita"}
                      .
                    </span>
                  </button>
                </div>

                <strong className="dashboard-rank-value">
                  {personalStats.genderRank
                    ? `#${personalStats.genderRank}`
                    : "-"}
                </strong>

                <span className="dashboard-rank-caption">
                  kategori{" "}
                  {user.gender === "M"
                    ? "pria"
                    : "wanita"}
                </span>
              </article>

              <article className="dashboard-rank-card dashboard-rank-overall">
                <div className="dashboard-rank-header">
                  <span>Overall Rank</span>

                  <button
                    type="button"
                    className="dashboard-info-button"
                    aria-label="Informasi Overall Rank"
                  >
                    ?

                    <span className="dashboard-stat-tooltip">
                      Peringkat personal berdasarkan total
                      jarak Approved dibandingkan dengan
                      seluruh pelari, tanpa membedakan
                      gender.
                    </span>
                  </button>
                </div>

                <strong className="dashboard-rank-value">
                  {personalStats.overallRank
                    ? `#${personalStats.overallRank}`
                    : "-"}
                </strong>

                <span className="dashboard-rank-caption">
                  seluruh pelari
                </span>
              </article>
            </div>
          </div>
        </section>

        {/* AKTIVITAS SAYA */}
        <section className="activity-section dashboard-content-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                AKTIVITAS
              </span>

              <h2>Aktivitas Saya</h2>

              <p>
                Status dan detail perekaman selama tiga hari
                kegiatan.
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
                      {getStatusLabel(activity?.status)}
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
                          <span>Elapsed Time</span>

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
                              href={normalizeExternalUrl(activity.tautan) ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="activity-proof-link"
                            >
                              <span>Lihat Aktivitas</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <strong>-</strong>
                          )}
                        </div>
                      </div>

                      {activity.status === 2 &&
                      activity.feedback ? (
                        <div className="activity-feedback-box">
                          <span>Feedback Admin</span>

                          <p>{activity.feedback}</p>
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

        {/* STATISTIK UMUM */}
        <section className="general-stats-section dashboard-content-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                ATLANTIK RUN
              </span>

              <h2>Statistik Keseluruhan</h2>

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

        {/* LEADERBOARD SUBDIT */}
        <section
          className="leaderboard-section dashboard-content-section"
          id="leaderboard"
        >
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                PERINGKAT TIM
              </span>

              <h2>Leaderboard Subdit</h2>

              <p>
                Peringkat berdasarkan akumulasi jarak
                aktivitas Approved.
              </p>
            </div>
          </div>

          <div className="leaderboard-gender-grid">
            {/* PRIA */}
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    KATEGORI
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
                    {maleSubditLeaderboard.map((row) => (
                      <tr
                        key={`${row.subdit}-${row.gender}`}
                      >
                        <td>
                          <strong>#{row.rank}</strong>
                        </td>

                        <td>
                          <strong>{row.subdit}</strong>
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
                    ))}

                    {maleSubditLeaderboard.length ===
                    0 ? (
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

            {/* WANITA */}
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    KATEGORI
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

                    {femaleSubditLeaderboard.length ===
                    0 ? (
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

        {/* LEADERBOARD INDIVIDUAL */}
        <section className="leaderboard-section dashboard-content-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                PERINGKAT PELARI
              </span>

              <h2>Leaderboard Individual</h2>

              <p>
                Peringkat individu berdasarkan total jarak
                aktivitas Approved.
              </p>
            </div>
          </div>

          <div className="leaderboard-gender-grid">
            {/* PRIA */}
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    INDIVIDUAL
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

                          <td>{row.subdit}</td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>
                        </tr>
                      )
                    )}

                    {maleIndividualLeaderboard.length ===
                    0 ? (
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

            {/* WANITA */}
            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    INDIVIDUAL
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

                          <td>{row.subdit}</td>

                          <td>
                            {formatDistance(
                              row.totalDistance
                            )}{" "}
                            km
                          </td>
                        </tr>
                      )
                    )}

                    {femaleIndividualLeaderboard.length ===
                    0 ? (
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
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        className="run-bottom-nav"
        aria-label="Navigasi utama"
      >
        <Link
          href="/dashboard"
          className="run-bottom-nav-item is-active"
        >
          <span
            className="run-nav-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 10.8 12 3l9 7.8v9.4a.8.8 0 0 1-.8.8h-5.4v-6.2H9.2V21H3.8a.8.8 0 0 1-.8-.8Z" />
            </svg>
          </span>

          <span>Home</span>
        </Link>

        {canRecord ? (
          <Link
            href="/record"
            className="run-bottom-nav-item run-bottom-nav-primary"
          >
            <span
              className="run-nav-primary-icon"
              aria-hidden="true"
            >
              ＋
            </span>

            <span>Lapor</span>
          </Link>
        ) : (
          <span className="run-bottom-nav-item run-bottom-nav-primary is-disabled">
            <span
              className="run-nav-primary-icon"
              aria-hidden="true"
            >
              ＋
            </span>

            <span>Lapor</span>
          </span>
        )}

        <a
          href="#leaderboard"
          className="run-bottom-nav-item"
        >
          <span
            className="run-nav-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M6 20V10M12 20V4M18 20v-7" />
            </svg>
          </span>

          <span>Rank</span>
        </a>
      </nav>
    </main>
  );
}