import { redirect } from "next/navigation";

import LoginForm from "./login-form";
import { getCurrentUser } from "@/lib/auth";

function RunnerIcon() {
  return (
    <svg
      className="login-runner-svg"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="runner-body-group">
        <circle
          className="runner-head"
          cx="112"
          cy="31"
          r="14"
          stroke="currentColor"
          strokeWidth="8"
        />

        <path
          className="runner-torso"
          d="M94 54L75 82"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <g className="runner-arm runner-arm-back">
          <path
            d="M91 59L67 56L48 70"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g className="runner-arm runner-arm-front">
          <path
            d="M91 59L111 70L129 88"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g className="runner-leg runner-leg-back">
          <path
            d="M75 82L56 107L36 119"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g className="runner-leg runner-leg-front">
          <path
            d="M75 82L96 105L128 116"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      <g className="runner-speed-group">
        <path
          className="runner-speed-line runner-speed-line-1"
          d="M12 56H44"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <path
          className="runner-speed-line runner-speed-line-2"
          d="M4 82H37"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <path
          className="runner-speed-line runner-speed-line-3"
          d="M13 108H48"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
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