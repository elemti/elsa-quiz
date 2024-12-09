"use client";

import { use, useLayoutEffect } from "react";
import { getRoomBySlug, getRoomUsersBySlug } from "@/data/room";
import { joinRoom, submitAnswer } from "./actions.server";
import { useRoomState } from "@/lib/supabase";
import {
  getQuestionsByRoomSlug,
  getUserResponsesInRoom,
} from "@/data/question";
import { Button, Card, CardContent, CardHeader } from "@mui/material";

export function JoinRoomAsNewUser({
  roomPromise,
}: {
  roomPromise: ReturnType<typeof getRoomBySlug>;
}) {
  const { slug, startedAt } = use(roomPromise);
  const quizAlreadyStarted = !!startedAt;

  useLayoutEffect(() => {
    if (!quizAlreadyStarted) {
      joinRoom(slug).finally(() => location.reload());
    }
  }, [slug, quizAlreadyStarted]);

  if (quizAlreadyStarted) {
    return (
      <div>
        <h1>Room: {slug}</h1>
        <p>Quiz already started, you should find a new room i guess</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Room: {slug}</h1>
      <p>Creating a new username for you...</p>
    </div>
  );
}

export function Room({
  roomPromise,
  questionsPromise,
  username,
  adminUsername,
  roomUsers,
  responsesPromise,
}: {
  username: string;
  adminUsername: string;
  roomPromise: ReturnType<typeof getRoomBySlug>;
  questionsPromise: ReturnType<
    typeof getQuestionsByRoomSlug & { correctOption?: never }
  >;
  roomUsers: Awaited<ReturnType<typeof getRoomUsersBySlug>>;
  responsesPromise: ReturnType<typeof getUserResponsesInRoom>;
}) {
  const room = use(roomPromise);
  const questions = use(questionsPromise);
  const responses = use(responsesPromise);

  const { globalState, trackState, roomStartedAt } = useRoomState({
    roomSlug: room.slug,
    username,
    adminUsername,
    initialState: { responses, startedAt: room.startedAt },
  });

  const liveResponses = globalState[username]?.responses ?? [];

  const nextQuestion = questions.find(
    (it) => !liveResponses.some((response) => response.questionId === it.id)
  );

  if (!roomStartedAt) {
    return (
      <Card>
        <CardHeader title="Waiting for admin to start the quiz" />
      </Card>
    );
  }

  if (!nextQuestion) {
    return (
      <Card>
        <CardHeader title="Quiz complete, check the scoreboard for your rankings" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={<span>{nextQuestion.question}</span>} />
      <CardContent className="flex flex-col gap-2">
        {Object.entries(nextQuestion.options).map(([choice, question]) => (
          <Button
            variant="outlined"
            onClick={() => {
              submitAnswer(nextQuestion.id, choice);
              trackState({
                responses: liveResponses
                  .filter((it) => it.questionId !== nextQuestion.id)
                  .concat({ choice, questionId: nextQuestion.id }),
              });
            }}
          >
            {question}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
