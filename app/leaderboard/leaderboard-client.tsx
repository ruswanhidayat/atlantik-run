"use client";

import { useEffect, useMemo, useState } from "react";

type LeaderboardRow = {
  nip: string;
  nama: string;
  subdit: string;
  gender: string;
  totalDistance: number;
  genderRank: number;
  overallRank: number;
};

type LeaderboardClientProps = {
  leaderboard: LeaderboardRow[];
};

type GenderTab = "M" | "F";

const PAGE_SIZE = 25;

function formatDistance(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function LeaderboardClient({
  leaderboard,
}: LeaderboardClientProps) {
  const [activeGender, setActiveGender] =
    useState<GenderTab>("M");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return leaderboard.filter((row) => {
      if (row.gender !== activeGender) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        row.nama.toLowerCase().includes(keyword) ||
        row.nip.toLowerCase().includes(keyword) ||
        row.subdit.toLowerCase().includes(keyword)
      );
    });
  }, [leaderboard, activeGender, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / PAGE_SIZE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGender, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const firstItem =
    filteredRows.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredRows.length
  );

  return (
    <section className="full-leaderboard-panel">
      <div className="full-leaderboard-toolbar">
        <div
          className="full-leaderboard-tabs"
          role="tablist"
          aria-label="Kategori gender"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeGender === "M"}
            className={activeGender === "M" ? "is-active" : ""}
            onClick={() => setActiveGender("M")}
          >
            Pria
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeGender === "F"}
            className={activeGender === "F" ? "is-active" : ""}
            onClick={() => setActiveGender("F")}
          >
            Wanita
          </button>
        </div>

        <div className="full-leaderboard-search">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, NIP, atau Subdit"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="full-leaderboard-meta">
        <span>
          {activeGender === "M" ? "Pria" : "Wanita"}
        </span>

        <span>
          Menampilkan <strong>{firstItem}–{lastItem}</strong> dari{" "}
          <strong>{filteredRows.length}</strong> pelari
        </span>
      </div>
      
      <div className="full-leaderboard-scroll-hint">
        <span aria-hidden="true">←</span>
        Geser tabel untuk melihat data lengkap
        <span aria-hidden="true">→</span>
        </div>

      <div className="full-leaderboard-table-wrap">
        <table className="full-leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Overall</th>
              <th>Nama</th>
              <th>NIP</th>
              <th>Subdit</th>
              <th>Jarak</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRows.map((row) => (
              <tr key={row.nip}>
                <td>
                  <strong>#{row.genderRank}</strong>
                </td>

                <td>#{row.overallRank}</td>

                <td className="full-leaderboard-name">
                  <strong>{row.nama}</strong>
                </td>

                <td>{row.nip}</td>

                <td>{row.subdit}</td>

                <td>
                  <strong>
                    {formatDistance(row.totalDistance)}
                  </strong>{" "}
                  km
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="full-leaderboard-empty"
                >
                  Tidak ada pelari yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filteredRows.length > 0 && totalPages > 1 ? (
        <nav
          className="full-leaderboard-pagination"
          aria-label="Pagination leaderboard"
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
          >
            ←
            <span>Sebelumnya</span>
          </button>

          <span>
            Halaman <strong>{currentPage}</strong> / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
          >
            <span>Berikutnya</span>
            →
          </button>
        </nav>
      ) : null}
    </section>
  );
}