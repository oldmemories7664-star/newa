
export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  is_premium: boolean;
  premium_expiry_timestamp: number;
  remaining_ai_seconds: number;
  total_usage_time: number;
  created_at: number;
  last_login: number;
  profile_image_base64?: string;
  theme_preferences: {
    primary_bg: string;
    secondary_bg: string;
    card_bg: string;
    border_color: string;
    text_primary: string;
    text_secondary: string;
    accent_color: string;
    button_bg: string;
    success: string;
    danger: string;
    warning: string;
  };
  ads_disabled: boolean;
  blocked: boolean;
  isAdmin?: boolean;
}

export interface SavedChat {
  id: string;
  agentId: string;
  agentName: string;
  lastMessage: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface PremiumRequest {
  id: string;
  uid: string;
  username: string;
  plan_name: string;
  plan_price: string;
  transaction_id: string;
  payment_screenshot_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  duration_days: number;
  benefits: string[];
  active: boolean;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  api_type: string;
  system_instruction: string;
  is_enabled: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_uid?: string;
  is_read: boolean;
  created_at: number;
  priority: 'low' | 'medium' | 'high';
}

export interface AppSettings {
  app_name: string;
  app_logo_url: string;
  upi_id: string;
  qr_code_url: string;
  ads_provider_id: string;
  maintenance_mode: boolean;
  total_revenue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
