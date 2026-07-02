"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap">
      <header className="masthead">
        <h1>🎬 MoviUpVote</h1>
      </header>
      <div className="error-banner">
        <p>Не удалось загрузить топ.</p>
        <button className="btn btn-primary" onClick={reset}>
          Обновить
        </button>
      </div>
    </main>
  );
}
