-- 00001_init.sql
-- Creates stores and logs tables and seeds initial store data

BEGIN;

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  brand TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

-- Logs table: use timestamptz for proper ordering
CREATE TABLE IF NOT EXISTS public.logs (
  id TEXT PRIMARY KEY,
  product TEXT,
  storeId TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
  storeName TEXT,
  loggedAt timestamptz NOT NULL DEFAULT now()
);

-- Index to speed recent queries
CREATE INDEX IF NOT EXISTS idx_logs_loggedat ON public.logs (loggedAt DESC);

-- Seed stores only if empty
INSERT INTO public.stores (id, brand, name, address, lat, lng)
SELECT s.* FROM (
  VALUES
    ('waitrose-kings-road','Waitrose','Waitrose King''s Road','196 King''s Road, Chelsea',51.4877,-0.168),
    ('waitrose-canary-wharf','Waitrose','Waitrose Canary Wharf','Canada Square, Canary Wharf',51.5049,-0.0195),
    ('waitrose-bloomsbury','Waitrose','Waitrose Bloomsbury','The Brunswick, Bloomsbury',51.5243,-0.1238),
    ('waitrose-bayswater','Waitrose','Waitrose Bayswater','Porchester Road, Bayswater',51.5145,-0.1885),
    ('waitrose-wandsworth','Waitrose','Waitrose Wandsworth','Southside Shopping Centre, Wandsworth',51.4558,-0.1939),
    ('waitrose-balham','Waitrose','Waitrose Balham','Balham High Road',51.4431,-0.1513),
    ('waitrose-finchley-road','Waitrose','Waitrose Finchley Road','Finchley Road, Swiss Cottage',51.5432,-0.1748),
    ('waitrose-westfield-stratford','Waitrose','Waitrose Stratford City','Westfield Stratford City',51.5433,-0.0077),
    ('waitrose-highbury','Waitrose','Waitrose Highbury Corner','Highbury Corner, Islington',51.546,-0.1036),
    ('waitrose-dulwich','Waitrose','Waitrose East Dulwich','Lordship Lane, East Dulwich',51.4566,-0.0757),
    ('waitrose-richmond','Waitrose','Waitrose Richmond','Sheen Road, Richmond',51.4613,-0.3035),
    ('waitrose-westfield-white-city','Waitrose','Waitrose White City','Westfield London, White City',51.5076,-0.2219),
    ('morrisons-camden','Morrisons','Morrisons Camden','Camden Goods Yard, Chalk Farm Road',51.5417,-0.148),
    ('morrisons-peckham','Morrisons','Morrisons Peckham','Aylesham Centre, Rye Lane',51.4716,-0.0692),
    ('morrisons-holloway','Morrisons','Morrisons Holloway','Seven Sisters Road, Holloway',51.5594,-0.1165),
    ('morrisons-stratford','Morrisons','Morrisons Stratford','The Grove, Stratford',51.5421,0.0013),
    ('morrisons-acton','Morrisons','Morrisons Acton','King Street, Acton',51.5085,-0.2675),
    ('morrisons-chingford','Morrisons','Morrisons Chingford','South Chingford',51.6072,-0.0178),
    ('morrisons-erith','Morrisons','Morrisons Erith','James Watt Way, Erith',51.4805,0.1748),
    ('morrisons-wimbledon','Morrisons','Morrisons Wimbledon','The Broadway, Wimbledon',51.4204,-0.2047)
) AS s(id,brand,name,address,lat,lng)
WHERE NOT EXISTS (SELECT 1 FROM public.stores WHERE id = s.id)
;

-- Enable Row Level Security for logs to allow fine-grained policies
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Allow anon selects on logs (so public map can read recent logs)
-- IMPORTANT: review this policy in production and restrict as needed
CREATE POLICY "allow_anon_select_logs" ON public.logs FOR SELECT USING (true);

-- Allow anon inserts into logs. In a production system, constrain this policy (e.g., rate limits, required fields)
CREATE POLICY "allow_anon_insert_logs" ON public.logs FOR INSERT WITH CHECK (true);

COMMIT;
