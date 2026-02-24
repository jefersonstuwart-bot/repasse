import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Building2, Star, Loader2, Video } from "lucide-react";
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Progress } from "@/components/ui/progress";
import { PROPERTY_TYPE_LABELS, BANKS_CONSTRUCTORS, PropertyType, PropertyStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCreateProperty } from "@/hooks/useProperties";
import { usePhotoUpload, UploadedPhoto, UploadedVideo } from "@/hooks/usePhotoUpload";

export default function NewProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProperty = useCreateProperty();
  const { uploadPhotos, uploadVideos, isUploading, uploadProgress } = usePhotoUpload();
  
  const [formData, setFormData] = useState({
    type: "" as PropertyType | "",
    street: "",
    neighborhood: "",
    city: "Curitiba",
    state: "PR",
    region: "",
    transfer_value: null as number | null,
    monthly_payment: null as number | null,
    outstanding_balance: null as number | null,
    bank_constructor: "",
    owner_name: "",
    owner_phone: "",
    status: "disponivel" as PropertyStatus,
    notes: "",
  });

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

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
      // Reorganiza as fotos para que a capa seja a primeira
      const reorderedPhotos = [...photos];
      if (coverIndex > 0 && coverIndex < photos.length) {
        const [coverPhoto] = reorderedPhotos.splice(coverIndex, 1);
        reorderedPhotos.unshift(coverPhoto);
      }

      // Upload photos to storage
      let uploadedUrls: string[] = [];
      if (reorderedPhotos.length > 0) {
        toast({
          title: "Enviando fotos...",
          description: "Aguarde enquanto as fotos são enviadas.",
        });
        uploadedUrls = await uploadPhotos(reorderedPhotos);
      }

      // Upload videos to storage
      let uploadedVideoUrls: string[] = [];
      if (videos.length > 0) {
        toast({
          title: "Enviando vídeos...",
          description: "Aguarde enquanto os vídeos são enviados.",
        });
        uploadedVideoUrls = await uploadVideos(videos);
      }

      await createProperty.mutateAsync({
        type: formData.type as PropertyType,
        street: formData.street,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        region: formData.region,
        transfer_value: formData.transfer_value || 0,
        monthly_payment: formData.monthly_payment,
        outstanding_balance: formData.outstanding_balance,
        bank_constructor: formData.bank_constructor || null,
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        status: formData.status,
        notes: formData.notes || null,
        photos: uploadedUrls,
        videos: uploadedVideoUrls,
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
      const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      // Revoke the blob URL to free memory
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    // Ajusta o índice da capa se necessário
    if (index === coverIndex) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const setCover = (index: number) => {
    setCoverIndex(index);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newVideos: UploadedVideo[] = Array.from(files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setVideos((prev) => [...prev, ...newVideos]);
    }
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
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
              <CurrencyInput
                id="transfer_value"
                value={formData.transfer_value}
                onChange={(value) => setFormData({ ...formData, transfer_value: value })}
                className="max-w-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_payment">Valor da Parcela</Label>
              <CurrencyInput
                id="monthly_payment"
                value={formData.monthly_payment}
                onChange={(value) => setFormData({ ...formData, monthly_payment: value })}
                className="max-w-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outstanding_balance">Saldo Devedor</Label>
              <CurrencyInput
                id="outstanding_balance"
                value={formData.outstanding_balance}
                onChange={(value) => setFormData({ ...formData, outstanding_balance: value })}
                className="max-w-xs"
              />
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
          <p className="mb-4 text-sm text-muted-foreground">
            Clique na estrela para definir a foto de capa
          </p>
          
          {isUploading && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando fotos... {uploadProgress}%
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-muted ${
                  index === coverIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                }`}
              >
                <img src={photo.previewUrl} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                
                {/* Cover badge */}
                {index === coverIndex && (
                  <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Capa
                  </div>
                )}
                
                {/* Set as cover button */}
                <button
                  type="button"
                  onClick={() => setCover(index)}
                  className={`absolute left-1 ${index === coverIndex ? "top-7" : "top-1"} rounded-full p-1 transition-colors ${
                    index === coverIndex 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  title="Definir como capa"
                >
                  <Star className={`h-3.5 w-3.5 ${index === coverIndex ? "fill-current" : ""}`} />
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

        {/* Videos */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Video className="h-5 w-5 text-primary" />
            Vídeos
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Adicione vídeos do imóvel (MP4, MOV, WebM)
          </p>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {videos.map((video, index) => (
              <div 
                key={index} 
                className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
              >
                <video 
                  src={video.previewUrl} 
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    const el = e.target as HTMLVideoElement;
                    el.pause();
                    el.currentTime = 0;
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-primary/5">
              <Video className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Adicionar vídeo</span>
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoUpload}
              />
            </label>
          </div>
        </div>
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
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={createProperty.isPending || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando fotos...
              </>
            ) : createProperty.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Cadastrar Imóvel
              </>
            )}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
