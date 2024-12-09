"use client";

import { createRoomAndSetupQuestions } from "@/data/room";
import { use, useLayoutEffect } from "react";
import { redirectToNewRoom } from "./actions.server";

export function RedirectToRoom({
  createRoomPromise,
}: {
  createRoomPromise: ReturnType<typeof createRoomAndSetupQuestions>;
}) {
  const { roomSlug, username } = use(createRoomPromise);

  useLayoutEffect(() => {
    redirectToNewRoom({ roomSlug, username });
  }, [roomSlug, username]);

  return <div>Redirecting to your room...</div>;
}
