"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TitleForm } from "@/components/TitleForm";

export function AddTitle() {
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

  return (
    <>
      <TitleForm
        name={name}
        kind={kind}
        onNameChange={setName}
        onKindChange={setKind}
        onSubmit={submit}
        submitLabel="Добавить"
        submittingLabel="Добавляю…"
        submitting={submitting || pending}
      />
      {error && <p className="add-form-error">{error}</p>}
    </>
  );
}
