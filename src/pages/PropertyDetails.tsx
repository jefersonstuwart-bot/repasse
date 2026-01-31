import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Banknote, 
  Phone, 
  User, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar
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
import { useProperty, useDeleteProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { PropertyEditDialog } from "@/components/properties/PropertyEditDialog";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PropertyStatus } from "@/types";

const statusStyles: Record<PropertyStatus, string> = {
  disponivel: "status-available",
  negociacao: "status-negotiating",
  vendido: "status-sold",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: property, isLoading } = useProperty(id || "");
  const deleteProperty = useDeleteProperty();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleDelete = async () => {
    if (!property) return;
    
    try {
      await deleteProperty.mutateAsync(property.id);
      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi excluído com sucesso.",
      });
      navigate("/imoveis");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive",
      });
    }
  };

  const nextPhoto = () => {
    if (property?.photos && property.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === property.photos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (property?.photos && property.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? property.photos!.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Carregando..." subtitle="">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout title="Imóvel não encontrado" subtitle="">
        <div className="flex flex-col items-center justify-center py-16">
          <Building2 className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">Imóvel não encontrado</h2>
          <p className="mt-2 text-muted-foreground">O imóvel que você procura não existe ou foi removido.</p>
          <Link to="/imoveis" className="mt-4">
            <Button>Voltar para Imóveis</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const photos = property.photos || [];

  return (
    <AppLayout 
      title={property.street} 
      subtitle={`${property.neighborhood || ""}, ${property.city} - ${property.state}`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/imoveis")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setEditDialogOpen(true)}
            >
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
                    Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="relative overflow-hidden rounded-xl bg-muted">
          <div className="aspect-[16/9] relative">
            {photos.length > 0 ? (
              <>
                <img 
                  src={photos[currentPhotoIndex]} 
                  alt={`Foto ${currentPhotoIndex + 1}`}
                  className="h-full w-full object-cover"
                />
                
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            index === currentPhotoIndex 
                              ? "bg-primary" 
                              : "bg-background/60 hover:bg-background"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Building2 className="h-24 w-24 text-primary/30" />
              </div>
            )}
          </div>

          {/* Status & Type Badges */}
          <div className="absolute left-4 top-4 flex gap-2">
            <span className={statusStyles[property.status as PropertyStatus]}>
              {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
            </span>
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS]}
            </Badge>
          </div>

          {/* Photo Counter */}
          {photos.length > 0 && (
            <div className="absolute right-4 top-4">
              <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                {currentPhotoIndex + 1} / {photos.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Photo Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentPhotoIndex 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img 
                  src={photo} 
                  alt={`Miniatura ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Values Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Banknote className="h-5 w-5 text-primary" />
              Valores
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor do Repasse</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(property.transfer_value))}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parcela</p>
                  <p className="text-lg font-semibold">
                    {property.monthly_payment 
                      ? formatCurrency(Number(property.monthly_payment)) 
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Devedor</p>
                  <p className="text-lg font-semibold">
                    {property.outstanding_balance 
                      ? formatCurrency(Number(property.outstanding_balance)) 
                      : "-"}
                  </p>
                </div>
              </div>
              
              {property.bank_constructor && (
                <div>
                  <p className="text-sm text-muted-foreground">Banco / Construtora</p>
                  <p className="font-medium">{property.bank_constructor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Localização
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{property.street}</p>
              </div>
              
              {property.neighborhood && (
                <div>
                  <p className="text-sm text-muted-foreground">Bairro</p>
                  <p className="font-medium">{property.neighborhood}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Cidade / Estado</p>
                <p className="font-medium">{property.city} - {property.state}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Região</p>
                <Badge variant="outline">{property.region}</Badge>
              </div>
            </div>
          </div>

          {/* Owner Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              Proprietário
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{property.owner_name || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                {property.owner_phone ? (
                  <a 
                    href={`https://wa.me/55${property.owner_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {property.owner_phone}
                  </a>
                ) : (
                  <p className="font-medium">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Meta */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Notes Card */}
          {property.notes && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Observações
              </h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{property.notes}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              Informações
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(property.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="font-medium">{formatDate(property.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PropertyEditDialog 
        property={property} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
    </AppLayout>
  );
}
