export default function Loading() {
  return (
    <main className="wrap">
      <header className="masthead">
        <div className="topbar">
          <div />
        </div>
        <h1>23 Films</h1>
        <p className="tag">Добавляй фильмы и сериалы, голосуй за любимые — топ складывается сам.</p>
      </header>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton-block" style={{ width: 20, height: 20 }} />
          <div className="skeleton-block" style={{ width: 54, height: 54, borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-block" style={{ width: "60%", height: 20, marginBottom: 8 }} />
            <div className="skeleton-block" style={{ width: "35%", height: 14 }} />
          </div>
        </div>
      ))}
    </main>
  );
}
