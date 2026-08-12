import { redirect } from "next/navigation";

import LoginForm from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-page">
      {/* Ambient background */}
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />
      <div className="login-orbit login-orbit-one" aria-hidden="true" />
      <div className="login-orbit login-orbit-two" aria-hidden="true" />

      <section className="login-layout">
        {/* LEFT SIDE */}
        <section className="login-visual">
          <div className="login-brand-row">
            <span className="login-brand-dot" />
            <span>ATLANTIK RUN 2026</span>
          </div>

          <div className="login-visual-copy">
            <p className="login-event-date">
              15—17 AUG 2026
            </p>

            <h2>
              Every kilometer
              <br />
              moves the team.
            </h2>

            <span className="login-copy-accent" />

            <p className="login-visual-description">
              Catat setiap kilometer dan bantu Subdit-mu
              bergerak menuju peringkat teratas.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-panel">
          <div className="login-panel-inner">
            <div className="login-mobile-brand">
              <span className="login-brand-dot" />
              <span>ATLANTIK RUN 2026</span>
            </div>

            <div className="login-copy">
              <span className="login-kicker">
                PORTAL PELAPORAN LARI
              </span>

              <h1>Ready to run?</h1>

              <p>
                Catat setiap kilometer dan bantu Subdit-mu
                bergerak menuju peringkat teratas.
              </p>
            </div>

            <LoginForm />

            <footer className="login-footer">
              <span>ATLANTIK RUN 2026</span>
              <span>BERSAMA · BERGERAK · BERDAMPAK</span>
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}