import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "atlantik_run_session";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("SESSION_SECRET belum dikonfigurasi.");
}

const encodedSecret = new TextEncoder().encode(secret);

export type SessionPayload = {
  nip: string;
  adminAuthenticated?: boolean;
};

async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(encodedSecret);
}

export async function createSession(nip: string) {
  const token = await signSession({
    nip,
    adminAuthenticated: false,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
}

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

export async function setAdminAuthenticated() {
  const session = await getSession();

  if (!session) {
    return;
  }

  const token = await signSession({
    nip: session.nip,
    adminAuthenticated: true,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function clearAdminAuthenticated() {
  const session = await getSession();

  if (!session) {
    return;
  }

  const token = await signSession({
    nip: session.nip,
    adminAuthenticated: false,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}