import { useState, useEffect } from "react";
import { Save, Building2, X, Upload, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PROPERTY_TYPE_LABELS, BANKS_CONSTRUCTORS, PropertyType, PropertyStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProperty } from "@/hooks/useProperties";

interface PropertyEditDialogProps {
  property: {
    id: string;
    type: string;
    street: string;
    neighborhood: string | null;
    city: string;
    state: string;
    region: string;
    transfer_value: number;
    monthly_payment: number | null;
    outstanding_balance: number | null;
    bank_constructor: string | null;
    owner_name: string | null;
    owner_phone: string | null;
    status: string;
    notes: string | null;
    photos: string[] | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyEditDialog({ property, open, onOpenChange }: PropertyEditDialogProps) {
  const { toast } = useToast();
  const updateProperty = useUpdateProperty();
  
  const [formData, setFormData] = useState({
    type: "" as PropertyType | "",
    street: "",
    neighborhood: "",
    city: "Curitiba",
    state: "PR",
    region: "",
    transfer_value: "",
    monthly_payment: "",
    outstanding_balance: "",
    bank_constructor: "",
    owner_name: "",
    owner_phone: "",
    status: "disponivel" as PropertyStatus,
    notes: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  useEffect(() => {
    if (property) {
      setFormData({
        type: property.type as PropertyType,
        street: property.street,
        neighborhood: property.neighborhood || "",
        city: property.city,
        state: property.state,
        region: property.region,
        transfer_value: String(property.transfer_value),
        monthly_payment: property.monthly_payment ? String(property.monthly_payment) : "",
        outstanding_balance: property.outstanding_balance ? String(property.outstanding_balance) : "",
        bank_constructor: property.bank_constructor || "",
        owner_name: property.owner_name || "",
        owner_phone: property.owner_phone || "",
        status: property.status as PropertyStatus,
        notes: property.notes || "",
      });
      setPhotos(property.photos || []);
      setCoverIndex(0);
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!property) return;

    if (!formData.type || !formData.street || !formData.region || !formData.transfer_value) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha tipo, endereço, região e valor do repasse.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Reorganiza as fotos para que a capa seja a primeira
      const reorderedPhotos = [...photos];
      if (coverIndex > 0 && coverIndex < photos.length) {
        const [coverPhoto] = reorderedPhotos.splice(coverIndex, 1);
        reorderedPhotos.unshift(coverPhoto);
      }

      await updateProperty.mutateAsync({
        id: property.id,
        type: formData.type as PropertyType,
        street: formData.street,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        region: formData.region,
        transfer_value: parseFloat(formData.transfer_value),
        monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null,
        outstanding_balance: formData.outstanding_balance ? parseFloat(formData.outstanding_balance) : null,
        bank_constructor: formData.bank_constructor || null,
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        status: formData.status,
        notes: formData.notes || null,
        photos: reorderedPhotos,
      });

      toast({
        title: "Imóvel atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o imóvel.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (index === coverIndex) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const setCover = (index: number) => {
    setCoverIndex(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Editar Imóvel
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type & Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo do Imóvel *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as PropertyType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as PropertyStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="negociacao">Em Negociação</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-street">Rua e Número *</Label>
                <Input
                  id="edit-street"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-neighborhood">Bairro</Label>
                  <Input
                    id="edit-neighborhood"
                    placeholder="Ex: Centro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-region">Região *</Label>
                  <Input
                    id="edit-region"
                    placeholder="Ex: CIC, Tatuquara..."
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Valores</h3>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-transfer_value">Valor do Repasse *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <CurrencyInput
                      id="edit-transfer_value"
                      placeholder="160.000,00"
                      className="pl-10"
                      value={formData.transfer_value}
                      onValueChange={(value) => setFormData({ ...formData, transfer_value: value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-monthly_payment">Parcela</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <CurrencyInput
                      id="edit-monthly_payment"
                      placeholder="850,00"
                      className="pl-10"
                      value={formData.monthly_payment}
                      onValueChange={(value) => setFormData({ ...formData, monthly_payment: value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-outstanding_balance">Saldo Devedor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <CurrencyInput
                      id="edit-outstanding_balance"
                      placeholder="180.000,00"
                      className="pl-10"
                      value={formData.outstanding_balance}
                      onValueChange={(value) => setFormData({ ...formData, outstanding_balance: value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bank_constructor">Banco / Construtora</Label>
                <Select
                  value={formData.bank_constructor}
                  onValueChange={(value) => setFormData({ ...formData, bank_constructor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {BANKS_CONSTRUCTORS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Proprietário</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-owner_name">Nome</Label>
                  <Input
                    id="edit-owner_name"
                    placeholder="Nome completo"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-owner_phone">Telefone</Label>
                  <Input
                    id="edit-owner_phone"
                    placeholder="(41) 99999-9999"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fotos</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique na estrela para definir a foto de capa
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-muted ${
                      index === coverIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    }`}
                  >
                    <img src={photo} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                    
                    {/* Cover badge */}
                    {index === coverIndex && (
                      <div className="absolute left-1 top-1 rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Capa
                      </div>
                    )}
                    
                    {/* Set as cover button */}
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className={`absolute left-1 ${index === coverIndex ? "top-6" : "top-1"} rounded-full p-0.5 transition-colors ${
                        index === coverIndex 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-card/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                      }`}
                      title="Definir como capa"
                    >
                      <Star className={`h-3 w-3 ${index === coverIndex ? "fill-current" : ""}`} />
                    </button>
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                placeholder="Informações adicionais..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2" disabled={updateProperty.isPending}>
                <Save className="h-4 w-4" />
                {updateProperty.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
