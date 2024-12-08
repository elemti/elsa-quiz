import { db } from "@/db";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
  countries,
} from "unique-names-generator";

export async function createSession() {
  const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    style: "capital",
    separator: "",
  }).replace(/ /g, "");
  const sessionSlug = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, countries],
    style: "lowerCase",
    separator: "-",
  }).replace(/ /g, "");

  await db.transaction().execute(async (tx) => {
    const session = await db
      .insertInto("session")
      .values({
        slug: sessionSlug,
        pin: randomPin,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const seshUser = await tx
      .insertInto("session_user")
      .values({
        session_id: session.id,
        username,
        is_owner: true,
      })
      .executeTakeFirstOrThrow();

    return { session, seshUser };
  });

  return { sessionSlug, username, sessionPin: randomPin };
}
