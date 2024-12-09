import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";
import { envs } from "@/envs";

export type SessionData = {
  username?: string;
  currentRoom?: string;
  isAdmin?: boolean;
};

const sessionOpts: SessionOptions = {
  cookieName: "sid",
  password: envs.SESSION_SECRET,
  cookieOptions: {
    maxAge: 60 * 60 * 24 * 1,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export const getSession = async () => {
  return await getIronSession<SessionData>(await cookies(), sessionOpts);
};
