import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROPERTY_TYPE_LABELS, BANKS_CONSTRUCTORS, PropertyType, PropertyStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCreateProperty } from "@/hooks/useProperties";

export default function NewProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProperty = useCreateProperty();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.type || !formData.street || !formData.region || !formData.transfer_value) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha tipo, endereço, região e valor do repasse.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProperty.mutateAsync({
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
        photos: photos,
      });

      toast({
        title: "Imóvel cadastrado!",
        description: "O imóvel foi cadastrado com sucesso. Buscando matches...",
      });
      
      navigate("/imoveis");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o imóvel.",
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
  };

  return (
    <AppLayout title="Novo Imóvel" subtitle="Cadastre um novo imóvel de repasse">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Property Type & Status */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Informações do Imóvel
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo do Imóvel *</Label>
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
              <Label htmlFor="status">Status</Label>
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
        </div>

        {/* Address */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Endereço</h2>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Rua e Número *</Label>
              <Input
                id="street"
                placeholder="Ex: Rua das Flores, 123"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Ex: Centro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região *</Label>
                <Input
                  id="region"
                  placeholder="Ex: CIC, Tatuquara, Sítio Cercado..."
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Valores</h2>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="transfer_value">Valor do Repasse (Ato) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="transfer_value"
                  type="number"
                  placeholder="25000"
                  className="pl-10"
                  value={formData.transfer_value}
                  onChange={(e) => setFormData({ ...formData, transfer_value: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_payment">Valor da Parcela</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="monthly_payment"
                  type="number"
                  placeholder="850"
                  className="pl-10"
                  value={formData.monthly_payment}
                  onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outstanding_balance">Saldo Devedor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="outstanding_balance"
                  type="number"
                  placeholder="180000"
                  className="pl-10"
                  value={formData.outstanding_balance}
                  onChange={(e) => setFormData({ ...formData, outstanding_balance: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="bank_constructor">Banco / Construtora</Label>
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
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Proprietário</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Nome do Proprietário</Label>
              <Input
                id="owner_name"
                placeholder="Nome completo"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_phone">Telefone / WhatsApp</Label>
              <Input
                id="owner_phone"
                placeholder="(41) 99999-9999"
                value={formData.owner_phone}
                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Fotos</h2>
          
          <div className="grid gap-4 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <img src={photo} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-primary/5">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Adicionar foto</span>
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
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Observações</h2>
          <Textarea
            placeholder="Informações adicionais sobre o imóvel..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={createProperty.isPending}>
            <Save className="h-4 w-4" />
            {createProperty.isPending ? "Salvando..." : "Cadastrar Imóvel"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
