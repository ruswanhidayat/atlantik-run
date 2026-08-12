import { redirect } from "next/navigation";

import LoginForm from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="card login-card">
        <span className="eyebrow">ATLANTIK 2026</span>

        <h1>ATLANTIK RUN</h1>

        <p className="login-description">
          Masukkan NIP untuk masuk ke portal pelaporan ATLANTIK RUN.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}