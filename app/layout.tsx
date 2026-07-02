import "./globals.css";
import type { Metadata } from "next";
import { Literata } from "next/font/google";

// Один шрифт на всё (замена Alegreya+Lora, которые в свою очередь заменили
// Fraunces+Newsreader — те вообще не держат кириллицу). Literata — ближайший
// работающий аналог характера Fraunces: тот же variable opsz-эффект,
// мягкий литературный курсив, полная поддержка кириллицы. Иерархия
// display/body теперь через вес и кегль одного семейства, не через смену шрифта.
const literata = Literata({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoviUpVote — топ нашей тусовки",
  description: "Фильмы и сериалы, которые мы советуем друг другу. Голосуй, поднимай в топ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={literata.variable}>
      <body>{children}</body>
    </html>
  );
}
