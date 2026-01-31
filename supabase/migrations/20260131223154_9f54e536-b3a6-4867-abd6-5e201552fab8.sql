-- RepCRM Database Schema
-- Sistema de Gestão de Repasse Imobiliário

-- Create ENUM types for better data integrity
CREATE TYPE public.property_type AS ENUM ('apartamento', 'casa', 'garden', 'sobrado', 'sitio');
CREATE TYPE public.property_status AS ENUM ('disponivel', 'negociacao', 'vendido');
CREATE TYPE public.client_type AS ENUM ('comprador', 'vendedor', 'comprador_vendedor');
CREATE TYPE public.client_status AS ENUM ('ativo', 'negociacao', 'fechado');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type public.property_type NOT NULL,
  street TEXT NOT NULL,
  neighborhood TEXT,
  city TEXT NOT NULL DEFAULT 'Curitiba',
  state TEXT NOT NULL DEFAULT 'PR',
  region TEXT NOT NULL,
  transfer_value NUMERIC(12, 2) NOT NULL,
  monthly_payment NUMERIC(12, 2),
  outstanding_balance NUMERIC(12, 2),
  bank_constructor TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  status public.property_status NOT NULL DEFAULT 'disponivel',
  notes TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  type public.client_type NOT NULL,
  max_purchase_value NUMERIC(12, 2),
  desired_property_types public.property_type[] DEFAULT ARRAY[]::public.property_type[],
  regions_of_interest TEXT[] DEFAULT ARRAY[]::TEXT[],
  has_property_for_transfer BOOLEAN NOT NULL DEFAULT false,
  status public.client_status NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for automatic matching
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  is_viewed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, property_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for properties
CREATE POLICY "Users can view their own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.matches FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_region ON public.properties(region);
CREATE INDEX idx_properties_type ON public.properties(type);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_type ON public.clients(type);

CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_client_id ON public.matches(client_id);
CREATE INDEX idx_matches_property_id ON public.matches(property_id);
CREATE INDEX idx_matches_is_viewed ON public.matches(is_viewed);

-- Function to calculate match score between client and property
CREATE OR REPLACE FUNCTION public.calculate_match_score(
  p_client_id UUID,
  p_property_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_property public.properties%ROWTYPE;
  v_score INTEGER := 0;
BEGIN
  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id;
  SELECT * INTO v_property FROM public.properties WHERE id = p_property_id;
  
  -- Check if client is a buyer
  IF v_client.type NOT IN ('comprador', 'comprador_vendedor') THEN
    RETURN 0;
  END IF;
  
  -- Check if property is available
  IF v_property.status = 'vendido' THEN
    RETURN 0;
  END IF;
  
  -- Region match (40 points)
  IF v_property.region = ANY(v_client.regions_of_interest) THEN
    v_score := v_score + 40;
  END IF;
  
  -- Property type match (30 points)
  IF v_property.type = ANY(v_client.desired_property_types) THEN
    v_score := v_score + 30;
  END IF;
  
  -- Value match (30 points)
  IF v_client.max_purchase_value IS NOT NULL AND 
     v_property.transfer_value <= v_client.max_purchase_value THEN
    v_score := v_score + 30;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate matches for a new property
CREATE OR REPLACE FUNCTION public.generate_matches_for_property()
RETURNS TRIGGER AS $$
DECLARE
  v_client RECORD;
  v_score INTEGER;
BEGIN
  -- Only generate matches for available properties
  IF NEW.status != 'disponivel' THEN
    RETURN NEW;
  END IF;
  
  -- Find all buying clients for this user
  FOR v_client IN 
    SELECT * FROM public.clients 
    WHERE user_id = NEW.user_id 
    AND type IN ('comprador', 'comprador_vendedor')
    AND status = 'ativo'
  LOOP
    v_score := public.calculate_match_score(v_client.id, NEW.id);
    
    IF v_score >= 30 THEN
      INSERT INTO public.matches (user_id, client_id, property_id, match_score)
      VALUES (NEW.user_id, v_client.id, NEW.id, v_score)
      ON CONFLICT (client_id, property_id) 
      DO UPDATE SET match_score = EXCLUDED.match_score;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate matches for a new client
CREATE OR REPLACE FUNCTION public.generate_matches_for_client()
RETURNS TRIGGER AS $$
DECLARE
  v_property RECORD;
  v_score INTEGER;
BEGIN
  -- Only generate matches for buying clients
  IF NEW.type NOT IN ('comprador', 'comprador_vendedor') THEN
    RETURN NEW;
  END IF;
  
  -- Only generate matches for active clients
  IF NEW.status != 'ativo' THEN
    RETURN NEW;
  END IF;
  
  -- Find all available properties for this user
  FOR v_property IN 
    SELECT * FROM public.properties 
    WHERE user_id = NEW.user_id 
    AND status = 'disponivel'
  LOOP
    v_score := public.calculate_match_score(NEW.id, v_property.id);
    
    IF v_score >= 30 THEN
      INSERT INTO public.matches (user_id, client_id, property_id, match_score)
      VALUES (NEW.user_id, NEW.id, v_property.id, v_score)
      ON CONFLICT (client_id, property_id) 
      DO UPDATE SET match_score = EXCLUDED.match_score;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic match generation
CREATE TRIGGER generate_matches_on_property_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.generate_matches_for_property();

CREATE TRIGGER generate_matches_on_property_update
  AFTER UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.generate_matches_for_property();

CREATE TRIGGER generate_matches_on_client_insert
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.generate_matches_for_client();

CREATE TRIGGER generate_matches_on_client_update
  AFTER UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.generate_matches_for_client();