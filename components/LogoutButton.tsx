"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      style={{
        background: "none",
        border: "none",
        color: "var(--clay)",
        cursor: "pointer",
        font: "inherit",
        padding: 0,
        textDecoration: "underline",
      }}
    >
      выйти
    </button>
  );
}
