import { getRoomBySlug, getRoomUsersBySlug } from "@/data/room";
import { JoinRoomAsNewUser, Room } from "./room.client";
import { getSession } from "@/lib/session";
import { Suspense } from "react";
import {
  getCorrectOptionsByRoomSlug,
  getQuestionsByRoomSlug,
  getUserResponsesInRoom,
} from "@/data/question";
import { RoomAdmin } from "./room-admin.client";

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const { roomSlug } = await params;
  if (!roomSlug) throw new Error("No room slug provided");

  const roomUsersPromise = getRoomUsersBySlug(roomSlug);
  const roomPromise = getRoomBySlug(roomSlug);
  const questionsPromise = getQuestionsByRoomSlug(roomSlug);
  const correctOptsPromise = getCorrectOptionsByRoomSlug(roomSlug);
  const session = await getSession();
  const roomUsers = await roomUsersPromise;
  const user = roomUsers.find((user) => user.username === session.username);
  const userIsInRoom = session.currentRoom === roomSlug && user;
  const adminUser = roomUsers.find((u) => u.is_owner);

  if (!adminUser) {
    throw new Error("No admin user found");
  }

  if (userIsInRoom) {
    const responsesPromise = getUserResponsesInRoom(roomSlug, user.username);
    return (
      <Suspense fallback={<div>Joining room {roomSlug}...</div>}>
        {user.is_owner ? (
          <RoomAdmin
            roomPromise={roomPromise}
            username={user.username}
            roomUsers={roomUsers}
            questionsPromise={questionsPromise}
            correctOptsPromise={correctOptsPromise}
          />
        ) : (
          <Room
            roomPromise={roomPromise}
            username={user.username}
            adminUsername={adminUser.username}
            roomUsers={roomUsers}
            questionsPromise={questionsPromise}
            responsesPromise={responsesPromise}
          />
        )}
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Joining room {roomSlug}...</div>}>
      <JoinRoomAsNewUser roomPromise={roomPromise} />
    </Suspense>
  );
}
