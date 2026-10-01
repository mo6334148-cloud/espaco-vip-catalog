import { getCatalogItems } from "./catalog.functions";

export const catalogCategories = ["Progressiva", "Cabelos", "Sobrancelhas", "Tratamentos", "Coloração"] as const;

export async function fetchCatalogItems() {
  return getCatalogItems();
}
