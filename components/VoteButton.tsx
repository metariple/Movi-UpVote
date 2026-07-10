"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VoteButton({
  titleId,
  titleName,
  initialCount,
  initialVoted,
  loggedIn,
}: {
  titleId: number;
  titleName: string;
  initialCount: number;
  initialVoted: boolean;
  loggedIn: boolean;
}) {
  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="vote-pill vote-pill-cta"
        aria-label={`Войти, чтобы голосовать за «${titleName}», сейчас ${initialCount} ${pluralGolos(initialCount)}`}
        title="Войти, чтобы голосовать"
      >
        <span className="arrow" aria-hidden="true">
          ▲
        </span>
        <span className="count">{initialCount}</span>
      </Link>
    );
  }

  return <VoteButtonInteractive {...{ titleId, titleName, initialCount, initialVoted }} />;
}

function VoteButtonInteractive({
  titleId,
  titleName,
  initialCount,
  initialVoted,
}: {
  titleId: number;
  titleName: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [flashError, setFlashError] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    if (pending) return;

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
      // Откат оптимистичного апдейта + короткая визуальная вспышка ошибки.
      setVoted(!nextVoted);
      setCount((c) => c + (nextVoted ? -1 : 1));
      setFlashError(true);
      setTimeout(() => setFlashError(false), 320);
      return;
    }
    // Пересортировать топ.
    startTransition(() => router.refresh());
  }

  return (
    <button
      className={`vote-pill${voted ? " voted" : ""}${flashError ? " flash-error" : ""}`}
      onClick={toggle}
      disabled={pending}
      title={voted ? "Снять голос" : "Голосовать"}
      aria-pressed={voted}
      aria-label={`Голосовать за «${titleName}», сейчас ${count} ${pluralGolos(count)}`}
    >
      <span className="arrow" aria-hidden="true">
        ▲
      </span>
      <span className="count">{count}</span>
    </button>
  );
}

function pluralGolos(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "голос";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "голоса";
  return "голосов";
}
