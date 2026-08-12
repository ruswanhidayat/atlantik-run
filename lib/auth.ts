import { redirect } from "next/navigation";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export type AuthUser = {
  nip: string;
  nama: string;
  subdit: string;
  gender: "M" | "F";
  isadmin: boolean;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const users = await sql`
    SELECT
      nip,
      nama,
      subdit,
      gender,
      isadmin
    FROM users
    WHERE nip = ${session.nip}
    LIMIT 1
  `;

  if (users.length === 0) {
    return null;
  }

  const user = users[0];

  return {
    nip: String(user.nip).trim(),
    nama: String(user.nama),
    subdit: String(user.subdit),
    gender: user.gender as "M" | "F",
    isadmin: Boolean(user.isadmin),
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireUser();

  if (!user.isadmin) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdminAccess(): Promise<AuthUser> {
  const user = await requireAdminUser();

  const session = await getSession();

  if (!session?.adminAuthenticated) {
    redirect("/admin/login");
  }

  return user;
}