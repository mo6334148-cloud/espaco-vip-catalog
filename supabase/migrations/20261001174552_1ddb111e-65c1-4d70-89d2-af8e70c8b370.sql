DROP POLICY IF EXISTS "Anyone views catalog photos" ON storage.objects;
CREATE POLICY "Admin views catalog photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'catalog' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Public reads settings" ON public.salon_settings;
DROP POLICY IF EXISTS "Public reads professionals" ON public.professionals;
DROP POLICY IF EXISTS "Public reads professional services" ON public.professional_services;
DROP POLICY IF EXISTS "Public reads services" ON public.services;
DROP POLICY IF EXISTS "Public reads hours" ON public.business_hours;
DROP POLICY IF EXISTS "Public reads catalog items" ON public.catalog_items;