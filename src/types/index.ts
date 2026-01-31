// Types for RepCRM - Sistema de Gestão de Repasse Imobiliário

export type PropertyType = 
  | 'apartamento' 
  | 'casa' 
  | 'garden' 
  | 'sobrado' 
  | 'sitio';

export type PropertyStatus = 
  | 'disponivel' 
  | 'negociacao' 
  | 'vendido';

export type ClientType = 
  | 'comprador' 
  | 'vendedor' 
  | 'comprador_vendedor';

export type ClientStatus = 
  | 'ativo' 
  | 'negociacao' 
  | 'fechado';

export interface Property {
  id: string;
  type: PropertyType;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  region: string;
  transfer_value: number;
  monthly_payment: number;
  outstanding_balance: number;
  bank_constructor: string;
  owner_name: string;
  owner_phone: string;
  status: PropertyStatus;
  notes: string | null;
  photos: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  type: ClientType;
  max_purchase_value: number | null;
  desired_property_types: PropertyType[];
  regions_of_interest: string[];
  has_property_for_transfer: boolean;
  status: ClientStatus;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  client_id: string;
  property_id: string;
  match_score: number;
  is_viewed: boolean;
  created_at: string;
  client?: Client;
  property?: Property;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  garden: 'Garden',
  sobrado: 'Sobrado',
  sitio: 'Sítio',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponivel: 'Disponível',
  negociacao: 'Em Negociação',
  vendido: 'Vendido',
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  comprador_vendedor: 'Comprador + Vendedor',
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ativo: 'Ativo',
  negociacao: 'Em Negociação',
  fechado: 'Fechado',
};

export const REGIONS = [
  'CIC',
  'Tatuquara',
  'Sítio Cercado',
  'Colombo',
  'Campo Largo',
  'Pinhais',
  'São José dos Pinhais',
  'Araucária',
  'Almirante Tamandaré',
  'Fazenda Rio Grande',
  'Bairro Alto',
  'Boqueirão',
  'Cajuru',
  'Cidade Industrial',
  'Xaxim',
  'Portão',
  'Santa Felicidade',
  'Boa Vista',
  'Outro',
];

export const BANKS_CONSTRUCTORS = [
  'Caixa',
  'Banco do Brasil',
  'Bradesco',
  'Itaú',
  'Santander',
  'MRV',
  'Tenda',
  'Direcional',
  'Plano & Plano',
  'Cyrela',
  'Outro',
];
