import { shuffle } from "lodash-es";
import { db } from "@/db";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
  countries,
} from "unique-names-generator";
import MOCK_QUESTIONS from "@/lib/questions.json";
import { json } from "@/db/utils";

export const randomUsername = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    style: "capital",
    separator: "",
  }).replace(/ /g, "");

export async function roomStartQuiz(slug: string) {
  return await db.transaction().execute(async (tx) => {
    const room = await tx
      .selectFrom("room")
      .where("slug", "=", slug)
      .selectAll()
      .executeTakeFirstOrThrow();

    if (room.started_at) {
      throw new Error("Room has already started");
    }

    await tx
      .updateTable("room")
      .set({ started_at: new Date() })
      .where("slug", "=", slug)
      .execute();

    return { startedAt: new Date().toISOString() };
  });
}

// export async function advanceRoomRound(slug: string) {
//   return await db.transaction().execute(async (db) => {
//     const room = await db
//       .selectFrom("room")
//       .where("slug", "=", slug)
//       .selectAll()
//       .executeTakeFirstOrThrow();

//     const isAdvanceable =
//       (!room.current_round || room.current_round < 5) && !room.finished_at;
//     if (!isAdvanceable) {
//       throw new Error("Room cannot be advanced");
//     }

//     const nextRound = room.current_round ? room.current_round + 1 : 1;
//     await db
//       .updateTable("room")
//       .set({ current_round: nextRound })
//       .where("slug", "=", slug)
//       .execute();

//     return {
//       room: { ...room, current_round: nextRound },
//     };
//   });
// }

export async function createRoomAndSetupQuestions() {
  const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
  const username = randomUsername();
  const roomSlug = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, countries],
    style: "lowerCase",
    separator: "-",
  }).replace(/ /g, "");

  const rawQuestions = shuffle(MOCK_QUESTIONS).slice(0, 5);
  const questions = rawQuestions.map((q, i) => ({
    question: q.question,
    options: { A: q.A, B: q.B, C: q.C, D: q.D },
    correct_option: q.answer,
    round: i + 1,
  }));

  await db.transaction().execute(async (tx) => {
    const room = await tx
      .insertInto("room")
      .values({
        slug: roomSlug,
        pin: randomPin,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const insertQPromise = tx
      .insertInto("question")
      .values(
        questions.map((q) => ({
          ...q,
          options: json(q.options),
          room_id: room.id,
        }))
      )
      .execute();

    const roomUserPromise = tx
      .insertInto("room_user")
      .values({
        room_id: room.id,
        username,
        is_owner: true,
      })
      .executeTakeFirstOrThrow();

    await insertQPromise;

    return { room, roomUser: await roomUserPromise };
  });

  return { roomSlug, username, roomPin: randomPin, questions };
}

export async function getRoomBySlug(slug: string) {
  const room = await db
    .selectFrom("room")
    .where("slug", "=", slug)
    .selectAll()
    .executeTakeFirstOrThrow();

  return {
    id: room.id,
    slug: room.slug,
    startedAt: room.started_at?.toISOString(),
    finishedAt: room.finished_at?.toISOString(),
    createdAt: room.created_at?.toISOString(),
  };
}

export async function getRoomUsersBySlug(slug: string) {
  const roomUsers = await db
    .selectFrom("room_user")
    .innerJoin("room", "room.id", "room_user.room_id")
    .where("room.slug", "=", slug)
    .selectAll("room_user")
    .execute();

  return roomUsers;
}

export async function newRoomUser(slug: string) {
  const username = randomUsername();

  await db.transaction().execute(async (tx) => {
    const room = await tx
      .selectFrom("room")
      .where("slug", "=", slug)
      .selectAll()
      .executeTakeFirstOrThrow();

    const roomUser = await tx
      .insertInto("room_user")
      .values({
        room_id: room.id,
        username,
      })
      .executeTakeFirstOrThrow();
    return { room, roomUser };
  });

  return { slug, username };
}
