import { Sparkles, Building2, User, Check, X, Phone, MapPin, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { useMatches, useUpdateMatchStatus, useDeleteMatch } from "@/hooks/useMatches";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

export default function Matches() {
  const { data: matches, isLoading } = useMatches();
  const updateStatus = useUpdateMatchStatus();
  const deleteMatch = useDeleteMatch();
  const { toast } = useToast();

  const pendingMatches = matches?.filter(m => m.status === 'pending') ?? [];
  const unviewedCount = pendingMatches.filter((m) => !m.is_viewed).length;

  const handleStartNegotiation = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'negotiating' });
    toast({ title: "Negociação iniciada!", description: "O match foi movido para negociação." });
  };

  const handleDiscard = async (id: string) => {
    await deleteMatch.mutateAsync(id);
    toast({ title: "Match descartado", description: "O match foi removido." });
  };

  if (isLoading) {
    return (
      <AppLayout title="Matches" subtitle="Oportunidades de negócio">
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Matches" subtitle="Oportunidades de negócio encontradas automaticamente">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="stat-card flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent"><Sparkles className="h-5 w-5 text-accent-foreground" /></div>
              <div><p className="text-2xl font-bold">{pendingMatches.length}</p><p className="text-sm text-muted-foreground">Matches ativos</p></div>
            </div>
          </div>
          {unviewedCount > 0 && (
            <div className="stat-card flex-1 border-accent/30 bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="relative"><div className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/50" /><div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent"><Sparkles className="h-5 w-5 text-accent-foreground" /></div></div>
                <div><p className="text-2xl font-bold text-accent">{unviewedCount}</p><p className="text-sm text-muted-foreground">Novos matches!</p></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {pendingMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
              <Sparkles className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum match encontrado</h3>
              <p className="mt-1 text-center text-muted-foreground">Cadastre mais imóveis e clientes para encontrar oportunidades</p>
            </div>
          ) : (
            pendingMatches.map((match) => (
              <div key={match.id} className={cn("rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg", !match.is_viewed && "ring-2 ring-accent/50")}>
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("match-badge", match.match_score >= 90 && "bg-success/15 text-success border-success/30")}><Sparkles className="h-3.5 w-3.5" />{match.match_score}% compatível</div>
                    {!match.is_viewed && <Badge className="bg-accent text-accent-foreground">Novo!</Badge>}
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(match.created_at), { addSuffix: true, locale: ptBR })}</span>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"><User className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-semibold">{match.client?.name}</p></div></div>
                    <div className="space-y-2 text-sm"><div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span>{match.client?.phone}</span></div><div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span>Busca em: {match.client?.regions_of_interest?.join(", ")}</span></div></div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white"><Building2 className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">Imóvel</p><p className="font-semibold">{PROPERTY_TYPE_LABELS[match.property?.type as keyof typeof PROPERTY_TYPE_LABELS]}</p></div></div>
                    <div className="space-y-2 text-sm"><p className="text-muted-foreground">{match.property?.street}</p><div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span>{match.property?.neighborhood} • {match.property?.region}</span></div><div className="flex gap-4 pt-1"><div><p className="text-xs text-muted-foreground">Repasse</p><p className="font-bold text-primary">{formatCurrency(Number(match.property?.transfer_value))}</p></div><div><p className="text-xs text-muted-foreground">Parcela</p><p className="font-semibold">{match.property?.monthly_payment ? formatCurrency(Number(match.property.monthly_payment)) : "-"}</p></div></div></div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDiscard(match.id)}><X className="h-4 w-4" />Descartar</Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`https://wa.me/${match.client?.phone?.replace(/\D/g, '')}`, '_blank')}><MessageCircle className="h-4 w-4" />WhatsApp</Button>
                  <Button size="sm" className="gap-1.5" onClick={() => handleStartNegotiation(match.id)}><Check className="h-4 w-4" />Iniciar Negociação</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
