import { createFileRoute } from "@tanstack/react-router";
import { usernameToEmail } from "@/lib/admin-login";

// Temporary one-time setup: creates the admin account only if no admin exists yet.
export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async () => {
        const password = process.env["ADMIN_BOOTSTRAP_PASSWORD"];
        if (!password) return new Response("not configured", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) > 0) return new Response("already done", { status: 409 });
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: usernameToEmail("thaisespaçovip"),
          password,
          email_confirm: true,
        });
        if (error || !data.user) return new Response(error?.message ?? "error", { status: 500 });
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "admin" });
        if (roleError) return new Response(roleError.message, { status: 500 });
        return new Response("ok");
      },
    },
  },
});
