import Link from "next/link";
import { redirect } from "next/navigation";

import AdminLoginForm from "./admin-login-form";
import { requireAdminUser } from "@/lib/auth";
import { getSession } from "@/lib/session";

export default async function AdminLoginPage() {
  await requireAdminUser();

  const session = await getSession();

  if (session?.adminAuthenticated) {
    redirect("/admin/activities");
  }

  return (
    <main className="admin-login-page">
      <div
        className="admin-login-glow admin-login-glow-one"
        aria-hidden="true"
      />

      <div
        className="admin-login-glow admin-login-glow-two"
        aria-hidden="true"
      />

      <section className="admin-login-layout">
        {/* LEFT / BRAND */}
        <div className="admin-login-visual">
          <div className="admin-login-brand">
            <span className="admin-login-brand-dot" />

            <span>ATLANTIK RUN</span>

            <small>2026</small>
          </div>

          <div className="admin-login-visual-copy">
            <span className="admin-login-kicker">
              ADMIN ACCESS
            </span>

            <h2>
              Verify.
              <br />
              Review.
              <br />
              Approve.
            </h2>

            <p>
              Panel verifikasi aktivitas ATLANTIK RUN.
              Pastikan setiap data yang masuk telah sesuai
              sebelum masuk ke leaderboard.
            </p>
          </div>

          <div className="admin-login-meta">
            <span>15—17 AUG 2026</span>

            <span>
              BERSAMA · BERGERAK · BERDAMPAK
            </span>
          </div>
        </div>

        {/* RIGHT / FORM */}
        <section className="admin-login-panel">
          <div className="admin-login-panel-inner">
            <div className="admin-login-mobile-brand">
              <span className="admin-login-brand-dot" />

              <span>ATLANTIK RUN</span>

              <small>2026</small>
            </div>

            <div className="admin-login-heading">
              <span className="admin-login-kicker">
                PANEL VERIFIKASI
              </span>

              <h1>Admin Login</h1>

              <p>
                Masukkan password admin untuk membuka panel
                verifikasi ATLANTIK RUN.
              </p>
            </div>

            <AdminLoginForm />

            <Link
              href="/dashboard"
              className="admin-login-back"
            >
              <span aria-hidden="true">←</span>
              <span>Kembali ke Dashboard</span>
            </Link>

            <footer className="admin-login-footer">
              <span>ATLANTIK RUN 2026</span>

              <span>ADMIN PANEL</span>
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}