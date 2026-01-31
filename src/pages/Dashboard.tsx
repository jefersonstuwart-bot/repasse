import { Building2, Users, Handshake, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentMatches } from "@/components/dashboard/RecentMatches";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do seu negócio">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Imóveis Ativos"
                value={stats?.totalProperties ?? 0}
                subtitle="Disponíveis e em negociação"
                icon={Building2}
                variant="primary"
              />
              <StatCard
                title="Clientes Ativos"
                value={stats?.totalClients ?? 0}
                subtitle="Compradores e vendedores"
                icon={Users}
                variant="success"
              />
              <StatCard
                title="Em Negociação"
                value={stats?.propertiesInNegotiation ?? 0}
                subtitle="Imóveis com propostas"
                icon={Handshake}
                variant="default"
              />
              <StatCard
                title="Matches Ativos"
                value={stats?.activeMatches ?? 0}
                subtitle={`${stats?.newMatchesToday ?? 0} novos hoje`}
                icon={Sparkles}
                variant="accent"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Ações Rápidas</h2>
          <QuickActions />
        </div>

        {/* Recent Matches */}
        <RecentMatches />
      </div>
    </AppLayout>
  );
}
