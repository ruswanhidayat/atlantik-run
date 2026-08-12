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
    <main className="shell">
      <section className="card login-card">
        <span className="eyebrow">
          ATLANTIK RUN 2026
        </span>

        <h1>Admin</h1>

        <p className="login-description">
          Masukkan password admin untuk membuka
          panel verifikasi ATLANTIK RUN.
        </p>

        <AdminLoginForm />

        <Link
          href="/dashboard"
          className="text-link admin-back-link"
        >
          Kembali ke Dashboard
        </Link>
      </section>
    </main>
  );
}