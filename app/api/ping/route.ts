import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Keepalive: Vercel Cron дёргает этот эндпоинт по расписанию, чтобы
// free-проект Supabase не засыпал после ~7 дней тишины.
// (НЕ GitHub Actions — их cron авто-отключается после 60 дней.)
export async function GET(request: Request) {
  // Vercel Cron шлёт Authorization: Bearer <CRON_SECRET>.
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Любой запрос к Supabase сбрасывает таймер простоя.
  const supabase = await createClient();
  await supabase.from("titles").select("id").limit(1);

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
