-- Drop and recreate the match score calculation function
-- New logic: Match only if region matches AND value is within R$7,000 tolerance
CREATE OR REPLACE FUNCTION public.calculate_match_score(p_client_id uuid, p_property_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client public.clients%ROWTYPE;
  v_property public.properties%ROWTYPE;
  v_score INTEGER := 0;
  v_value_tolerance NUMERIC := 7000; -- R$7.000 tolerance
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
  
  -- Region MUST match (50 points)
  IF NOT (v_property.region = ANY(v_client.regions_of_interest)) THEN
    RETURN 0; -- No match if region doesn't match
  END IF;
  v_score := v_score + 50;
  
  -- Value MUST be within tolerance (50 points)
  -- Property value must be <= client max value + tolerance
  IF v_client.max_purchase_value IS NOT NULL THEN
    IF v_property.transfer_value <= (v_client.max_purchase_value + v_value_tolerance) THEN
      v_score := v_score + 50;
    ELSE
      RETURN 0; -- No match if value exceeds tolerance
    END IF;
  ELSE
    -- If client has no max value set, still give points for region match
    v_score := v_score + 50;
  END IF;
  
  RETURN v_score;
END;
$$;

-- Update the trigger function to use the new scoring
-- Only create matches with score >= 100 (both region AND value must match)
CREATE OR REPLACE FUNCTION public.generate_matches_for_property()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Only create match if score is 100 (both criteria met)
    IF v_score >= 100 THEN
      INSERT INTO public.matches (user_id, client_id, property_id, match_score)
      VALUES (NEW.user_id, v_client.id, NEW.id, v_score)
      ON CONFLICT (client_id, property_id) 
      DO UPDATE SET match_score = EXCLUDED.match_score;
    ELSE
      -- Remove existing match if criteria no longer met
      DELETE FROM public.matches 
      WHERE client_id = v_client.id AND property_id = NEW.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Update the client trigger as well
CREATE OR REPLACE FUNCTION public.generate_matches_for_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Only create match if score is 100 (both criteria met)
    IF v_score >= 100 THEN
      INSERT INTO public.matches (user_id, client_id, property_id, match_score)
      VALUES (NEW.user_id, NEW.id, v_property.id, v_score)
      ON CONFLICT (client_id, property_id) 
      DO UPDATE SET match_score = EXCLUDED.match_score;
    ELSE
      -- Remove existing match if criteria no longer met
      DELETE FROM public.matches 
      WHERE client_id = NEW.id AND property_id = v_property.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;