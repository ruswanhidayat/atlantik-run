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

export type RankMovement =
  | "up"
  | "down"
  | "same"
  | "new";

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
  previousRank: number | null;
  rankMovement: RankMovement;
  comparisonDate: string | null;
};

export async function getSubditGenderLeaderboard(): Promise<
  SubditGenderLeaderboardRow[]
> {
  const rows = await sql`
    WITH approved_dates AS (
      SELECT DISTINCT tanggal::date AS tanggal
      FROM run_activities
      WHERE status = 1
    ),

    date_bounds AS (
      SELECT
        MAX(tanggal) AS current_date,
        (
          SELECT MAX(tanggal)
          FROM approved_dates
          WHERE tanggal < (
            SELECT MAX(tanggal)
            FROM approved_dates
          )
        ) AS previous_date
      FROM approved_dates
    ),

    user_groups AS (
      SELECT
        subdit,
        gender,
        COUNT(*)::int AS total_users
      FROM users
      GROUP BY subdit, gender
    ),

    current_stats AS (
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

    current_combined AS (
      SELECT
        ug.subdit,
        ug.gender,
        ug.total_users,

        COALESCE(
          cs.active_runners,
          0
        )::int AS active_runners,

        COALESCE(
          cs.total_distance,
          0
        )::numeric AS total_distance

      FROM user_groups ug

      LEFT JOIN current_stats cs
        ON cs.subdit = ug.subdit
        AND cs.gender = ug.gender
    ),

    current_ranked AS (
      SELECT
        *,

        RANK() OVER (
          PARTITION BY gender
          ORDER BY total_distance DESC
        ) AS gender_rank

      FROM current_combined
    ),

    previous_stats AS (
      SELECT
        u.subdit,
        u.gender,

        COALESCE(
          SUM(ra.jarak),
          0
        )::numeric AS total_distance

      FROM users u

      CROSS JOIN date_bounds db

      LEFT JOIN run_activities ra
        ON ra.nip = u.nip
        AND ra.status = 1
        AND db.previous_date IS NOT NULL
        AND ra.tanggal::date <= db.previous_date

      GROUP BY
        u.subdit,
        u.gender
    ),

    previous_ranked AS (
      SELECT
        subdit,
        gender,
        total_distance,

        RANK() OVER (
          PARTITION BY gender
          ORDER BY total_distance DESC
        ) AS gender_rank

      FROM previous_stats
    )

    SELECT
      cr.subdit,
      cr.gender,
      cr.total_users,
      cr.active_runners,
      cr.total_distance,
      cr.gender_rank,

      CASE
        WHEN db.previous_date IS NULL
          THEN NULL

        WHEN pr.total_distance <= 0
          THEN NULL

        ELSE pr.gender_rank
      END AS previous_rank,

      db.previous_date::text AS comparison_date

    FROM current_ranked cr

    CROSS JOIN date_bounds db

    LEFT JOIN previous_ranked pr
      ON pr.subdit = cr.subdit
      AND pr.gender = cr.gender

    ORDER BY
      cr.gender ASC,
      cr.gender_rank ASC,
      cr.subdit ASC
  `;

  return rows.map((row) => {
    const totalUsers =
      Number(row.total_users);

    const activeRunners =
      Number(row.active_runners);

    const currentRank =
      Number(row.gender_rank);

    const previousRank =
      row.previous_rank === null
        ? null
        : Number(row.previous_rank);

    const participationRate =
      totalUsers > 0
        ? (activeRunners / totalUsers) * 100
        : 0;

    let rankMovement: RankMovement;

    if (previousRank === null) {
      rankMovement = "new";
    } else if (currentRank < previousRank) {
      rankMovement = "up";
    } else if (currentRank > previousRank) {
      rankMovement = "down";
    } else {
      rankMovement = "same";
    }

    return {
      subdit: String(row.subdit),
      gender:
        row.gender as "M" | "F",
      totalDistance:
        Number(row.total_distance),
      activeRunners,
      totalUsers,
      participationRate,
      rank: currentRank,
      previousRank,
      rankMovement,
      comparisonDate:
        row.comparison_date
          ? String(row.comparison_date)
          : null,
    };
  });
}

