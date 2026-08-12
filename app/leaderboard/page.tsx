import Link from "next/link";

import LeaderboardBottomNav from "./leaderboard-bottom-nav";
import LeaderboardClient from "./leaderboard-client";

import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getIndividualLeaderboard } from "@/lib/dashboard";
import {
  isSubmissionOpen,
  RUN_DATES,
} from "@/lib/run-config";

export default async function LeaderboardPage() {
  const user = await requireUser();

  const [leaderboard, activities] =
    await Promise.all([
      getIndividualLeaderboard(),

      sql`
        SELECT DISTINCT ON (tanggal)
          tanggal::text AS tanggal,
          status
        FROM run_activities
        WHERE nip = ${user.nip}
        ORDER BY
          tanggal,
          tgl_rekam DESC,
          id DESC
      `,
    ]);

  const normalizedLeaderboard =
    leaderboard.map((row) => ({
      nip: String(row.nip).trim(),
      nama: String(row.nama),
      subdit: String(row.subdit),
      gender: String(row.gender),
      totalDistance: Number(
        row.totalDistance
      ),
      genderRank: Number(
        row.genderRank
      ),
      overallRank: Number(
        row.overallRank
      ),
    }));

  const activityMap = new Map(
    activities.map((activity) => [
      String(activity.tanggal),
      Number(activity.status),
    ])
  );

  const canRecord =
    isSubmissionOpen() &&
    RUN_DATES.some((date) => {
      const status =
        activityMap.get(date.value);

      return (
        status === undefined ||
        status === 2
      );
    });

  return (
    <main className="run-app full-leaderboard-v2">
      <div
        className="run-app-glow run-app-glow-one"
        aria-hidden="true"
      />

      <div
        className="run-app-glow run-app-glow-two"
        aria-hidden="true"
      />

      <header className="run-topbar">
        <Link
          href="/dashboard"
          className="run-brand"
        >
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>2026</small>
        </Link>

        <Link
          href="/dashboard#leaderboard"
          className="run-admin-link"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="full-leaderboard-container">
        <section className="full-leaderboard-heading">
          <span className="dashboard-kicker">
            PERINGKAT PELARI
          </span>

          <h1>
            Leaderboard Individual
          </h1>

          <p>
            Lihat seluruh peringkat pelari
            berdasarkan total jarak aktivitas
            Approved.
          </p>
        </section>

        <LeaderboardClient
          leaderboard={
            normalizedLeaderboard
          }
        />
      </div>

      <LeaderboardBottomNav
        canRecord={canRecord}
        isAdmin={Boolean(
          user.isadmin
        )}
      />
    </main>
  );
}