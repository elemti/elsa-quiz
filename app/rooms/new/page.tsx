import { createRoomAndSetupQuestions } from "@/data/room";
import { Suspense } from "react";
import { RedirectToRoom } from "./redirect-to-room";

export default function Page() {
  const createRoomPromise = createRoomAndSetupQuestions();

  return (
    <Suspense fallback={<div>Creating a new room...</div>}>
      <RedirectToRoom createRoomPromise={createRoomPromise} />
    </Suspense>
  );
}
