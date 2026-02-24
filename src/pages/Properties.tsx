import { useState } from "react";
import { Plus, Search, Building2, MapPin, Banknote, MoreVertical, Eye, Edit, Trash2, Phone } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, REGIONS, PropertyStatus } from "@/types";
import vendidoStamp from "@/assets/vendido-stamp.png";
import { useProperties, useDeleteProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { PropertyEditDialog } from "@/components/properties/PropertyEditDialog";

const statusStyles: Record<PropertyStatus, string> = {
  disponivel: "status-available",
  negociacao: "status-negotiating",
  vendido: "status-sold",
};

export default function Properties() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: properties, isLoading } = useProperties();
  const deleteProperty = useDeleteProperty();
  const { toast } = useToast();

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setEditDialogOpen(true);
  };

  const filteredProperties = (properties ?? []).filter((property) => {
    const matchesSearch =
      property.street.toLowerCase().includes(search.toLowerCase()) ||
      (property.owner_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (property.neighborhood?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesRegion = regionFilter === "all" || property.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty.mutateAsync(id);
      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout title="Imóveis" subtitle="Gerencie seus imóveis de repasse">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por endereço, bairro ou proprietário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="negociacao">Em Negociação</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  <SelectItem value="all">Todas regiões</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          <Link to="/imoveis/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Imóvel
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg"
                onClick={() => navigate(`/imoveis/${property.id}`)}
              >
                {/* Image / Video Cover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {property.photos && property.photos.length > 0 ? (
                    <img 
                      src={property.photos[0]} 
                      alt={property.street}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : property.videos && property.videos.length > 0 ? (
                    <video 
                      src={property.videos[0]} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      muted
                      playsInline
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const el = e.target as HTMLVideoElement;
                        el.pause();
                        el.currentTime = 0;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Building2 className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <span className={statusStyles[property.status as PropertyStatus]}>
                      {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3">
                    <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                      {PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS]}
                    </Badge>
                  </div>
                  {property.status === 'vendido' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <img 
                        src={vendidoStamp} 
                        alt="Vendido" 
                        className="w-3/4 max-w-[280px] object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground line-clamp-1">
                        {property.street}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {property.neighborhood}, {property.city}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {property.region}
                      </Badge>
                    </div>

                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => navigate(`/imoveis/${property.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(property); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(property.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Values */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Repasse</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(Number(property.transfer_value))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parcela</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {property.monthly_payment ? formatCurrency(Number(property.monthly_payment)) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Banknote className="h-4 w-4" />
                      <span>{property.bank_constructor || "-"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{property.owner_name || "-"}</span>
                      {property.owner_phone && (
                        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{property.owner_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum imóvel encontrado</h3>
            <p className="mt-1 text-muted-foreground">
              Tente ajustar os filtros ou cadastre um novo imóvel
            </p>
            <Link to="/imoveis/novo" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Imóvel
              </Button>
            </Link>
          </div>
        )}

        <PropertyEditDialog 
          property={editingProperty} 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
        />
      </div>
    </AppLayout>
  );
}
