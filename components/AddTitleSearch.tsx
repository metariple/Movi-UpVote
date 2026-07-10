"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TitleForm } from "@/components/TitleForm";

type Match = {
  id: number;
  name: string;
  kind: "movie" | "series";
  year: number | null;
  vote_count: number;
};

const DEBOUNCE_MS = 200;

export function AddTitleSearch() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"movie" | "series">("movie");
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Живой поиск по уже добавленным тайтлам — ловит опечатки/частичные
  // совпадения в пределах одного языка (ilike), но НЕ межъязыковые
  // дубли (Матрица / The Matrix) — это требует TMDB, отложено в TODOS.md.
  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!trimmed) {
      setMatches([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("titles_with_vote_counts")
        .select("id, name, kind, year, vote_count")
        .ilike("name", `%${trimmed}%`)
        .order("vote_count", { ascending: false })
        .limit(5);
      setMatches((data ?? []) as Match[]);
      setSearching(false);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function openAddForm() {
    setName(query.trim());
    setShowAddForm(true);
  }

  async function submitNew(e: React.FormEvent) {
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
      setError(
        error.code === "23505" ? "Такой тайтл уже есть в списке." : "Не получилось добавить. Попробуй ещё раз."
      );
      return;
    }
    setName("");
    setQuery("");
    setShowAddForm(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="add-search">
      {!showAddForm && (
        <div className="field field-name">
          <label htmlFor="title-search">Название</label>
          <input
            id="title-search"
            type="text"
            placeholder="Начни печатать название…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {query.trim() && !showAddForm && (
        <div className="search-results">
          {searching ? (
            <p className="search-status">Ищу…</p>
          ) : matches.length > 0 ? (
            <>
              <ul className="search-matches">
                {matches.map((m) => (
                  <li key={m.id} className="search-match">
                    <span className="search-match-name">{m.name}</span>
                    <span className="search-match-meta">
                      {m.kind === "series" ? "сериал" : "фильм"}
                      {m.year ? ` · ${m.year}` : ""} · уже в списке, {m.vote_count} ▲
                    </span>
                  </li>
                ))}
              </ul>
              <p className="search-status">
                Уже в списке? Голосуй ниже вместо повторного добавления.{" "}
                <button type="button" className="edit-link" onClick={openAddForm}>
                  Не нашёл своё — добавить
                </button>
              </p>
            </>
          ) : (
            <p className="search-status">
              Ничего не нашлось.{" "}
              <button type="button" className="edit-link" onClick={openAddForm}>
                Добавить «{query.trim()}»
              </button>
            </p>
          )}
        </div>
      )}

      {showAddForm && (
        <TitleForm
          name={name}
          kind={kind}
          onNameChange={setName}
          onKindChange={setKind}
          onSubmit={submitNew}
          submitLabel="Добавить"
          submittingLabel="Добавляю…"
          submitting={submitting || pending}
          extraActions={
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
            >
              Отмена
            </button>
          }
        />
      )}
      {error && <p className="add-form-error">{error}</p>}
    </div>
  );
}
