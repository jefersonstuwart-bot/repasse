import { useState } from "react";
import { Plus, Search, Users, Phone, MapPin, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS, PROPERTY_TYPE_LABELS, ClientStatus } from "@/types";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();

  const filteredClients = (clients ?? []).filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search);
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesType = typeFilter === "all" || client.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient.mutateAsync(id);
      toast({ title: "Cliente excluído", description: "O cliente foi excluído com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir o cliente.", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Clientes" subtitle="Gerencie seus clientes compradores e vendedores">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="negociacao">Em Negociação</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="comprador">Comprador</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="comprador_vendedor">Comprador + Vendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/clientes/novo"><Button className="gap-2"><Plus className="h-4 w-4" />Novo Cliente</Button></Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md cursor-pointer" onClick={() => navigate(`/clientes/${client.id}`)}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-card-foreground">{client.name}</h3>
                    <Badge variant="outline" className={cn("text-xs", typeStyles[client.type as keyof typeof typeStyles])}>{CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS]}</Badge>
                    <span className={statusStyles[client.status as ClientStatus]}>{CLIENT_STATUS_LABELS[client.status as keyof typeof CLIENT_STATUS_LABELS]}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{client.phone}</span>
                    {client.regions_of_interest && client.regions_of_interest.length > 0 && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{client.regions_of_interest.join(", ")}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {client.max_purchase_value && <Badge variant="secondary" className="text-xs">Até {formatCurrency(Number(client.max_purchase_value))}</Badge>}
                    {client.desired_property_types?.map((type: string) => <Badge key={type} variant="outline" className="text-xs">{PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS]}</Badge>)}
                    {client.has_property_for_transfer && <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">Tem imóvel p/ repasse</Badge>}
                  </div>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${client.id}`); }}><Eye className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                      <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem></AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este cliente?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(client.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-muted-foreground">Tente ajustar os filtros ou cadastre um novo cliente</p>
            <Link to="/clientes/novo" className="mt-4"><Button><Plus className="mr-2 h-4 w-4" />Cadastrar Cliente</Button></Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
