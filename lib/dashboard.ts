import { sql } from "@/lib/db";

export type PersonalStats = {
  totalDistance: number;
  genderRank: number | null;
  overallRank: number | null;
};

export type GeneralStats = {
  totalRunners: number;
  totalDistance: number;
};

export async function getPersonalStats(
  nip: string
): Promise<PersonalStats> {
  const rows = await sql`
    WITH totals AS (
      SELECT
        u.nip,
        u.gender,
        COALESCE(
          SUM(ra.jarak) FILTER (WHERE ra.status = 1),
          0
        )::numeric AS total_distance
      FROM users u
      LEFT JOIN run_activities ra
        ON ra.nip = u.nip
      GROUP BY u.nip, u.gender
    ),

    ranked AS (
      SELECT
        nip,
        gender,
        total_distance,

        CASE
          WHEN total_distance > 0
          THEN RANK() OVER (
            ORDER BY total_distance DESC
          )
          ELSE NULL
        END AS overall_rank,

        CASE
          WHEN total_distance > 0
          THEN RANK() OVER (
            PARTITION BY gender
            ORDER BY total_distance DESC
          )
          ELSE NULL
        END AS gender_rank

      FROM totals
    )

    SELECT
      total_distance,
      overall_rank,
      gender_rank
    FROM ranked
    WHERE nip = ${nip}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return {
      totalDistance: 0,
      genderRank: null,
      overallRank: null,
    };
  }

  return {
    totalDistance: Number(rows[0].total_distance),
    genderRank:
      rows[0].gender_rank === null
        ? null
        : Number(rows[0].gender_rank),
    overallRank:
      rows[0].overall_rank === null
        ? null
        : Number(rows[0].overall_rank),
  };
}

export async function getGeneralStats(): Promise<GeneralStats> {
  const rows = await sql`
    SELECT
      COUNT(
        DISTINCT nip
      ) FILTER (
        WHERE status = 1
      )::int AS total_runners,

      COALESCE(
        SUM(jarak) FILTER (
          WHERE status = 1
        ),
        0
      )::numeric AS total_distance

    FROM run_activities
  `;

  return {
    totalRunners: Number(
      rows[0]?.total_runners ?? 0
    ),
    totalDistance: Number(
      rows[0]?.total_distance ?? 0
    ),
  };
}