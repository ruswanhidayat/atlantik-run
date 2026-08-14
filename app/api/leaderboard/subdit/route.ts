import { NextResponse } from "next/server";

import {
  getSubditGenderLeaderboard,
} from "@/lib/dashboard";

import { sql } from "@/lib/db";

import {
  SUBMISSION_DEADLINE,
} from "@/lib/run-config";


export const dynamic =
  "force-dynamic";


type PublicLeaderboardRow = {
  rank: number;
  subdit: string;
  totalDistance: number;
};


function mapLeaderboardRow(
  row: {
    rank: number;
    subdit: string;
    totalDistance: number;
  }
): PublicLeaderboardRow {
  return {
    rank: row.rank,
    subdit: row.subdit,
    totalDistance:
      Number(
        row.totalDistance
      ),
  };
}


export async function GET() {
  try {
    const [
      leaderboard,
      pendingRows,
    ] =
      await Promise.all([
        getSubditGenderLeaderboard(),

        sql`
          SELECT
            COUNT(*)::int AS pending_count
          FROM run_activities
          WHERE status = 0
        `,
      ]);


    const pendingCount =
      Number(
        pendingRows[0]
          ?.pending_count ??
          0
      );


    /*
     * Leaderboard hanya final jika:
     *
     * 1. Deadline pelaporan sudah TERLEWATI
     *    (18 Agustus 2026 pukul 21.00 WIB), DAN
     *
     * 2. Tidak ada lagi aktivitas berstatus pending.
     *
     * Rejected tidak menghalangi status final,
     * karena data tersebut sudah selesai diverifikasi.
     */
    const deadlinePassed =
      Date.now() >
      new Date(
        SUBMISSION_DEADLINE
      ).getTime();


    const finalized =
      deadlinePassed &&
      pendingCount === 0;


    const male =
      leaderboard
        .filter(
          (row) =>
            row.gender === "M"
        )
        .map(
          mapLeaderboardRow
        );


    const female =
      leaderboard
        .filter(
          (row) =>
            row.gender === "F"
        )
        .map(
          mapLeaderboardRow
        );


    return NextResponse.json(
      {
        status:
          finalized
            ? "final"
            : "ongoing",

        finalized,

        leaderboard: {
          male,
          female,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );

  } catch (error) {
    console.error(
      "Gagal mengambil API leaderboard subdit:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Leaderboard tidak dapat dimuat.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}