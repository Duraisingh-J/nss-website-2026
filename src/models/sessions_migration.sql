-- ====================================================================
-- NSS MIT Web Application - Sessions Table Migration
-- ====================================================================
-- Ensures all columns required by the NSS Admin CMS Sessions module exist.
-- Safe to execute against existing Supabase databases without breaking.

-- 1. Ensure sessions table exists
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME DEFAULT '10:00:00',
  end_time TIME DEFAULT '11:30:00',
  location TEXT DEFAULT 'NSS Campus',
  session_type TEXT NOT NULL DEFAULT 'activity',
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN NOT NULL DEFAULT false,
  session_lead TEXT,
  speaker TEXT,
  registration_url TEXT,
  max_participants INTEGER,
  additional_information TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add columns if sessions table existed prior without these specific fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'session_type') THEN
    ALTER TABLE public.sessions ADD COLUMN session_type TEXT NOT NULL DEFAULT 'activity';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'status') THEN
    ALTER TABLE public.sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'session_lead') THEN
    ALTER TABLE public.sessions ADD COLUMN session_lead TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'speaker') THEN
    ALTER TABLE public.sessions ADD COLUMN speaker TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'registration_url') THEN
    ALTER TABLE public.sessions ADD COLUMN registration_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'max_participants') THEN
    ALTER TABLE public.sessions ADD COLUMN max_participants INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'additional_information') THEN
    ALTER TABLE public.sessions ADD COLUMN additional_information TEXT;
  END IF;
END $$;

-- 3. Row Level Security Policies for Sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Public can view published sessions
CREATE POLICY "Public Read Published Sessions" ON public.sessions
  FOR SELECT USING (is_published = true OR status = 'published');

-- Admins can do all CRUD operations on sessions
CREATE POLICY "Admin Full Access Sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_sessions_event_id ON public.sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON public.sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_is_published ON public.sessions(is_published);
