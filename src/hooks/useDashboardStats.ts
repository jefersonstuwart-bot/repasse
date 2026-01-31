import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  totalProperties: number;
  totalClients: number;
  propertiesInNegotiation: number;
  activeMatches: number;
  newMatchesToday: number;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Get total properties count
      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .neq("status", "vendido");

      // Get properties in negotiation
      const { count: propertiesInNegotiation } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "negociacao");

      // Get total active clients
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .neq("status", "fechado");

      // Get active matches
      const { count: activeMatches } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get new matches today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newMatchesToday } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      return {
        totalProperties: totalProperties ?? 0,
        totalClients: totalClients ?? 0,
        propertiesInNegotiation: propertiesInNegotiation ?? 0,
        activeMatches: activeMatches ?? 0,
        newMatchesToday: newMatchesToday ?? 0,
      };
    },
    enabled: !!user,
  });
}
