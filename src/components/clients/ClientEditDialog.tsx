import { useState, useEffect } from "react";
import { Save, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { PROPERTY_TYPE_LABELS, REGIONS, ClientType, ClientStatus, PropertyType } from "@/types";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";

interface ClientEditDialogProps {
  client: {
    id: string;
    name: string;
    phone: string;
    type: string;
    max_purchase_value: number | null;
    desired_property_types: string[] | null;
    regions_of_interest: string[] | null;
    has_property_for_transfer: boolean;
    status: string;
    notes: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientEditDialog({ client, open, onOpenChange }: ClientEditDialogProps) {
  const { toast } = useToast();
  const updateClient = useUpdateClient();
  const [customRegion, setCustomRegion] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "" as ClientType,
    max_purchase_value: null as number | null,
    desired_property_types: [] as PropertyType[],
    regions_of_interest: [] as string[],
    has_property_for_transfer: false,
    status: "ativo" as ClientStatus,
    notes: "",
  });

  useEffect(() => {
    if (client && open) {
      setFormData({
        name: client.name,
        phone: client.phone,
        type: client.type as ClientType,
        max_purchase_value: client.max_purchase_value,
        desired_property_types: (client.desired_property_types || []) as PropertyType[],
        regions_of_interest: client.regions_of_interest || [],
        has_property_for_transfer: client.has_property_for_transfer,
        status: client.status as ClientStatus,
        notes: client.notes || "",
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, telefone e tipo do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClient.mutateAsync({
        id: client.id,
        ...formData,
        notes: formData.notes || null,
      });

      toast({
        title: "Cliente atualizado!",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente.",
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
    if (region === "Outro") return; // Don't toggle "Outro", just show input
    setFormData((prev) => ({
      ...prev,
      regions_of_interest: prev.regions_of_interest.includes(region)
        ? prev.regions_of_interest.filter((r) => r !== region)
        : [...prev.regions_of_interest, region],
    }));
  };

  const addCustomRegion = () => {
    if (!customRegion.trim()) return;
    if (formData.regions_of_interest.includes(customRegion.trim())) {
      toast({ title: "Região já adicionada", variant: "destructive" });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      regions_of_interest: [...prev.regions_of_interest, customRegion.trim()],
    }));
    setCustomRegion("");
  };

  const removeRegion = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions_of_interest: prev.regions_of_interest.filter((r) => r !== region),
    }));
  };

  const isBuyer = formData.type === "comprador" || formData.type === "comprador_vendedor";

  // Separate predefined regions from custom ones
  const predefinedRegions = REGIONS.filter(r => r !== "Outro");
  const customRegions = formData.regions_of_interest.filter(r => !predefinedRegions.includes(r));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Cliente *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ClientType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprador">Comprador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="comprador_vendedor">Comprador + Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
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
            <div className="space-y-4">
              <h3 className="font-semibold">Preferências de Compra</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-max-value">Valor Máximo</Label>
                <CurrencyInput
                  id="edit-max-value"
                  value={formData.max_purchase_value}
                  onChange={(value) => setFormData({ ...formData, max_purchase_value: value })}
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipos de Imóvel</Label>
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

              <div className="space-y-2">
                <Label>Regiões de Interesse</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedRegions.map((region) => (
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

                {/* Custom Regions Display */}
                {customRegions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customRegions.map((region) => (
                      <Badge
                        key={region}
                        variant="default"
                        className="gap-1 bg-secondary text-secondary-foreground"
                      >
                        {region}
                        <button
                          type="button"
                          onClick={() => removeRegion(region)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Custom Region */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Adicionar outra região..."
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRegion();
                      }
                    }}
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomRegion}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Property */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="font-medium">Possui imóvel para repasse?</p>
              <p className="text-sm text-muted-foreground">Marque se o cliente tem um imóvel para vender</p>
            </div>
            <Switch
              checked={formData.has_property_for_transfer}
              onCheckedChange={(checked) => setFormData({ ...formData, has_property_for_transfer: checked })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2" disabled={updateClient.isPending}>
              <Save className="h-4 w-4" />
              {updateClient.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
