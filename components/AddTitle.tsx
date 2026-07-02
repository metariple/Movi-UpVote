"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddTitle() {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"movie" | "series">("movie");
  const [year, setYear] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("titles").insert({
      name: trimmed,
      kind,
      year: year ? Number(year) : null,
      added_by: user.id,
    });

    if (error) {
      setError("Не получилось добавить. Попробуй ещё раз.");
      return;
    }
    setName("");
    setYear("");
    startTransition(() => router.refresh());
  }

  return (
    <>
      <form className="add" onSubmit={submit}>
        <input
          type="text"
          placeholder="Название фильма или сериала…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
        />
        <select value={kind} onChange={(e) => setKind(e.target.value as "movie" | "series")}>
          <option value="movie">фильм</option>
          <option value="series">сериал</option>
        </select>
        <input
          type="text"
          inputMode="numeric"
          placeholder="год"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          style={{ width: 68 }}
        />
        <button className="btn btn-primary" type="submit" disabled={pending || !name.trim()}>
          Добавить
        </button>
      </form>
      {error && <p style={{ color: "var(--accent)", fontSize: 13, marginTop: -12, marginBottom: 16 }}>{error}</p>}
    </>
  );
}
