CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.appointment_status AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');

-- Roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Professionals
CREATE TABLE public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professionals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads professionals" ON public.professionals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages professionals" ON public.professionals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0 AND duration_minutes <= 720),
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  price_label text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.professional_services (
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);
GRANT SELECT ON public.professional_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.professional_services TO authenticated;
GRANT ALL ON public.professional_services TO service_role;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads professional services" ON public.professional_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages professional services" ON public.professional_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Business hours (0 = domingo ... 6 = sábado)
CREATE TABLE public.business_hours (
  weekday smallint PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT false,
  open_time time NOT NULL DEFAULT '09:00',
  close_time time NOT NULL DEFAULT '19:00',
  break_start time,
  break_end time,
  CHECK (close_time > open_time),
  CHECK ((break_start IS NULL AND break_end IS NULL) OR (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start))
);
GRANT SELECT ON public.business_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_hours TO authenticated;
GRANT ALL ON public.business_hours TO service_role;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads hours" ON public.business_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages hours" ON public.business_hours FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.salon_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  slot_step_minutes integer NOT NULL DEFAULT 30 CHECK (slot_step_minutes BETWEEN 5 AND 240),
  buffer_minutes integer NOT NULL DEFAULT 0 CHECK (buffer_minutes BETWEEN 0 AND 240)
);
GRANT SELECT ON public.salon_settings TO anon, authenticated;
GRANT UPDATE ON public.salon_settings TO authenticated;
GRANT ALL ON public.salon_settings TO service_role;
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads settings" ON public.salon_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin updates settings" ON public.salon_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Time blocks (admin only)
CREATE TABLE public.time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE,
  block_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_blocks TO authenticated;
GRANT ALL ON public.time_blocks TO service_role;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages blocks" ON public.time_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients (admin only)
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Appointments (admin only; public creates through create_booking)
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pendente',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
    professional_id WITH =,
    tsrange(appointment_date + start_time, appointment_date + end_time) WITH &&
  ) WHERE (status IN ('pendente', 'confirmado'))
);
CREATE INDEX appointments_date_idx ON public.appointments (appointment_date, professional_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages appointments" ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Available slots
CREATE OR REPLACE FUNCTION public.get_available_slots(_service_id uuid, _professional_id uuid, _date date)
RETURNS TABLE (slot time)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dur interval;
  v_step interval;
  v_buf interval;
  v_h public.business_hours;
  v_t time;
  v_end time;
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  v_now time := (now() AT TIME ZONE 'America/Sao_Paulo')::time;
BEGIN
  IF _date < v_today OR _date > v_today + 180 THEN RETURN; END IF;
  SELECT make_interval(mins => duration_minutes) INTO v_dur FROM public.services WHERE id = _service_id AND active;
  IF v_dur IS NULL THEN RETURN; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.professional_services ps JOIN public.professionals p ON p.id = ps.professional_id
    WHERE ps.professional_id = _professional_id AND ps.service_id = _service_id AND p.active
  ) THEN RETURN; END IF;
  SELECT make_interval(mins => slot_step_minutes), make_interval(mins => buffer_minutes) INTO v_step, v_buf
    FROM public.salon_settings WHERE id = 1;
  v_step := COALESCE(v_step, interval '30 minutes');
  v_buf := COALESCE(v_buf, interval '0');
  SELECT * INTO v_h FROM public.business_hours WHERE weekday = extract(dow FROM _date)::smallint;
  IF v_h IS NULL OR NOT v_h.is_open THEN RETURN; END IF;

  v_t := v_h.open_time;
  WHILE (_date + v_t + v_dur) <= (_date + v_h.close_time) LOOP
    v_end := v_t + v_dur;
    IF NOT (_date = v_today AND v_t <= v_now)
      AND NOT (v_h.break_start IS NOT NULL AND v_t < v_h.break_end AND v_end > v_h.break_start)
      AND NOT EXISTS (
        SELECT 1 FROM public.time_blocks b
        WHERE b.block_date = _date AND (b.professional_id IS NULL OR b.professional_id = _professional_id)
          AND v_t < b.end_time AND v_end > b.start_time)
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.professional_id = _professional_id AND a.appointment_date = _date
          AND a.status IN ('pendente', 'confirmado')
          AND (_date + v_t) < (_date + a.end_time + v_buf)
          AND (_date + v_end + v_buf) > (_date + a.start_time))
    THEN
      slot := v_t;
      RETURN NEXT;
    END IF;
    EXIT WHEN (_date + v_t + v_step) >= (_date + interval '1 day');
    v_t := v_t + v_step;
  END LOOP;
END;
$$;

