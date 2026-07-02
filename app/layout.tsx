import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MoviUpVote — топ нашей тусовки",
  description: "Фильмы и сериалы, которые мы советуем друг другу. Голосуй, поднимай в топ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
