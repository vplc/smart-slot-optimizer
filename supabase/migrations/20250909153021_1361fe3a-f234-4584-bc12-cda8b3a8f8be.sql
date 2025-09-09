-- Create custom types
CREATE TYPE appointment_status AS ENUM ('booked', 'showed', 'no_show', 'cancel');
CREATE TYPE appointment_source AS ENUM ('google', 'calendly', 'manual');
CREATE TYPE reminder_variant AS ENUM ('T-24', 'T-6', 'T-2');

-- Create users profile table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  business_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  phone TEXT,
  twilio_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  consent_sms BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  external_id TEXT, -- for calendar sync
  title TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  service_type TEXT,
  price DECIMAL(10,2),
  status appointment_status DEFAULT 'booked',
  source appointment_source DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create slot features table for optimization
CREATE TABLE public.slot_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_start TIMESTAMP WITH TIME ZONE NOT NULL,
  day_of_week INTEGER, -- 0-6
  hour_of_day INTEGER, -- 0-23
  lead_hours INTEGER, -- hours between booking and appointment
  base_price DECIMAL(10,2),
  weather_temp REAL,
  weather_precip REAL,
  traffic_index REAL,
  is_school_break BOOLEAN DEFAULT false,
  is_holiday BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  variant reminder_variant NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered BOOLEAN DEFAULT false,
  cost_cents INTEGER DEFAULT 0,
  link_clicked BOOLEAN DEFAULT false,
  message_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create model parameters table
CREATE TABLE public.model_params (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  beta_coefficients JSONB,
  sigma_u REAL DEFAULT 0.5,
  sigma_v REAL DEFAULT 0.3,
  baseline_show_prob REAL DEFAULT 0.8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business settings table
CREATE TABLE public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 1, -- number of service providers
  revenue_per_appointment DECIMAL(10,2) DEFAULT 80.00,
  overtime_cost DECIMAL(10,2) DEFAULT 40.00,
  idle_cost DECIMAL(10,2) DEFAULT 10.00,
  max_wait_time_minutes INTEGER DEFAULT 5,
  max_overbook_per_slot INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for customers
CREATE POLICY "Users can manage own customers" ON public.customers
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for appointments
CREATE POLICY "Users can manage own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for slot_features
CREATE POLICY "Users can manage own slot features" ON public.slot_features
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for reminders
CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.id = reminders.appointment_id 
      AND appointments.user_id = auth.uid()
    )
  );

-- Create RLS policies for model_params
CREATE POLICY "Users can manage own model params" ON public.model_params
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for business_settings
CREATE POLICY "Users can manage own business settings" ON public.business_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_starts_at ON public.appointments(starts_at);
CREATE INDEX idx_slot_features_user_id ON public.slot_features(user_id);
CREATE INDEX idx_slot_features_slot_start ON public.slot_features(slot_start);
CREATE INDEX idx_reminders_appointment_id ON public.reminders(appointment_id);