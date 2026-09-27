import { supabase } from "@/integrations/supabase/client";

export const catalogCategories = ["Progressiva", "Cabelos", "Sobrancelhas", "Tratamentos", "Coloração"] as const;

export async function fetchCatalogItems() {
  const { data, error } = await supabase.from("catalog_items").select("*").order("created_at");
  if (error) throw error;
  if (!data.length) return [];
  const { data: signed } = await supabase.storage
    .from("catalog")
    .createSignedUrls(data.map((d) => d.image_url), 60 * 60 * 24 * 7);
  return data.map((d, i) => ({ ...d, imageSrc: signed?.[i]?.signedUrl ?? "" }));
}
