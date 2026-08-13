"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { logoutAction } from "@/app/actions/auth";

type DashboardBottomNavProps = {
  canRecord: boolean;
  isAdmin: boolean;
};

type ActiveSection = "home" | "rank";

export default function DashboardBottomNav({
  canRecord,
  isAdmin,
}: DashboardBottomNavProps) {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("home");

  useEffect(() => {
    function updateActiveSection() {
      const leaderboard =
        document.getElementById("leaderboard");

      if (!leaderboard) {
        setActiveSection("home");
        return;
      }

      const leaderboardTop =
        leaderboard.getBoundingClientRect().top;

      const triggerPoint =
        window.innerHeight * 0.38;

      if (leaderboardTop <= triggerPoint) {
        setActiveSection("rank");
      } else {
        setActiveSection("home");
      }
    }

    updateActiveSection();

    window.addEventListener(
      "scroll",
      updateActiveSection,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateActiveSection
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateActiveSection
      );

      window.removeEventListener(
        "resize",
        updateActiveSection
      );
    };
  }, []);

  function scrollToSection(
    section: ActiveSection
  ) {
    const target =
      section === "home"
        ? document.getElementById(
            "dashboard-top"
          )
        : document.getElementById(
            "leaderboard"
          );

    if (!target) {
      return;
    }

    setActiveSection(section);

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav
      className={`run-bottom-nav run-bottom-nav-modern ${
        isAdmin
          ? "run-bottom-nav-six"
          : "run-bottom-nav-five"
      }`}
      aria-label="Navigasi utama"
    >
      {/* HOME */}
      <button
        type="button"
        className={`run-bottom-nav-item ${
          activeSection === "home"
            ? "is-active"
            : ""
        }`}
        onClick={() =>
          scrollToSection("home")
        }
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
      </button>

      {/* RANK */}
      <button
        type="button"
        className={`run-bottom-nav-item ${
          activeSection === "rank"
            ? "is-active"
            : ""
        }`}
        onClick={() =>
          scrollToSection("rank")
        }
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
      </button>

      {/* RECORD — CENTER ACTION */}
      {canRecord ? (
        <Link
          href="/record"
          className="run-bottom-nav-item run-bottom-nav-primary"
        >
          <span
            className="run-nav-primary-icon"
            aria-hidden="true"
          >
            ＋
          </span>

          <span>Record</span>
        </Link>
      ) : (
        <span className="run-bottom-nav-item run-bottom-nav-primary is-disabled">
          <span
            className="run-nav-primary-icon"
            aria-hidden="true"
          >
            ＋
          </span>

          <span>Record</span>
        </span>
      )}

      {/* INFO */}
      <Link
        href="/info"
        className="run-bottom-nav-item"
      >
        <span
          className="run-nav-icon"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="9"
            />
            <path d="M12 10v6" />
            <path d="M12 7.3h.01" />
          </svg>
        </span>

        <span>Info</span>
      </Link>

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