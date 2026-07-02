import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Newsreader } from "next/font/google";

// ОРИГИНАЛЬНАЯ связка из design-consultation, возвращена по решению автора.
// ВАЖНО: Fraunces и Newsreader НЕ поддерживают кириллицу (только latin) —
// поэтому subsets:["latin"], а русский текст сознательно падает на Georgia-
// фолбэк (см. globals.css --font-display/--font-body и DESIGN.md).
// Настоящий фикс кириллицы — отдельная задача (TODOS).
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoviUpVote — топ нашей тусовки",
  description: "Фильмы и сериалы, которые мы советуем друг другу. Голосуй, поднимай в топ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${fraunces.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
