import Link from "next/link";
import { notFound } from "next/navigation";

import VerifyForm from "./verify-form";
import { requireAdminAccess } from "@/lib/auth";
import { sql } from "@/lib/db";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatStatus(status: number) {
  if (status === 0) {
    return "Pending";
  }

  if (status === 1) {
    return "Approved";
  }

  return "Rejected";
}

export default async function AdminActivityDetailPage({
  params,
}: PageProps) {
  await requireAdminAccess();

  const { id } = await params;

  const activityId = Number(id);

  if (
    !Number.isInteger(activityId) ||
    activityId <= 0
  ) {
    notFound();
  }

  const rows = await sql`
    SELECT
      ra.id,
      ra.nip,
      u.nama,
      u.subdit,
      u.gender,
      ra.tautan,
      ra.jarak,
      ra.tanggal::text AS tanggal,
      ra.tgl_rekam,
      ra.status,
      ra.feedback,
      ra.verified_by,
      ra.verified_at,
      verifier.nama AS verifier_name
    FROM run_activities ra

    JOIN users u
      ON u.nip = ra.nip

    LEFT JOIN users verifier
      ON verifier.nip = ra.verified_by

    WHERE ra.id = ${activityId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    notFound();
  }

  const activity = rows[0];
  const status = Number(activity.status);

  return (
    <main className="shell">
      <section className="card verify-card">
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              ADMIN VERIFICATION
            </span>

            <h1>
              {String(activity.nama)}
            </h1>

            <p>
              {String(activity.subdit)} ·{" "}
              {activity.gender === "M"
                ? "Pria"
                : "Wanita"}
            </p>
          </div>

          <Link
            href="/admin/activities"
            className="text-link"
          >
            Kembali
          </Link>
        </div>

        <div className="verification-summary">
          <div>
            <span>NIP</span>
            <strong>
              {String(activity.nip).trim()}
            </strong>
          </div>

          <div>
            <span>Tanggal</span>
            <strong>
              {String(activity.tanggal)}
            </strong>
          </div>

          <div>
            <span>Jarak Dilaporkan</span>
            <strong>
              {Number(
                activity.jarak
              ).toFixed(2)}{" "}
              km
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {formatStatus(status)}
            </strong>
          </div>
        </div>

        <div className="evidence-box">
          <span>Tautan Aktivitas</span>

          <a
            href={String(activity.tautan)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buka Bukti Aktivitas
          </a>
        </div>

        {status === 0 ? (
          <VerifyForm
            id={String(activity.id)}
            jarak={Number(
              activity.jarak
            ).toFixed(2)}
          />
        ) : (
          <div className="verification-result">
            <h2>
              Aktivitas sudah diverifikasi
            </h2>

            <p>
              Status:{" "}
              <strong>
                {formatStatus(status)}
              </strong>
            </p>

            {activity.feedback ? (
              <p>
                Feedback:{" "}
                {String(activity.feedback)}
              </p>
            ) : null}

            {activity.verifier_name ? (
              <p>
                Diverifikasi oleh:{" "}
                {String(
                  activity.verifier_name
                )}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}