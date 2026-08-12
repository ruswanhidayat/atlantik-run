"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Activity = {
  id: string;
  nip: string;
  nama: string;
  subdit: string;
  gender: string;
  tanggal: string;
  jarak: number;
  status: number;
  feedback: string | null;
};

type ActivitiesTableProps = {
  activities: Activity[];
};

const PAGE_SIZE = 10;

function getStatusLabel(status: number) {
  if (status === 0) return "Pending";
  if (status === 1) return "Approved";

  return "Rejected";
}

function getStatusClass(status: number) {
  if (status === 0) return "status-pending";
  if (status === 1) return "status-approved";

  return "status-rejected";
}

function formatDate(value: string) {
  const date = new Date(
    `${value}T00:00:00+07:00`
  );

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ActivitiesTable({
  activities,
}: ActivitiesTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [subdit, setSubdit] = useState("");
  const [gender, setGender] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const subditOptions = useMemo(() => {
    return Array.from(
      new Set(
        activities.map(
          (activity) => activity.subdit
        )
      )
    ).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        !keyword ||
        activity.nama
          .toLowerCase()
          .includes(keyword) ||
        activity.nip
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        status === "" ||
        activity.status === Number(status);

      const matchesSubdit =
        subdit === "" ||
        activity.subdit === subdit;

      const matchesGender =
        gender === "" ||
        activity.gender === gender;

      const matchesTanggal =
        tanggal === "" ||
        activity.tanggal === tanggal;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubdit &&
        matchesGender &&
        matchesTanggal
      );
    });
  }, [
    activities,
    search,
    status,
    subdit,
    gender,
    tanggal,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredActivities.length / PAGE_SIZE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    status,
    subdit,
    gender,
    tanggal,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedActivities = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    return filteredActivities.slice(
      start,
      start + PAGE_SIZE
    );
  }, [
    filteredActivities,
    currentPage,
  ]);

  const firstItem =
    filteredActivities.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredActivities.length
  );

  function resetFilters() {
    setSearch("");
    setStatus("");
    setSubdit("");
    setGender("");
    setTanggal("");
    setCurrentPage(1);
  }

  const hasActiveFilter =
    search !== "" ||
    status !== "" ||
    subdit !== "" ||
    gender !== "" ||
    tanggal !== "";

  return (
    <section className="admin-data-section-v2">
      <div className="admin-data-section-heading">
        <div>
          <span className="dashboard-section-kicker">
            DATA AKTIVITAS
          </span>

          <h2>Daftar Perekaman</h2>
        </div>

        <span className="admin-result-count">
          {filteredActivities.length} / {activities.length}
        </span>
      </div>

      {/* FILTER */}
      <section className="admin-filters-v2">
        <div className="admin-filter-field admin-filter-search">
          <label htmlFor="admin-search">
            Cari
          </label>

          <div className="admin-filter-input-wrap">
            <span
              className="admin-filter-search-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                />

                <path d="m16 16 4 4" />
              </svg>
            </span>

            <input
              id="admin-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nama atau NIP"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="admin-filter-field">
          <label htmlFor="filter-status">
            Status
          </label>

          <select
            id="filter-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="">Semua</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>

        <div className="admin-filter-field">
          <label htmlFor="filter-subdit">
            Subdit
          </label>

          <select
            id="filter-subdit"
            value={subdit}
            onChange={(event) =>
              setSubdit(event.target.value)
            }
          >
            <option value="">Semua</option>

            {subditOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-field">
          <label htmlFor="filter-gender">
            Gender
          </label>

          <select
            id="filter-gender"
            value={gender}
            onChange={(event) =>
              setGender(event.target.value)
            }
          >
            <option value="">Semua</option>
            <option value="M">Pria</option>
            <option value="F">Wanita</option>
          </select>
        </div>

        <div className="admin-filter-field">
          <label htmlFor="filter-tanggal">
            Tanggal
          </label>

          <select
            id="filter-tanggal"
            value={tanggal}
            onChange={(event) =>
              setTanggal(event.target.value)
            }
          >
            <option value="">Semua</option>

            <option value="2026-08-15">
              15 Agustus
            </option>

            <option value="2026-08-16">
              16 Agustus
            </option>

            <option value="2026-08-17">
              17 Agustus
            </option>
          </select>
        </div>

        <div className="admin-filter-actions">
          <button
            type="button"
            className="admin-filter-reset"
            onClick={resetFilters}
            disabled={!hasActiveFilter}
          >
            Reset
          </button>
        </div>
      </section>

      {/* RESULT INFO */}
      <div className="admin-table-meta">
        {filteredActivities.length > 0 ? (
          <>
            Menampilkan{" "}
            <strong>
              {firstItem}–{lastItem}
            </strong>{" "}
            dari{" "}
            <strong>
              {filteredActivities.length}
            </strong>{" "}
            data
          </>
        ) : (
          <>Tidak ada data yang ditampilkan</>
        )}
      </div>

      {/* TABLE */}
      <div className="admin-table-wrap-v2">
        <table className="admin-table-v2">
          <thead>
            <tr>
              <th>Pelari</th>
              <th>Subdit</th>
              <th>Gender</th>
              <th>Tanggal</th>
              <th>Jarak</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedActivities.map(
              (activity) => (
                <tr key={activity.id}>
                  <td>
                    <strong className="admin-runner-name">
                      {activity.nama}
                    </strong>

                    <small className="admin-table-subtext">
                      {activity.nip}
                    </small>
                  </td>

                  <td>
                    {activity.subdit}
                  </td>

                  <td>
                    {activity.gender === "M"
                      ? "Pria"
                      : "Wanita"}
                  </td>

                  <td>
                    {formatDate(
                      activity.tanggal
                    )}
                  </td>

                  <td>
                    <strong className="admin-distance">
                      {activity.jarak.toFixed(2)}
                    </strong>{" "}
                    <small>km</small>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        activity.status
                      )}`}
                    >
                      {getStatusLabel(
                        activity.status
                      )}
                    </span>
                  </td>

                  <td>
                    <Link
                      href={`/admin/activities/${activity.id}`}
                      className={
                        activity.status === 0
                          ? "admin-table-action admin-table-action-primary"
                          : "admin-table-action"
                      }
                    >
                      <span>
                        {activity.status === 0
                          ? "Verifikasi"
                          : "Lihat"}
                      </span>

                      <span aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </td>
                </tr>
              )
            )}

            {filteredActivities.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="admin-table-empty"
                >
                  Tidak ada data yang sesuai
                  dengan filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filteredActivities.length > 0 &&
      totalPages > 1 ? (
        <nav
          className="admin-pagination"
          aria-label="Pagination data aktivitas"
        >
          <button
            type="button"
            className="admin-pagination-button admin-pagination-nav"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(1, page - 1)
              )
            }
          >
            ←
            <span>Sebelumnya</span>
          </button>

          <div className="admin-pagination-pages">
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                className={`admin-pagination-button ${
                  currentPage === page
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentPage(page)
                }
                aria-current={
                  currentPage === page
                    ? "page"
                    : undefined
                }
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="admin-pagination-button admin-pagination-nav"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(
                  totalPages,
                  page + 1
                )
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