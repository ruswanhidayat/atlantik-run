import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="shell">
      <section className="card dashboard-card">
        <span className="eyebrow">
          ATLANTIK RUN 2026
        </span>

        <h1>Halo, {user.nama}</h1>

        <div className="user-summary">
          <div>
            <span>NIP</span>
            <strong>{user.nip}</strong>
          </div>

          <div>
            <span>Subdit</span>
            <strong>{user.subdit}</strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>
              {user.gender === "M" ? "Pria" : "Wanita"}
            </strong>
          </div>

          <div>
            <span>Akses</span>
            <strong>
              {user.isadmin ? "Admin" : "Pelari"}
            </strong>
          </div>
        </div>

        <form action={logoutAction}>
          <button type="submit" className="secondary-button">
            Keluar
          </button>
        </form>
      </section>
    </main>
  );
}