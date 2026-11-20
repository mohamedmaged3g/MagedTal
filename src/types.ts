export type ToolId =
  | 'takhseem-pro'
  | 'kitchen-workshop'
  | 'kitchen-3d-studio'
  | 'workshop-manager'
  | 'shop-manager';

export type OrderStage =
  | 'design_3d'
  | 'takhseem'
  | 'costing'
  | 'fabrication'
  | 'delivery';

export type OrderSource = 'facebook' | 'shop' | 'direct';

export type ProfileCategory = 'aluminum' | 'upvc';

export type InquiryStatus = 'new' | 'replied' | 'converted';

export interface WorkshopTool {
  id: ToolId;
  name: string;
  shortName: string;
  englishName: string;
  category: string;
  description: string;
  url: string;
  stageLabel: string;
  recommendedStage: OrderStage;
}

export interface WorkshopOrder {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  source: OrderSource;
  profileType: ProfileCategory;
  profileSystem?: string;
  projectType: string;
  dimensionsNote: string;
  stage: OrderStage;
  activeToolId: ToolId;
  totalCost: number;
  paidDeposit: number;
  linkedInquiryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookMessage {
  id: string;
  sender: 'customer' | 'page';
  text: string;
  timestamp: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
}

export interface FacebookInquiry {
  id: string;
  referenceCode?: string;
  psid?: string;
  conversationId?: string;
  customerName: string;
  customerPhone?: string;
  profileType?: ProfileCategory;
  profileSystem?: string;
  projectInterest: string;
  status: InquiryStatus;
  sourceType: 'webhook' | 'graph_api' | 'manual';
  linkedOrderId?: string;
  messages: FacebookMessage[];
  updatedAt: string;
  createdAt: string;
}

export interface QuoteTrackingResult {
  referenceCode: string;
  profileTypeLabel?: string;
  profileSystem?: string;
  projectInterest: string;
  status: InquiryStatus;
  statusLabel: string;
  linkedOrderCode?: string;
  linkedOrderStageLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookStatusResponse {
  pageId: string;
  pageUrl: string;
  webhookUrl: string;
  graphApiConfigured: boolean;
  verifyTokenConfigured: boolean;
  persistentDbConfigured?: boolean;
}

export interface AuthSessionStatus {
  authenticated: boolean;
  usingDefaultPassword: boolean;
  passwordSource?: 'dashboard' | 'env' | 'default';
  passwordUpdatedAt?: string | null;
  persistentDbConfigured: boolean;
}

export interface CustomerProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQuoteRecord {
  id: string;
  uid: string;
  referenceCode: string;
  projectInterest: string;
  profileType: ProfileCategory;
  profileSystem?: string;
  summary: string;
  createdAtMs: number;
}

export interface ToolEmbedCheck {
  url: string;
  reachable: boolean;
  embeddable: boolean;
  reason?: string;
}

export interface EstimatorOption {
  id: string;
  label: string;
  formInterest: string;
  unitLabel: string;
  minRate: number;
  maxRate: number;
  defaultQty: number;
  minQty: number;
  maxQty: number;
}

export interface EstimatorPricingConfig {
  items: EstimatorOption[];
  premiumIncreasePercent: number;
  updatedAt?: string;
}


