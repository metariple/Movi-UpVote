import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VoteButton } from "@/components/VoteButton";
import { AddTitle } from "@/components/AddTitle";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

type TitleRow = {
  id: number;
  name: string;
  kind: "movie" | "series";
  year: number | null;
  added_by_name: string;
  vote_count: number;
};

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Топ из view (RLS: анон читает titles/votes/profiles(display_name),
  // но не пишет — см. supabase/seed.sql, блок "Round 2a").
  const { data: titles } = await supabase
    .from("titles_with_vote_counts")
    .select("id, name, kind, year, added_by_name, vote_count");

  // Какие тайтлы уже поддержал текущий юзер — для подсветки кнопки.
  let myVotes = new Set<number>();
  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("title_id")
      .eq("user_id", user.id);
    myVotes = new Set((votes ?? []).map((v) => v.title_id as number));
  }

  const list = (titles ?? []) as TitleRow[];

  return (
    <main className="wrap">
      <div className="topbar">
        <div />
        {user ? (
          <span className="who">
            {user.user_metadata?.full_name ?? user.email} · <LogoutButton />
          </span>
        ) : (
          <Link href="/login" className="who">
            Войти
          </Link>
        )}
      </div>

      <header className="masthead">
        <h1>23 Films</h1>
        <p className="tag">Добавляй фильмы и сериалы, голосуй за любимые — топ складывается сам.</p>
      </header>

      {user && <AddTitle />}

      {list.length === 0 ? (
        <div className="empty-state">
          <h2>Здесь будет наш топ</h2>
          <p>
            {user
              ? "Добавь первый фильм или сериал — с него всё начнётся"
              : "Войди, чтобы увидеть топ и голосовать"}
          </p>
          {user && <div className="arrow-up">↑</div>}
        </div>
      ) : (
        <ol className="title-list">
          {list.map((t, i) => (
            <li key={t.id} className="title-row">
              <span className="rank">{i + 1}</span>
              <VoteButton
                titleId={t.id}
                titleName={t.name}
                initialCount={t.vote_count}
                initialVoted={myVotes.has(t.id)}
                loggedIn={!!user}
              />
              <div className="title-main">
                <div className="title-name">{t.name}</div>
                <div className="title-meta">
                  {t.kind === "series" ? "сериал" : "фильм"}
                  {t.year ? ` · ${t.year}` : ""} · добавил {t.added_by_name}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
