"use client";

import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";

type RecordBottomNavProps = {
  isAdmin: boolean;
};

export default function RecordBottomNav({
  isAdmin,
}: RecordBottomNavProps) {
  return (
    <nav
      className={`run-bottom-nav run-bottom-nav-modern ${
        isAdmin
          ? "run-bottom-nav-five"
          : "run-bottom-nav-four"
      }`}
      aria-label="Navigasi utama"
    >
      {/* HOME */}
      <Link
        href="/dashboard#dashboard-top"
        className="run-bottom-nav-item"
      >
        <span
          className="run-nav-icon"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 10.8 12 3l9 7.8v9.4a.8.8 0 0 1-.8.8h-5.4v-6.2H9.2V21H3.8a.8.8 0 0 1-.8-.8Z" />
          </svg>
        </span>

        <span>Home</span>
      </Link>

      {/* RANK */}
      <Link
        href="/dashboard#leaderboard"
        className="run-bottom-nav-item"
      >
        <span
          className="run-nav-icon"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 20V10M12 20V4M18 20v-7" />
          </svg>
        </span>

        <span>Rank</span>
      </Link>

      {/* RECORD */}
      <span className="run-bottom-nav-item run-bottom-nav-primary is-active">
        <span
          className="run-nav-primary-icon"
          aria-hidden="true"
        >
          ＋
        </span>

        <span>Record</span>
      </span>

      {/* ADMIN */}
      {isAdmin ? (
        <Link
          href="/admin/login"
          className="run-bottom-nav-item"
        >
          <span
            className="run-nav-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 3 5 6v5c0 4.5 2.8 8.4 7 10 4.2-1.6 7-5.5 7-10V6Z" />
              <path d="M9.5 12.2 11.2 14l3.6-4" />
            </svg>
          </span>

          <span>Admin</span>
        </Link>
      ) : null}

      {/* LOGOUT */}
      <form
        action={logoutAction}
        className="run-bottom-nav-form"
      >
        <button
          type="submit"
          className="run-bottom-nav-item run-bottom-nav-logout"
        >
          <span
            className="run-nav-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M10 5H5.8a.8.8 0 0 0-.8.8v12.4a.8.8 0 0 0 .8.8H10" />
              <path d="m14 8 4 4-4 4" />
              <path d="M9 12h9" />
            </svg>
          </span>

          <span>Logout</span>
        </button>
      </form>
    </nav>
  );
}