export type IndividualLeaderboardRow = {
  nip: string;
  nama: string;
  subdit: string;
  gender: "M" | "F";
  totalDistance: number;
  genderRank: number;
  overallRank: number;
  previousGenderRank: number | null;
  rankMovement: RankMovement;
  comparisonDate: string | null;
};

export async function getIndividualLeaderboard(): Promise<
  IndividualLeaderboardRow[]
> {
  const rows = await sql`
    WITH approved_dates AS (
      SELECT DISTINCT tanggal::date AS tanggal
      FROM run_activities
      WHERE status = 1
    ),

    date_bounds AS (
      SELECT
        MAX(tanggal) AS current_date,
        (
          SELECT MAX(tanggal)
          FROM approved_dates
          WHERE tanggal < (
            SELECT MAX(tanggal)
            FROM approved_dates
          )
        ) AS previous_date
      FROM approved_dates
    ),

    current_totals AS (
      SELECT
        u.nip,
        u.nama,
        u.subdit,
        u.gender,

        COALESCE(
          SUM(ra.jarak)
            FILTER (
              WHERE ra.status = 1
            ),
          0
        )::numeric AS total_distance

      FROM users u

      LEFT JOIN run_activities ra
        ON ra.nip = u.nip

      GROUP BY
        u.nip,
        u.nama,
        u.subdit,
        u.gender
    ),

    current_eligible AS (
      SELECT *
      FROM current_totals
      WHERE total_distance > 0
    ),

    current_ranked AS (
      SELECT
        nip,
        nama,
        subdit,
        gender,
        total_distance,

        RANK() OVER (
          ORDER BY total_distance DESC
        ) AS overall_rank,

        RANK() OVER (
          PARTITION BY gender
          ORDER BY total_distance DESC
        ) AS gender_rank

      FROM current_eligible
    ),

    previous_totals AS (
      SELECT
        u.nip,
        u.gender,

        COALESCE(
          SUM(ra.jarak),
          0
        )::numeric AS total_distance

      FROM users u

      CROSS JOIN date_bounds db

      LEFT JOIN run_activities ra
        ON ra.nip = u.nip
        AND ra.status = 1
        AND db.previous_date IS NOT NULL
        AND ra.tanggal::date <= db.previous_date

      GROUP BY
        u.nip,
        u.gender
    ),

    previous_eligible AS (
      SELECT *
      FROM previous_totals
      WHERE total_distance > 0
    ),

    previous_ranked AS (
      SELECT
        nip,
        gender,

        RANK() OVER (
          PARTITION BY gender
          ORDER BY total_distance DESC
        ) AS gender_rank

      FROM previous_eligible
    )

    SELECT
      cr.nip,
      cr.nama,
      cr.subdit,
      cr.gender,
      cr.total_distance,
      cr.gender_rank,
      cr.overall_rank,

      pr.gender_rank
        AS previous_gender_rank,

      db.previous_date::text
        AS comparison_date

    FROM current_ranked cr

    CROSS JOIN date_bounds db

    LEFT JOIN previous_ranked pr
      ON pr.nip = cr.nip
      AND pr.gender = cr.gender

    ORDER BY
      cr.gender ASC,
      cr.gender_rank ASC,
      cr.nama ASC
  `;

  return rows.map((row) => {
    const currentRank =
      Number(row.gender_rank);

    const previousGenderRank =
      row.previous_gender_rank === null
        ? null
        : Number(
            row.previous_gender_rank
          );

    let rankMovement: RankMovement;

    if (previousGenderRank === null) {
      rankMovement = "new";
    } else if (
      currentRank < previousGenderRank
    ) {
      rankMovement = "up";
    } else if (
      currentRank > previousGenderRank
    ) {
      rankMovement = "down";
    } else {
      rankMovement = "same";
    }

    return {
      nip: String(row.nip).trim(),
      nama: String(row.nama),
      subdit: String(row.subdit),
      gender:
        row.gender as "M" | "F",
      totalDistance:
        Number(row.total_distance),
      genderRank: currentRank,
      overallRank:
        Number(row.overall_rank),
      previousGenderRank,
      rankMovement,
      comparisonDate:
        row.comparison_date
          ? String(row.comparison_date)
          : null,
    };
  });
}