"use server";

import { respondToQuestion } from "@/data/question";
import {
  getRoomBySlug,
  getRoomUsersBySlug,
  newRoomUser,
  roomStartQuiz,
} from "@/data/room";
import { getSession } from "@/lib/session";

export async function joinRoom(slug: string) {
  const roomUsersPromise = getRoomUsersBySlug(slug);
  const roomPromise = getRoomBySlug(slug);
  const session = await getSession();

  const roomUsers = await roomUsersPromise;
  const userIsInRoom =
    session.currentRoom === slug &&
    roomUsers.some((user) => user.username === session.username);

  if (userIsInRoom) {
    return { room: await roomPromise, username: session.username };
  }

  const { username } = await newRoomUser(slug);

  session.destroy();
  session.currentRoom = slug;
  session.username = username;
  await session.save();

  return { room: await roomPromise, username: session.username };
}

export async function adminStartQuiz() {
  const session = await getSession();
  if (!session.currentRoom) throw new Error("You are not in a room");
  if (!session.isAdmin) throw new Error("Only admins can start the quiz");

  return await roomStartQuiz(session.currentRoom);
}

export async function submitAnswer(questionId: number, choice: string) {
  const session = await getSession();
  if (!session.currentRoom) throw new Error("You are not in a room");
  if (!session.username) throw new Error("You are not in a room");

  await respondToQuestion({
    choice,
    questionId,
    username: session.username,
  });
}
