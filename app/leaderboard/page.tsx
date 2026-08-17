import Link from "next/link";

import RunBottomNav from "@/app/components/run-bottom-nav";
import LeaderboardClient from "./leaderboard-client";

import { requireUser } from "@/lib/auth";
import { getIndividualLeaderboard } from "@/lib/dashboard";
import {
  getCurrentRunDateForUser,
} from "@/lib/run-config";

export default async function LeaderboardPage() {
  const user = await requireUser();
  
  const leaderboard =
    await getIndividualLeaderboard();

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
      previousGenderRank:
        row.previousGenderRank === null
          ? null
          : Number(
              row.previousGenderRank
            ),

      rankMovement:
        row.rankMovement,

      comparisonDate:
        row.comparisonDate,
    }));

  const currentRunDate =
    getCurrentRunDateForUser(
      user.nip
    );

  const canRecord =
    Boolean(
      currentRunDate
    );

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
        <div className="run-brand">
            <span className="run-brand-dot" />
            <span>ATLANTIK RUN</span>
            <small>2026</small>
        </div>

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

      <RunBottomNav
        active="rank"
        canRecord={canRecord}
        isAdmin={Boolean(
          user.isadmin
        )}
      />
    </main>
  );
}