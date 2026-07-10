"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddTitle() {
  const nameId = useId();
  const kindId = useId();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<"movie" | "series">("movie");
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setError(null);
    setSubmitting(true);

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
      year: null,
      added_by: user.id,
    });

    setSubmitting(false);
    if (error) {
      setError("Не получилось добавить. Попробуй ещё раз.");
      return;
    }
    setName("");
    startTransition(() => router.refresh());
  }

  const busy = submitting || pending;

  return (
    <>
      <form className="add-form" onSubmit={submit}>
        <div className="field field-name">
          <label htmlFor={nameId}>Название</label>
          <input
            id={nameId}
            type="text"
            placeholder="Фильм или сериал…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="field field-kind">
          <label htmlFor={kindId}>Тип</label>
          <select id={kindId} value={kind} onChange={(e) => setKind(e.target.value as "movie" | "series")}>
            <option value="movie">фильм</option>
            <option value="series">сериал</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !name.trim()}>
          {submitting ? "Добавляю…" : "Добавить"}
        </button>
      </form>
      {error && <p className="add-form-error">{error}</p>}
    </>
  );
}
