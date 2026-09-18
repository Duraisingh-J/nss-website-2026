-- ====================================================================
-- NSS MIT Web Application - Events Table Migration
-- ====================================================================
-- Ensures all columns required by the NSS Admin CMS Events module exist.
-- Safe to execute against existing Supabase databases without breaking.

-- 1. Ensure events table exists
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'event',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME DEFAULT '10:00:00',
  end_time TIME DEFAULT '13:00:00',
  location TEXT DEFAULT 'NSS Campus',
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN NOT NULL DEFAULT false,
  cover_media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
  organizer TEXT DEFAULT 'NSS Unit',
  registration_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  max_participants INTEGER,
  additional_information TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add columns if events table existed prior without these specific fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
    ALTER TABLE public.events ADD COLUMN start_time TIME DEFAULT '10:00:00';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
    ALTER TABLE public.events ADD COLUMN end_time TIME DEFAULT '13:00:00';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE public.events ADD COLUMN location TEXT DEFAULT 'NSS Campus';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status') THEN
    ALTER TABLE public.events ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer') THEN
    ALTER TABLE public.events ADD COLUMN organizer TEXT DEFAULT 'NSS Unit';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_url') THEN
    ALTER TABLE public.events ADD COLUMN registration_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'contact_email') THEN
    ALTER TABLE public.events ADD COLUMN contact_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'contact_phone') THEN
    ALTER TABLE public.events ADD COLUMN contact_phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_participants') THEN
    ALTER TABLE public.events ADD COLUMN max_participants INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'additional_information') THEN
    ALTER TABLE public.events ADD COLUMN additional_information TEXT;
  END IF;
END $$;

-- 3. Row Level Security Policies for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY "Public Read Published Events" ON public.events
  FOR SELECT USING (is_published = true OR status = 'published');

-- Admins can do all CRUD operations on events
CREATE POLICY "Admin Full Access Events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
