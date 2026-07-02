"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VoteButton({
  titleId,
  initialCount,
  initialVoted,
  loggedIn,
}: {
  titleId: number;
  initialCount: number;
  initialVoted: boolean;
  loggedIn: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    if (!loggedIn || pending) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Оптимистично переключаем, откатываем при ошибке.
    const nextVoted = !voted;
    setVoted(nextVoted);
    setCount((c) => c + (nextVoted ? 1 : -1));

    const { error } = nextVoted
      ? await supabase.from("votes").insert({ user_id: user.id, title_id: titleId })
      : await supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id)
          .eq("title_id", titleId);

    if (error) {
      // Откат оптимистичного апдейта.
      setVoted(!nextVoted);
      setCount((c) => c + (nextVoted ? -1 : 1));
      return;
    }
    // Пересортировать топ.
    startTransition(() => router.refresh());
  }

  return (
    <button
      className={`vote${voted ? " voted" : ""}`}
      onClick={toggle}
      disabled={!loggedIn || pending}
      title={loggedIn ? (voted ? "Снять голос" : "Голосовать") : "Войти, чтобы голосовать"}
      aria-pressed={voted}
    >
      <span className="arrow">▲</span>
      <span className="count">{count}</span>
    </button>
  );
}
