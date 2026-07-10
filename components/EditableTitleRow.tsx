"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TitleForm } from "@/components/TitleForm";

export function EditableTitleRow({
  titleId,
  name: initialName,
  kind: initialKind,
  year,
  addedByName,
  isOwner,
}: {
  titleId: number;
  name: string;
  kind: "movie" | "series";
  year: number | null;
  addedByName: string;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState(initialKind);
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
    const { data, error } = await supabase
      .from("titles")
      .update({ name: trimmed, kind })
      .eq("id", titleId)
      .select();

    setSubmitting(false);
    if (error) {
      setError("Не получилось сохранить. Попробуй ещё раз.");
      return;
    }
    if (!data || data.length === 0) {
      // RLS молча не находит строку, если added_by ≠ auth.uid() — это не
      // сетевая ошибка, а именно "это не твой тайтл".
      setError("Редактировать может только тот, кто добавил тайтл.");
      return;
    }
    setEditing(false);
    startTransition(() => router.refresh());
  }

  if (editing) {
    return (
      <TitleForm
        name={name}
        kind={kind}
        onNameChange={setName}
        onKindChange={setKind}
        onSubmit={submit}
        submitLabel="Сохранить"
        submittingLabel="Сохраняю…"
        submitting={submitting || pending}
        extraActions={
          <button
            type="button"
            className="btn"
            onClick={() => {
              setName(initialName);
              setKind(initialKind);
              setError(null);
              setEditing(false);
            }}
          >
            Отмена
          </button>
        }
      />
    );
  }

  return (
    <div className="title-main">
      <div className="title-name">
        {initialName}
        {isOwner && (
          <button type="button" className="edit-link" onClick={() => setEditing(true)}>
            изменить
          </button>
        )}
      </div>
      <div className="title-meta">
        {initialKind === "series" ? "сериал" : "фильм"}
        {year ? ` · ${year}` : ""} · добавил {addedByName}
      </div>
      {error && <p className="add-form-error">{error}</p>}
    </div>
  );
}
