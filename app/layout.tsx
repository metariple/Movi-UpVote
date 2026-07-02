import "./globals.css";
import type { Metadata } from "next";
import { Alegreya, Lora } from "next/font/google";

// Display: тёплый литературный серив (замена Fraunces — тот не держит кириллицу).
const alegreya = Alegreya({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Body/UI: читаемый текстовый серив (замена Newsreader — та же причина).
const lora = Lora({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoviUpVote — топ нашей тусовки",
  description: "Фильмы и сериалы, которые мы советуем друг другу. Голосуй, поднимай в топ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${alegreya.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
