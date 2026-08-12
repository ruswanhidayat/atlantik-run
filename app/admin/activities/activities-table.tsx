"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

  function resetFilters() {
    setSearch("");
    setStatus("");
    setSubdit("");
    setGender("");
    setTanggal("");
  }

  return (
    <>
      <section className="admin-filters">
        <div className="filter-search">
          <label htmlFor="admin-search">
            Cari
          </label>

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

        <div>
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
            <option value="">
              Semua
            </option>
            <option value="0">
              Pending
            </option>
            <option value="1">
              Approved
            </option>
            <option value="2">
              Rejected
            </option>
          </select>
        </div>

        <div>
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
            <option value="">
              Semua
            </option>

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

        <div>
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
            <option value="">
              Semua
            </option>
            <option value="M">
              Pria
            </option>
            <option value="F">
              Wanita
            </option>
          </select>
        </div>

        <div>
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
            <option value="">
              Semua
            </option>
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

        <div className="filter-actions">
          <button
            type="button"
            className="filter-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </section>

      <div className="table-result-info">
        Menampilkan{" "}
        <strong>
          {filteredActivities.length}
        </strong>{" "}
        dari{" "}
        <strong>{activities.length}</strong>{" "}
        data
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Subdit</th>
              <th>Gender</th>
              <th>Tanggal</th>
              <th>Jarak</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredActivities.map(
              (activity) => (
                <tr key={activity.id}>
                  <td>
                    {activity.id}
                  </td>

                  <td>
                    <strong>
                      {activity.nama}
                    </strong>

                    <small className="table-subtext">
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
                    {activity.jarak.toFixed(2)}{" "}
                    km
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
                      className="table-action-link"
                    >
                      {activity.status === 0
                        ? "Verifikasi"
                        : "Lihat"}
                    </Link>
                  </td>
                </tr>
              )
            )}

            {filteredActivities.length ===
            0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="table-empty"
                >
                  Tidak ada data yang sesuai
                  dengan filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}