import { db } from "@/db";

export async function getUserResponsesInRoom(slug: string, username: string) {
  const responses = await db
    .selectFrom("question_response")
    .innerJoin("room_user", "room_user.id", "question_response.room_user_id")
    .innerJoin("room", "room.id", "room_user.room_id")
    .where("room.slug", "=", slug)
    .where("room_user.username", "=", username)
    .selectAll()
    .execute();

  return responses.map((it) => ({
    choice: it.choice,
    questionId: it.question_id,
  }));
}

export async function getQuestionsByRoomSlug(slug: string) {
  const questions = await db
    .selectFrom("question")
    .innerJoin("room", "room.id", "question.room_id")
    .where("room.slug", "=", slug)
    .selectAll("question")
    .execute();

  return questions.map((q) => {
    const options = q.options as { A: string; B: string; C: string; D: string };
    return {
      id: q.id,
      question: q.question,
      options,
    };
  });
}

export async function getCorrectOptionsByRoomSlug(slug: string) {
  const questions = await db
    .selectFrom("question")
    .innerJoin("room", "room.id", "question.room_id")
    .where("room.slug", "=", slug)
    .selectAll("question")
    .execute();

  return questions.reduce((acc, q) => {
    acc[q.id] = q.correct_option;
    return acc;
  }, {} as Record<number, string>);
}

export async function respondToQuestion({
  questionId,
  username,
  choice,
}: {
  questionId: number;
  username: string;
  choice: string;
}) {
  await db.transaction().execute(async (db) => {
    const roomUser = await db
      .selectFrom("room_user")
      .where("username", "=", username)
      .selectAll()
      .executeTakeFirstOrThrow();

    const existingResponse = await db
      .selectFrom("question_response")
      .where("question_id", "=", questionId)
      .where("room_user_id", "=", roomUser.id)
      .selectAll()
      .executeTakeFirst();
    if (existingResponse) {
      await db
        .updateTable("question_response")
        .set("choice", choice)
        .where("id", "=", existingResponse.id)
        .execute();
      return;
    }

    await db
      .insertInto("question_response")
      .values({
        question_id: questionId,
        room_user_id: roomUser.id,
        choice,
      })
      .execute();
  });
}
