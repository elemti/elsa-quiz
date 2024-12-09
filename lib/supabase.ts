import {
  createClient,
  RealtimeChannel,
  RealtimePresenceState,
} from "@supabase/supabase-js";
import { envs } from "@/envs";
import { useLayoutEffect, useRef, useState } from "react";

export const supabase = createClient(
  envs.NEXT_PUBLIC_SUPABASE_URL,
  envs.NEXT_PUBLIC_SUPABASE_KEY
);

type MemberState = {
  username: string;
  onlineAt: string;
  startedAt?: string;
  responses?: {
    questionId: number;
    choice: string;
  }[];
};

export const useRoomState = ({
  roomSlug,
  username,
  adminUsername,
  initialState,
}: {
  roomSlug: string;
  username: string;
  adminUsername: string;
  initialState?: Partial<MemberState>;
}) => {
  const [globalState, setGlobalState] = useState<Record<string, MemberState>>(
    {}
  );
  const roomStartedAt = globalState[adminUsername]?.startedAt ?? null;
  const isAdmin = username === adminUsername;
  const channelRef = useRef<RealtimeChannel | null>(null);

  async function trackState(data: Partial<MemberState>) {
    return await channelRef.current?.track({
      username,
      onlineAt: new Date().toISOString(),
      ...data,
    } satisfies MemberState);
  }

  useLayoutEffect(() => {
    const channel = supabase.channel(`room:${roomSlug}`, {
      config: { presence: { key: username } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<MemberState>();
        console.log("sync", newState);

        setGlobalState(
          Object.fromEntries(
            Object.entries(newState).map(([key, value]) => [key, value[0]])
          ) as any
        );
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        await channel.track({
          username,
          onlineAt: new Date().toISOString(),
          ...initialState,
        } satisfies MemberState);
      });

    return () => void channel.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { roomStartedAt, channelRef, trackState, globalState };
};
