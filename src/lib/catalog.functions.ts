import { createServerFn } from "@tanstack/react-start";

// Public read: lists catalog items and signs photo URLs server-side,
// so the private "catalog" bucket needs no public read rule.
export const getCatalogItems = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("catalog_items")
    .select("id, name, description, price_label, category, image_url, created_at")
    .order("created_at");
  if (error) throw new Error("Não foi possível carregar o catálogo.");
  if (!data.length) return [];
  const { data: signed } = await supabaseAdmin.storage
    .from("catalog")
    .createSignedUrls(data.map((d) => d.image_url), 60 * 60 * 24 * 7);
  return data.map((d, i) => ({ ...d, imageSrc: signed?.[i]?.signedUrl ?? "" }));
});
