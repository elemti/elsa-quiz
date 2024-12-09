"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function redirectToNewRoom({
  roomSlug,
  username,
}: {
  roomSlug: string;
  username: string;
}) {
  const session = await getSession();
  session.username = username;
  session.currentRoom = roomSlug;
  session.isAdmin = true;

  await session.save();

  redirect(`/rooms/${roomSlug}`);
}
