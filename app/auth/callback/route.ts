import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth-возврат от Google: меняем code на сессию и создаём профиль
// (client-side/серверный upsert — НЕ триггер на auth.users).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert профиля при первом заходе. RLS пускает — это своя строка.
        const displayName =
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split("@")[0] ??
          "Аноним";
        await supabase
          .from("profiles")
          .upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
