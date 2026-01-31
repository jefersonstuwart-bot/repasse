import { Sparkles, ArrowRight, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMatches } from "@/hooks/useMatches";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

export function RecentMatches() {
  const { data: matches, isLoading } = useMatches();

  const recentMatches = matches?.slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-3 w-48" />
            </div>
          </div>
        </div>
        <div className="divide-y">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1 h-4 w-56" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Matches Recentes</h3>
            <p className="text-xs text-muted-foreground">Oportunidades encontradas automaticamente</p>
          </div>
        </div>
        <Link to="/matches">
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="divide-y">
        {recentMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum match encontrado ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Cadastre imóveis e clientes para encontrar oportunidades
            </p>
          </div>
        ) : (
          recentMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground truncate">
                    {match.client?.name}
                  </p>
                  <span className="match-badge text-xs">
                    {match.match_score}% match
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {match.property?.type ? PROPERTY_TYPE_LABELS[match.property.type as keyof typeof PROPERTY_TYPE_LABELS] : ''} • {match.property?.street}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.property?.region} • {formatDistanceToNow(new Date(match.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>

              <Link to="/matches">
                <Button variant="outline" size="sm" className="shrink-0">
                  Ver detalhes
                </Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
