import Link from "next/link";

import RecordForm from "./record-form";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  isSubmissionOpen,
  RUN_DATES,
} from "@/lib/run-config";

export default async function RecordPage() {
  const user = await requireUser();

  const activities = await sql`
    SELECT
      tanggal::text AS tanggal,
      status
    FROM run_activities
    WHERE nip = ${user.nip}
      AND status IN (0, 1)
  `;

  const blockedDates = new Set(
    activities.map((activity) =>
      String(activity.tanggal)
    )
  );

  const availableDates = RUN_DATES.filter(
    (date) => !blockedDates.has(date.value)
  );

  const submissionOpen = isSubmissionOpen();

  return (
    <main className="shell">
      <section className="card record-card">
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              ATLANTIK RUN 2026
            </span>

            <h1>Rekam Aktivitas</h1>

            <p>
              Laporkan aktivitas lari yang telah
              kamu selesaikan.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-link"
          >
            Kembali
          </Link>
        </div>

        {!submissionOpen ? (
          <div className="empty-state">
            <strong>
              Perekaman telah ditutup.
            </strong>

            <p>
              Batas akhir perekaman adalah
              20 Agustus 2026 pukul 23.59 WIB.
            </p>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="empty-state">
            <strong>
              Tidak ada tanggal yang dapat direkam.
            </strong>

            <p>
              Seluruh tanggal ATLANTIK RUN sudah
              memiliki aktivitas Pending atau
              Approved.
            </p>
          </div>
        ) : (
          <RecordForm
            availableDates={availableDates}
          />
        )}
      </section>
    </main>
  );
}
