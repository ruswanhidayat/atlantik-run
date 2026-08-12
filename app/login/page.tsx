import { redirect } from "next/navigation";

import LoginForm from "./login-form";
import { getCurrentUser } from "@/lib/auth";

function RunnerIcon() {
  return (
    <svg
      className="login-runner-svg"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="106"
        cy="30"
        r="15"
        stroke="currentColor"
        strokeWidth="8"
      />

      <path
        d="M82 52L62 45L45 53"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M82 52L96 67L113 84"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M82 52L68 73L53 92"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M53 92L77 109L60 130"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M77 109L96 124L118 133"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M113 84L130 77"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        className="runner-speed-line runner-speed-line-1"
        d="M18 50H43"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        className="runner-speed-line runner-speed-line-2"
        d="M10 75H35"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        className="runner-speed-line runner-speed-line-3"
        d="M18 101H45"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-page">
      <div className="login-ambient login-ambient-left" />
      <div className="login-ambient login-ambient-right" />

      <section className="login-layout">
        <div className="login-visual" aria-hidden="true">
          <div className="login-brand-row">
            <span className="login-brand-dot" />
            <span>ATLANTIK</span>
            <span className="login-brand-separator">/</span>
            <span>RUN 2026</span>
          </div>

          <div className="runner-track">
            <div className="runner-track-line" />

            <div className="runner-motion">
              <RunnerIcon />
            </div>
          </div>

          <div className="login-visual-copy">
            <p>15—17 AUG 2026</p>
            <strong>
              Every kilometer
              <br />
              moves the team.
            </strong>
          </div>
        </div>

        <section className="login-panel">
          <div className="login-panel-inner">
            <div className="login-mobile-brand">
              <span className="login-brand-dot" />
              ATLANTIK RUN
            </div>

            <div className="login-copy">
              <span className="login-kicker">PORTAL PELAPORAN LARI</span>

              <h1>
                Ready
                <br />
                to run?
              </h1>

              <p>
                Catat setiap kilometer dan bantu Subdit-mu bergerak menuju
                peringkat teratas.
              </p>
            </div>

            <LoginForm />

            <div className="login-footer">
              <span>ATLANTIK 2026</span>
              <span>BERSAMA · BERGERAK · BERDAMPAK</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}