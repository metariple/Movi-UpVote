"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="wrap">
      <header className="masthead">
        <h1>🎬 MoviUpVote</h1>
        <p className="tag">Топ фильмов и сериалов нашей тусовки.</p>
      </header>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>
        Войди, чтобы голосовать и добавлять тайтлы.
      </p>
      <button className="btn btn-primary" onClick={signInWithGoogle}>
        Войти через Google
      </button>
    </main>
  );
}
