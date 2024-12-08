import { createSession } from "@/data/session";
import { Suspense, use } from "react";

export default function Page() {
  const createSessionPromise = createSession();

  return (
    <Suspense fallback={<div>Creating a new session...</div>}>
      <NewSession createSessionPromise={createSessionPromise} />
    </Suspense>
  );
}

function NewSession({
  createSessionPromise,
}: {
  createSessionPromise: ReturnType<typeof createSession>;
}) {
  const { username, sessionPin, sessionSlug } = use(createSessionPromise);
  return (
    <div>
      <h1>Session created!</h1>
      <p>Username: {username}</p>
      <p>Pin: {sessionPin}</p>
      <p>Slug: {sessionSlug}</p>
    </div>
  );
}
