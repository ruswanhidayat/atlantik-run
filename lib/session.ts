import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "atlantik_run_session";

/**
 * Session dianggap expired setelah user tidak aktif
 * selama durasi ini.
 */
const SESSION_IDLE_MINUTES = 60;
const SESSION_IDLE_SECONDS = SESSION_IDLE_MINUTES * 60;

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("SESSION_SECRET belum dikonfigurasi.");
}

const encodedSecret = new TextEncoder().encode(secret);

export type SessionPayload = {
  nip: string;
  adminAuthenticated?: boolean;
};

/**
 * Membuat JWT session baru.
 *
 * Setiap token baru memiliki expiry SESSION_IDLE_MINUTES
 * dari waktu token tersebut diterbitkan.
 */
async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_IDLE_MINUTES}m`)
    .sign(encodedSecret);
}

/**
 * Menyimpan token session ke cookie.
 *
 * Dipusatkan di sini agar create / refresh / admin session
 * menggunakan konfigurasi cookie yang sama.
 */
async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_IDLE_SECONDS,
  });
}

/**
 * Membuat session baru ketika user login.
 */
export async function createSession(nip: string) {
  const token = await signSession({
    nip,
    adminAuthenticated: false,
  });

  await setSessionCookie(token);
}

/**
 * Membaca session.
 *
 * Fungsi ini sengaja READ ONLY.
 * Jangan refresh cookie dari sini karena getSession()
 * dapat dipanggil dari Server Component.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodedSecret);

    if (typeof payload.nip !== "string") {
      return null;
    }

    return {
      nip: payload.nip,
      adminAuthenticated:
        payload.adminAuthenticated === true,
    };
  } catch {
    return null;
  }
}

/**
 * Memperpanjang session berdasarkan aktivitas terakhir user.
 *
 * Gunakan fungsi ini hanya dari context yang diperbolehkan
 * menulis cookie, misalnya:
 *
 * - Server Action
 * - Route Handler
 *
 * Setiap dipanggil, expiry dihitung ulang dari saat itu.
 */
export async function refreshSession() {
  const session = await getSession();

  if (!session) {
    return false;
  }

  const token = await signSession({
    nip: session.nip,
    adminAuthenticated:
      session.adminAuthenticated === true,
  });

  await setSessionCookie(token);

  return true;
}

/**
 * Menandai session user sebagai admin authenticated.
 *
 * Sekaligus memperbarui idle timeout karena ini merupakan
 * aktivitas user.
 */
export async function setAdminAuthenticated() {
  const session = await getSession();

  if (!session) {
    return;
  }

  const token = await signSession({
    nip: session.nip,
    adminAuthenticated: true,
  });

  await setSessionCookie(token);
}

/**
 * Menghapus status admin dari session,
 * tetapi mempertahankan login user.
 *
 * Sekaligus memperbarui idle timeout.
 */
export async function clearAdminAuthenticated() {
  const session = await getSession();

  if (!session) {
    return;
  }

  const token = await signSession({
    nip: session.nip,
    adminAuthenticated: false,
  });

  await setSessionCookie(token);
}

/**
 * Logout penuh.
 */
export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}