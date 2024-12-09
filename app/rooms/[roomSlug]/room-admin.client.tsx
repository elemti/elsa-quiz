"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { use, useEffect } from "react";
import { getRoomBySlug, getRoomUsersBySlug } from "@/data/room";
import { useRoomState } from "@/lib/supabase";
import {
  getCorrectOptionsByRoomSlug,
  getQuestionsByRoomSlug,
} from "@/data/question";
import { adminStartQuiz } from "./actions.server";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Typography,
} from "@mui/material";

export function RoomAdmin({
  roomPromise,
  username,
  questionsPromise,
  correctOptsPromise,
}: {
  roomPromise: ReturnType<typeof getRoomBySlug>;
  username: string;
  roomUsers: Awaited<ReturnType<typeof getRoomUsersBySlug>>;
  questionsPromise: ReturnType<typeof getQuestionsByRoomSlug>;
  correctOptsPromise: ReturnType<typeof getCorrectOptionsByRoomSlug>;
}) {
  const room = use(roomPromise);
  const questions = use(questionsPromise);
  const correctOpts = use(correctOptsPromise);
  const { trackState, globalState, roomStartedAt } = useRoomState({
    roomSlug: room.slug,
    username,
    adminUsername: username,
  });

  return (
    <Card>
      <CardHeader
        title={<span>Room: {room.slug}</span>}
        subheader={
          roomStartedAt ? (
            <span>Quiz in progress</span>
          ) : (
            <span>Not started</span>
          )
        }
      />
      <CardContent>
        <Box className="flex flex-col">
          {Object.values(globalState)
            .sort((a, b) => {
              const numACorrect = a.responses?.filter(
                (it) => it.choice === correctOpts[it.questionId]
              ).length;
              const numBCorrect = b.responses?.filter(
                (it) => it.choice === correctOpts[it.questionId]
              ).length;
              if (!numACorrect && !numBCorrect) return 0;
              if (!numACorrect) return 1;
              if (!numBCorrect) return -1;
              return numBCorrect - numACorrect;
            })
            // .filter((it) => it.username !== username)
            .map((it) => (
              <Chip
                className="justify-start w-full [&>.MuiChip-label]:flex-1"
                key={it.username}
                avatar={<Avatar>{it.username.slice(0, 1)}</Avatar>}
                label={
                  <div className="flex flex-row">
                    {it.username === username ? (
                      <Typography>{it.username} (You - admin)</Typography>
                    ) : (
                      <Typography>{it.username}</Typography>
                    )}
                    <div className="flex-1" />
                    <Typography>
                      {globalState[it.username]?.responses?.length ?? 0}/
                      {questions.length}
                    </Typography>
                  </div>
                }
                size="medium"
              />
            ))}
        </Box>
      </CardContent>
      <CardActions>
        {!roomStartedAt && (
          <Button
            onClick={async () => {
              const { startedAt } = await adminStartQuiz();
              trackState({ startedAt });
            }}
            disabled={Object.values(globalState).length <= 1}
            variant="contained"
          >
            {Object.values(globalState).length <= 1 && !roomStartedAt
              ? "Waiting for more users to join..."
              : "Start Quiz"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
