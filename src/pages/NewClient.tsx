import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS, REGIONS, ClientType, ClientStatus, PropertyType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCreateClient } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NewClient() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createClient = useCreateClient();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "" as ClientType | "",
    max_purchase_value: "",
    desired_property_types: [] as PropertyType[],
    regions_of_interest: [] as string[],
    has_property_for_transfer: false,
    status: "ativo" as ClientStatus,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, telefone e tipo do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClient.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        type: formData.type as ClientType,
        max_purchase_value: formData.max_purchase_value ? parseFloat(formData.max_purchase_value) : null,
        desired_property_types: formData.desired_property_types,
        regions_of_interest: formData.regions_of_interest,
        has_property_for_transfer: formData.has_property_for_transfer,
        status: formData.status,
        notes: formData.notes || null,
      });

      toast({
        title: "Cliente cadastrado!",
        description: "O cliente foi cadastrado com sucesso. Buscando matches...",
      });
      
      navigate("/clientes");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    }
  };

  const togglePropertyType = (type: PropertyType) => {
    setFormData((prev) => ({
      ...prev,
      desired_property_types: prev.desired_property_types.includes(type)
        ? prev.desired_property_types.filter((t) => t !== type)
        : [...prev.desired_property_types, type],
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions_of_interest: prev.regions_of_interest.includes(region)
        ? prev.regions_of_interest.filter((r) => r !== region)
        : [...prev.regions_of_interest, region],
    }));
  };

  const isBuyer = formData.type === "comprador" || formData.type === "comprador_vendedor";

  return (
    <AppLayout title="Novo Cliente" subtitle="Cadastre um novo cliente">
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

        {/* Basic Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-primary" />
            Informações Básicas
          </h2>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Nome do cliente"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="(41) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ClientType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprador">Comprador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="comprador_vendedor">Comprador + Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ClientStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="negociacao">Em Negociação</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Buyer Preferences */}
        {isBuyer && (
          <div className="animate-slide-in rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Preferências de Compra</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max_purchase_value">Valor Máximo para Compra</Label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="max_purchase_value"
                    type="number"
                    placeholder="40000"
                    className="pl-10"
                    value={formData.max_purchase_value}
                    onChange={(e) => setFormData({ ...formData, max_purchase_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tipos de Imóvel Desejados</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <Badge
                      key={value}
                      variant={formData.desired_property_types.includes(value as PropertyType) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.desired_property_types.includes(value as PropertyType)
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:bg-muted"
                      )}
                      onClick={() => togglePropertyType(value as PropertyType)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Regiões de Interesse</Label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <Badge
                      key={region}
                      variant={formData.regions_of_interest.includes(region) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.regions_of_interest.includes(region)
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleRegion(region)}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seller Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Informações de Venda</h2>
          
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="font-medium">Possui imóvel para repasse?</p>
              <p className="text-sm text-muted-foreground">
                Marque se o cliente tem um imóvel para vender
              </p>
            </div>
            <Switch
              checked={formData.has_property_for_transfer}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, has_property_for_transfer: checked })
              }
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Observações</h2>
          <Textarea
            placeholder="Informações adicionais sobre o cliente..."
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
          <Button type="submit" className="gap-2" disabled={createClient.isPending}>
            <Save className="h-4 w-4" />
            {createClient.isPending ? "Salvando..." : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
