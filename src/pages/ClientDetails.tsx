import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Home, 
  DollarSign, 
  Edit, 
  Trash2, 
  MessageCircle,
  RefreshCcw,
  FileText
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClient, useDeleteClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { 
  CLIENT_TYPE_LABELS, 
  CLIENT_STATUS_LABELS, 
  PROPERTY_TYPE_LABELS, 
  ClientStatus 
} from "@/types";
import { cn } from "@/lib/utils";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";

const statusStyles: Record<ClientStatus, string> = {
  ativo: "status-available",
  negociacao: "status-negotiating",
  fechado: "status-sold",
};

const typeStyles = {
  comprador: "bg-success/10 text-success border-success/20",
  vendedor: "bg-warning/10 text-warning border-warning/20",
  comprador_vendedor: "bg-primary/10 text-primary border-primary/20",
};

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: client, isLoading } = useClient(id || "");
  const deleteClient = useDeleteClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteClient.mutateAsync(id);
      toast({ title: "Cliente excluído", description: "O cliente foi excluído com sucesso." });
      navigate("/clientes");
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir o cliente.", variant: "destructive" });
    }
  };

  const openWhatsApp = () => {
    if (!client?.phone) return;
    const phone = client.phone.replace(/\D/g, "");
    const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${phoneWithCountry}`, "_blank");
  };

  if (isLoading) {
    return (
      <AppLayout title="Detalhes do Cliente" subtitle="Carregando...">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout title="Cliente não encontrado" subtitle="">
        <div className="flex flex-col items-center justify-center py-16">
          <User className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Cliente não encontrado</h3>
          <p className="mt-1 text-muted-foreground">O cliente solicitado não existe ou foi removido.</p>
          <Button className="mt-4" onClick={() => navigate("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isBuyer = client.type === "comprador" || client.type === "comprador_vendedor";

  return (
    <AppLayout title="Detalhes do Cliente" subtitle={client.name}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <Badge variant="outline" className={cn("text-sm", typeStyles[client.type as keyof typeof typeStyles])}>
                  {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS]}
                </Badge>
                <span className={statusStyles[client.status as ClientStatus]}>
                  {CLIENT_STATUS_LABELS[client.status as keyof typeof CLIENT_STATUS_LABELS]}
                </span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <Button variant="outline" className="gap-2" onClick={openWhatsApp}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <a href={`tel:${client.phone}`} className="inline-flex">
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Ligar
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Phone className="h-5 w-5 text-primary" />
            Contato
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Telefone / WhatsApp</p>
              <p className="mt-1 font-medium">{client.phone}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Cadastrado em</p>
              <p className="mt-1 font-medium">
                {new Date(client.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Preferences */}
        {isBuyer && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5 text-primary" />
              Preferências de Compra
            </h2>
            <div className="space-y-4">
              {client.max_purchase_value && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-4">
                  <DollarSign className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Máximo</p>
                    <p className="text-lg font-semibold text-success">
                      {formatCurrency(Number(client.max_purchase_value))}
                    </p>
                  </div>
                </div>
              )}
              
              {client.desired_property_types && client.desired_property_types.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Tipos de Imóvel Desejados</p>
                  <div className="flex flex-wrap gap-2">
                    {client.desired_property_types.map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-sm">
                        {PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {client.regions_of_interest && client.regions_of_interest.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Regiões de Interesse</p>
                  <div className="flex flex-wrap gap-2">
                    {client.regions_of_interest.map((region: string) => (
                      <Badge key={region} variant="outline" className="gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfer Property Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <RefreshCcw className="h-5 w-5 text-primary" />
            Imóvel para Repasse
          </h2>
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-4">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              client.has_property_for_transfer 
                ? "bg-success/10 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {client.has_property_for_transfer 
                  ? "Sim, possui imóvel para repasse" 
                  : "Não possui imóvel para repasse"}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.has_property_for_transfer 
                  ? "O cliente tem um imóvel disponível para transferência" 
                  : "Cliente não tem imóvel para vender"}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Observações
            </h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <ClientEditDialog
        client={client}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </AppLayout>
  );
}
