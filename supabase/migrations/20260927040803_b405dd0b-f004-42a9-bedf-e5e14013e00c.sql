CREATE TABLE public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_label text,
  category text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalog_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads catalog items" ON public.catalog_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages catalog items" ON public.catalog_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin uploads catalog photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalog' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes catalog photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalog' AND public.has_role(auth.uid(), 'admin'));