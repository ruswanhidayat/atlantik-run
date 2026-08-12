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

export type SubditGenderLeaderboardRow = {
  subdit: string;
  gender: "M" | "F";
  totalDistance: number;
  activeRunners: number;
  totalUsers: number;
  participationRate: number;
  rank: number;
};

export async function getSubditGenderLeaderboard(): Promise<
  SubditGenderLeaderboardRow[]
> {
  const rows = await sql`
    WITH user_groups AS (
      SELECT
        subdit,
        gender,
        COUNT(*)::int AS total_users
      FROM users
      GROUP BY subdit, gender
    ),

    approved_stats AS (
      SELECT
        u.subdit,
        u.gender,

        COUNT(DISTINCT ra.nip)::int AS active_runners,

        COALESCE(
          SUM(ra.jarak),
          0
        )::numeric AS total_distance

      FROM users u

      LEFT JOIN run_activities ra
        ON ra.nip = u.nip
        AND ra.status = 1

      GROUP BY
        u.subdit,
        u.gender
    ),

    combined AS (
      SELECT
        ug.subdit,
        ug.gender,
        ug.total_users,

        COALESCE(
          ast.active_runners,
          0
        )::int AS active_runners,

        COALESCE(
          ast.total_distance,
          0
        )::numeric AS total_distance

      FROM user_groups ug

      LEFT JOIN approved_stats ast
        ON ast.subdit = ug.subdit
        AND ast.gender = ug.gender
    ),

    ranked AS (
      SELECT
        *,

        RANK() OVER (
          PARTITION BY gender
          ORDER BY total_distance DESC
        ) AS gender_rank

      FROM combined
    )

    SELECT
      subdit,
      gender,
      total_users,
      active_runners,
      total_distance,
      gender_rank
    FROM ranked
    ORDER BY
      gender ASC,
      gender_rank ASC,
      subdit ASC
  `;

  return rows.map((row) => {
    const totalUsers = Number(row.total_users);
    const activeRunners = Number(row.active_runners);

    const participationRate =
      totalUsers > 0
        ? (activeRunners / totalUsers) * 100
        : 0;

    return {
      subdit: String(row.subdit),
      gender: row.gender as "M" | "F",
      totalDistance: Number(row.total_distance),
      activeRunners,
      totalUsers,
      participationRate,
      rank: Number(row.gender_rank),
    };
  });
}