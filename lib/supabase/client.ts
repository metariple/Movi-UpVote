"use client";

import { createBrowserClient } from "@supabase/ssr";

// Браузерный клиент Supabase. Использует публичный anon-ключ —
// защита данных живёт в RLS на стороне БД, не здесь.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