-- Create booking (validates everything server-side)
CREATE OR REPLACE FUNCTION public.create_booking(
  _service_id uuid, _professional_id uuid, _date date, _start time,
  _name text, _phone text, _email text DEFAULT NULL,
  _status public.appointment_status DEFAULT 'pendente', _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_dur integer;
  v_client uuid;
  v_id uuid;
  v_phone text := regexp_replace(COALESCE(_phone, ''), '\D', '', 'g');
  v_name text := btrim(COALESCE(_name, ''));
  v_email text := NULLIF(btrim(COALESCE(_email, '')), '');
  v_status public.appointment_status := 'pendente';
BEGIN
  IF length(v_name) < 2 OR length(v_name) > 100 THEN RAISE EXCEPTION 'Informe um nome válido.'; END IF;
  IF length(v_phone) < 10 OR length(v_phone) > 13 THEN RAISE EXCEPTION 'Informe um WhatsApp válido com DDD.'; END IF;
  IF v_email IS NOT NULL AND (length(v_email) > 255 OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') THEN
    RAISE EXCEPTION 'Informe um e-mail válido.';
  END IF;
  IF public.has_role(auth.uid(), 'admin') THEN v_status := COALESCE(_status, 'pendente'); END IF;

  PERFORM pg_advisory_xact_lock(hashtext(_professional_id::text || _date::text));
  IF NOT EXISTS (SELECT 1 FROM public.get_available_slots(_service_id, _professional_id, _date) s WHERE s.slot = _start) THEN
    RAISE EXCEPTION 'Este horário não está mais disponível. Escolha outro horário.';
  END IF;

  SELECT duration_minutes INTO v_dur FROM public.services WHERE id = _service_id;

  INSERT INTO public.clients (name, phone, email) VALUES (v_name, v_phone, v_email)
  ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, email = COALESCE(EXCLUDED.email, public.clients.email)
  RETURNING id INTO v_client;

  INSERT INTO public.appointments (client_id, client_name, client_phone, client_email, service_id, professional_id,
    appointment_date, start_time, end_time, status, notes)
  VALUES (v_client, v_name, v_phone, v_email, _service_id, _professional_id,
    _date, _start, _start + make_interval(mins => v_dur), v_status,
    CASE WHEN public.has_role(auth.uid(), 'admin') THEN _notes ELSE NULL END)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_available_slots(uuid, uuid, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_booking(uuid, uuid, date, time, text, text, text, public.appointment_status, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_available_slots(uuid, uuid, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, uuid, date, time, text, text, text, public.appointment_status, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Seed
INSERT INTO public.salon_settings (id, slot_step_minutes, buffer_minutes) VALUES (1, 30, 0);

INSERT INTO public.business_hours (weekday, is_open, open_time, close_time, break_start, break_end) VALUES
  (0, false, '09:00', '19:00', NULL, NULL),
  (1, false, '09:00', '19:00', NULL, NULL),
  (2, true, '09:00', '19:00', '12:00', '13:00'),
  (3, true, '09:00', '19:00', '12:00', '13:00'),
  (4, true, '09:00', '19:00', '12:00', '13:00'),
  (5, true, '09:00', '19:00', '12:00', '13:00'),
  (6, true, '09:00', '19:00', '12:00', '13:00');

INSERT INTO public.professionals (id, name) VALUES ('00000000-0000-0000-0000-0000000000a1', 'Thais');

INSERT INTO public.services (name, description, duration_minutes, price_cents, price_label, sort_order) VALUES
  ('Progressiva — raiz', 'Aplicação na raiz, com opções de progressiva com ou sem formol.', 120, 11000, 'R$ 110,00', 1),
  ('Progressiva — cabelo médio', 'Raiz + comprimento para cabelo médio, com opções de progressiva com ou sem formol.', 150, 13000, 'R$ 130,00', 2),
  ('Progressiva — cabelo longo', 'Raiz + comprimento para cabelo longo, com opções de progressiva com ou sem formol.', 180, 15000, 'De R$ 150,00 a R$ 180,00', 3),
  ('Progressiva sem formol', 'Alinhamento dos fios e redução de volume com uma opção sem formol.', 150, 11000, 'A partir de R$ 110,00', 4),
  ('Design simples', 'Design de sobrancelhas pensado para valorizar o formato natural do rosto.', 30, 2000, 'R$ 20,00', 5),
  ('Design com henna', 'Design com aplicação de henna para preencher visualmente as falhas e destacar o olhar.', 45, 3000, 'R$ 30,00', 6),
  ('Corte Feminino', 'Corte personalizado para renovar o visual e valorizar o formato do rosto e o estilo de cada cliente.', 45, 3000, 'R$ 30,00', 7),
  ('Escova', 'Finalização para deixar os fios alinhados, leves, brilhantes e preparados para a ocasião.', 60, 4000, 'A partir de R$ 40,00', 8),
  ('Cauterização', 'Tratamento capilar para auxiliar na reconstrução e recuperação dos fios.', 90, 8000, 'A partir de R$ 80,00', 9),
  ('Tintura', 'O valor do serviço refere-se somente à mão de obra. A tinta custa R$ 30,00 por unidade.', 90, 3500, 'Mão de obra a partir de R$ 35,00', 10),
  ('Cronograma Capilar', 'Sequência profissional de cuidados para os fios. O valor pode variar conforme o comprimento do cabelo.', 90, 15000, 'A partir de R$ 150,00', 11);

INSERT INTO public.professional_services (professional_id, service_id)
SELECT '00000000-0000-0000-0000-0000000000a1', id FROM public.services;