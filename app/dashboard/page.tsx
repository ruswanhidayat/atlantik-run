import Link from "next/link";

import RunBottomNav from "@/app/components/run-bottom-nav";

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
  getAtlantikRuntime,
  getCurrentRunDateForUser,
  isCompetitionLive,
  RUN_DATES,
} from "@/lib/run-config";

import LastReportingDayNotice
  from "./last-reporting-day-notice";

import AchievementShareButton
  from "./achievement-share-button";

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

function formatLeaderboardDate(
  value: string | null
) {
  if (!value) return null;

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }
  ).format(
    new Date(
      `${value}T00:00:00+07:00`
    )
  );
}

function getMovementSymbol(
  movement:
    | "up"
    | "down"
    | "same"
    | "new"
) {
  if (movement === "up") return "↑";
  if (movement === "down") return "↓";
  if (movement === "new") return "+";

  return "—";
}

function getMovementLabel(
  movement:
    | "up"
    | "down"
    | "same"
    | "new"
) {
  if (movement === "up") {
    return "Peringkat naik";
  }

  if (movement === "down") {
    return "Peringkat turun";
  }

  if (movement === "new") {
    return "Baru masuk leaderboard";
  }

  return "Peringkat tetap";
}

function formatPace(
  seconds: number | null
) {
  if (!seconds) return "-";

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
  if (!seconds) return "-";

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
  if (!value) return null;

  const trimmed =
    value.trim();

  if (!trimmed) return null;

  if (
    trimmed.startsWith(
      "https://"
    ) ||
    trimmed.startsWith(
      "http://"
    )
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default async function DashboardPage() {
  const user =
    await requireUser();

  // TEMPORARY:
  // NIP ini dipakai untuk preview indikator sebelum periode lomba.
  // Hapus pengecualian ini setelah testing selesai.
  const isTestUser =
    user.nip === "921102040";

  const closingStartsAt =
    new Date(
      "2026-08-17T21:00:00+07:00"
    );

  const showClosingCard =
    isTestUser ||
    new Date() >= closingStartsAt;
  const runtime =
    getAtlantikRuntime(
      user.nip
    );

  const currentRunDate =
    getCurrentRunDateForUser(
      user.nip
    );

  const showLastReportingDayNotice =
    Boolean(currentRunDate) &&
    runtime.currentMinutes >= 20 * 60 &&
    runtime.currentMinutes < 21 * 60;

  const showCompetitionLive =
    // isLiveTestUser ||
    isCompetitionLive();

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

    getPersonalStats(
      user.nip
    ),

    getGeneralStats(),

    getSubditGenderLeaderboard(),

    getIndividualLeaderboard(),
  ]);

  const activityMap =
    new Map<
      string,
      ActivityStatus
    >(
      activities.map(
        (activity) => [
          String(
            activity.tanggal
          ),

          {
            tanggal: String(
              activity.tanggal
            ),

            status: Number(
              activity.status
            ),

            feedback:
              activity.feedback
                ? String(
                    activity.feedback
                  )
                : null,

            jarak:
              activity.jarak !==
              null
                ? Number(
                    activity.jarak
                  )
                : null,

            avgPaceSeconds:
              activity.avg_pace_seconds !==
              null
                ? Number(
                    activity.avg_pace_seconds
                  )
                : null,

            elapsedTimeSeconds:
              activity.elapsed_time_seconds !==
              null
                ? Number(
                    activity.elapsed_time_seconds
                  )
                : null,

            tautan:
              activity.tautan
                ? String(
                    activity.tautan
                  )
                : null,
          },
        ]
      )
    );

  // const currentActivity =
  //   currentRunDate
  //     ? activityMap.get(
  //         currentRunDate
  //       )
  //     : null;

  // const canRecord =
  //   Boolean(
  //     currentRunDate
  //   ) &&
  //   (
  //     !currentActivity ||
  //     currentActivity.status === 2
  //   );

  const canRecord =
    Boolean(
      currentRunDate
    );

  const maleSubditLeaderboard =
    subditLeaderboard.filter(
      (row) =>
        row.gender === "M"
    );

  const femaleSubditLeaderboard =
    subditLeaderboard.filter(
      (row) =>
        row.gender === "F"
    );

  const subditComparisonDate =
    formatLeaderboardDate(
      subditLeaderboard[0]
        ?.comparisonDate ?? null
    );

  const maleIndividualLeaderboard =
    individualLeaderboard
      .filter(
        (row) =>
          row.gender === "M"
      )
      .slice(0, 5);

  const femaleIndividualLeaderboard =
    individualLeaderboard
      .filter(
        (row) =>
          row.gender === "F"
      )
      .slice(0, 5);

  const genderRankClass =
    user.gender === "M"
      ? "dashboard-rank-male"
      : "dashboard-rank-female";

  return (
    <main
      className="run-app dashboard-v2"
      id="dashboard-top"
    >
      <div
        className="run-app-glow run-app-glow-one"
        aria-hidden="true"
      />

      <div
        className="run-app-glow run-app-glow-two"
        aria-hidden="true"
      />

      <LastReportingDayNotice
        show={showLastReportingDayNotice}
      />

      {/* TOP BAR */}
      <header className="run-topbar">
        <span className="run-brand">
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>2026</small>
        </span>

        <div className="run-topbar-actions">
          <Link
            href="/info"
            className="run-admin-link run-info-desktop-link"
          >
            Info
          </Link>

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
            >
              <span>Keluar</span>
              <span aria-hidden="true">
                ↗
              </span>
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

            <h1>
              Halo, {user.nama}
            </h1>

            <p>
              <span>
                {user.subdit}
              </span>

              <span className="dashboard-meta-dot">
                ·
              </span>

              <span>
                {user.gender ===
                "M"
                  ? "Pria"
                  : "Wanita"}
              </span>
            </p>

            {showCompetitionLive ? (
              <div className="run-live-indicator">
                <span
                  className="run-live-indicator-dot"
                  aria-hidden="true"
                />

                <span>
                  ATLANTIK RUN Sedang Berlangsung
                </span>
              </div>
            ) : null}
          </div>

          {canRecord ? (
            <Link
              href="/record"
              className="dashboard-record-desktop"
            >
              <span>
                Rekam Aktivitas
              </span>

              <span aria-hidden="true">
                ＋
              </span>
            </Link>
          ) : (
            <span className="dashboard-record-desktop is-disabled">
              <span>
                Rekam Aktivitas
              </span>

              <span aria-hidden="true">
                ＋
              </span>
            </span>
          )}
        </section>

        {showClosingCard ? (
          <section className="run-closing-card">
            <div
              className="run-closing-card__icon"
              aria-hidden="true"
            >
              🏁
            </div>

            <div className="run-closing-card__content">
              <span className="run-closing-card__eyebrow">
                ATLANTIK RUN
              </span>

              <h2 className="run-closing-card__title">
                We made it to the finish line!
              </h2>

              <p className="run-closing-card__text">
                Atlantik Run telah selesai.
                Terima kasih untuk seluruh peserta
                yang sudah berlari, mencatat kilometer,
                dan ikut membawa semangat kompetisi
                antar-Subdit selama kegiatan berlangsung.
              </p>

              <p className="run-closing-card__message">
                Menang atau tidak, setiap kilometer
                tetap berarti.
                <br />

                <strong>
                  Thank you for running with us.
                  See you on the next challenge!
                </strong>
              </p>

              <AchievementShareButton
                nama={user.nama}
                subdit={user.subdit}
                gender={user.gender}
                totalDistance={
                  personalStats.totalDistance
                }
                genderRank={
                  personalStats.genderRank
                }
                overallRank={
                  personalStats.overallRank
                }
              />
            </div>
          </section>
        ) : null}

        {/* RECAP */}
        <section className="dashboard-recap-v2">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                PENCAPAIAN SAYA
              </span>

              <h2>
                Recap Saya
              </h2>
            </div>

            <p>
              Ringkasan aktivitas yang
              telah disetujui.
            </p>
          </div>

          <div className="dashboard-recap-grid">
            <article className="dashboard-distance-card">
              <div className="dashboard-distance-top">
                <span>
                  Total Jarak
                </span>

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
                Akumulasi seluruh
                aktivitas lari yang
                telah disetujui.
              </p>
            </article>

            <div className="dashboard-rank-grid">
              <article
                className={`dashboard-rank-card ${genderRankClass}`}
              >
                <div className="dashboard-rank-header">
                  <span>
                    Rank{" "}
                    {user.gender ===
                    "M"
                      ? "Pria"
                      : "Wanita"}
                  </span>

                  <button
                    type="button"
                    className="dashboard-info-button"
                    aria-label="Informasi peringkat gender"
                  >
                    ?

                    <span className="dashboard-stat-tooltip">
                      Peringkat personal
                      berdasarkan total
                      jarak Approved
                      dibandingkan dengan
                      seluruh pelari{" "}
                      {user.gender ===
                      "M"
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
                  {user.gender ===
                  "M"
                    ? "pria"
                    : "wanita"}
                </span>
              </article>

              <article className="dashboard-rank-card dashboard-rank-overall">
                <div className="dashboard-rank-header">
                  <span>
                    Overall Rank
                  </span>

                  <button
                    type="button"
                    className="dashboard-info-button"
                    aria-label="Informasi overall rank"
                  >
                    ?

                    <span className="dashboard-stat-tooltip">
                      Peringkat personal
                      berdasarkan total
                      jarak Approved
                      dibandingkan dengan
                      seluruh pelari,
                      tanpa membedakan
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

        {/* ACTIVITY */}
        <section className="activity-section dashboard-content-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                AKTIVITAS
              </span>

              <h2>
                Aktivitas Saya
              </h2>

              <p>
                Status dan detail
                perekaman selama tiga
                hari kegiatan.
              </p>
            </div>
          </div>

          <div className="activity-grid">
            {RUN_DATES.map(
              (date) => {
                const activity =
                  activityMap.get(
                    date.value
                  );

                return (
                  <article
                    key={
                      date.value
                    }
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
                            <span>
                              Jarak
                            </span>

                            <strong>
                              {activity.jarak !==
                              null
                                ? `${formatDistance(
                                    activity.jarak
                                  )} km`
                                : "-"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Avg. Pace
                            </span>

                            <strong>
                              {formatPace(
                                activity.avgPaceSeconds
                              )}{" "}
                              /km
                            </strong>
                          </div>

                          <div>
                            <span>
                              Elapsed
                              Time
                            </span>

                            <strong>
                              {formatElapsedTime(
                                activity.elapsedTimeSeconds
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Bukti
                            </span>

                            {activity.tautan ? (
                              <a
                                href={
                                  normalizeExternalUrl(
                                    activity.tautan
                                  ) ??
                                  "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="activity-proof-link"
                              >
                                <span>
                                  Lihat
                                  Aktivitas
                                </span>

                                <span aria-hidden="true">
                                  ↗
                                </span>
                              </a>
                            ) : (
                              <strong>
                                -
                              </strong>
                            )}
                          </div>
                        </div>

                        {activity.feedback ? (
                          <div
                            className={`activity-feedback-box ${
                              activity.status ===
                              2
                                ? "activity-feedback-rejected"
                                : "activity-feedback-approved"
                            }`}
                          >
                            <span>
                              Feedback
                              Admin
                            </span>

                            <p>
                              {
                                activity.feedback
                              }
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="activity-empty-text">
                        Belum ada
                        aktivitas yang
                        direkam.
                      </p>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* GENERAL STATS */}
        <section className="general-stats-section dashboard-content-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                ATLANTIK RUN
              </span>

              <h2>
                Statistik Keseluruhan
              </h2>

              <p>
                Akumulasi aktivitas
                yang sudah disetujui.
              </p>
            </div>
          </div>

          <div className="general-stat-grid">
            <article className="general-stat-card">
              <span>
                Total Pelari
              </span>

              <strong>
                {
                  generalStats.totalRunners
                }
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

              <small>km</small>
            </article>
          </div>
        </section>

        {/* SUBDIT */}
        <section
          className="leaderboard-section dashboard-content-section"
          id="leaderboard"
        >
          <div className="section-heading">
            <div>
              <span className="dashboard-section-kicker">
                PERINGKAT TIM
              </span>

              <h2>
                Leaderboard Subdit
              </h2>

              <p>
                Peringkat berdasarkan
                akumulasi jarak
                aktivitas Approved.
              </p>
            </div>
          </div>

          {subditComparisonDate ? (
            <div className="leaderboard-comparison-note">
              Peringkat dibandingkan dengan{" "}
              <strong>
                {subditComparisonDate}
              </strong>
            </div>
          ) : null}

          <div className="leaderboard-gender-grid">
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
                      <th>
                        Rank
                      </th>
                      <th>
                        Subdit
                      </th>
                      <th>
                        Jarak
                      </th>
                      <th>
                        Partisipasi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {maleSubditLeaderboard.map(
                      (row) => (
                        <tr
                          key={`${row.subdit}-${row.gender}`}
                        >
                          <td>
                            <span className="leaderboard-rank-with-movement">
                              <strong>
                                #{row.rank}
                              </strong>

                              <span
                                className={`leaderboard-rank-movement is-${row.rankMovement}`}
                                aria-label={getMovementLabel(
                                  row.rankMovement
                                )}
                                title={getMovementLabel(
                                  row.rankMovement
                                )}
                              >
                                {getMovementSymbol(
                                  row.rankMovement
                                )}
                              </span>
                            </span>
                          </td>

                          <td>
                            <strong>
                              {
                                row.subdit
                              }
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
                              {
                                row.activeRunners
                              }
                              /
                              {
                                row.totalUsers
                              }{" "}
                              pelari
                            </small>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    KATEGORI
                  </span>

                  <h3>
                    Wanita
                  </h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>
                        Rank
                      </th>
                      <th>
                        Subdit
                      </th>
                      <th>
                        Jarak
                      </th>
                      <th>
                        Partisipasi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {femaleSubditLeaderboard.map(
                      (row) => (
                        <tr
                          key={`${row.subdit}-${row.gender}`}
                        >
                          <td>
                            <span className="leaderboard-rank-with-movement">
                              <strong>
                                #{row.rank}
                              </strong>

                              <span
                                className={`leaderboard-rank-movement is-${row.rankMovement}`}
                                aria-label={getMovementLabel(
                                  row.rankMovement
                                )}
                                title={getMovementLabel(
                                  row.rankMovement
                                )}
                              >
                                {getMovementSymbol(
                                  row.rankMovement
                                )}
                              </span>
                            </span>
                          </td>

                          <td>
                            <strong>
                              {
                                row.subdit
                              }
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
                              {
                                row.activeRunners
                              }
                              /
                              {
                                row.totalUsers
                              }{" "}
                              pelari
                            </small>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          {subditComparisonDate ? (
            <div className="leaderboard-movement-legend">
              <span>
                <i className="is-up">↑</i>
                Naik
              </span>

              <span>
                <i className="is-down">↓</i>
                Turun
              </span>

              <span>
                <i className="is-same">—</i>
                Tetap
              </span>

              <span>
                <i className="is-new">+</i>
                Baru
              </span>
            </div>
          ) : null}
        </section>

        {/* INDIVIDUAL */}
        <section className="leaderboard-section dashboard-content-section">
          <div className="section-heading dashboard-individual-heading">
            <div>
              <span className="dashboard-section-kicker">
                PERINGKAT PELARI
              </span>

              <h2>
                Leaderboard Individual
              </h2>

              <p>
                Menampilkan Top 5 per kategori
                berdasarkan total jarak aktivitas
                Approved.
              </p>
            </div>

            <Link
              href="/leaderboard"
              className="dashboard-leaderboard-all-link"
            >
              <span>Lihat Semua Peringkat</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="full-leaderboard-scroll-hint">
            <span aria-hidden="true">←</span>
            Geser tabel untuk melihat data lengkap
            <span aria-hidden="true">→</span>
          </div>

          <div className="leaderboard-gender-grid">
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
                      <th>
                        Rank
                      </th>
                      <th>
                        Overall
                      </th>
                      <th>
                        Nama
                      </th>
                      <th>
                        Subdit
                      </th>
                      <th>
                        Jarak
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {maleIndividualLeaderboard.map(
                      (row) => (
                        <tr
                          key={
                            row.nip
                          }
                        >
                          <td>
                            <strong>
                              #
                              {
                                row.genderRank
                              }
                            </strong>
                          </td>

                          <td>
                            #
                            {
                              row.overallRank
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                row.nama
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              row.subdit
                            }
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
                  </tbody>
                </table>
              </div>
            </section>

            <section className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div>
                  <span className="leaderboard-label">
                    INDIVIDUAL
                  </span>

                  <h3>
                    Wanita
                  </h3>
                </div>
              </div>

              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table individual-leaderboard-table">
                  <thead>
                    <tr>
                      <th>
                        Rank
                      </th>
                      <th>
                        Overall
                      </th>
                      <th>
                        Nama
                      </th>
                      <th>
                        Subdit
                      </th>
                      <th>
                        Jarak
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {femaleIndividualLeaderboard.map(
                      (row) => (
                        <tr
                          key={
                            row.nip
                          }
                        >
                          <td>
                            <strong>
                              #
                              {
                                row.genderRank
                              }
                            </strong>
                          </td>

                          <td>
                            #
                            {
                              row.overallRank
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                row.nama
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              row.subdit
                            }
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
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>

      <RunBottomNav
        dashboardMode
        canRecord={canRecord}
        isAdmin={Boolean(
          user.isadmin
        )}
      />
    </main>
  );
}