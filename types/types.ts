export interface Province {
  _id: string;
  name: string;
  country: string;
  addedby?: string;
  createdAt?: string;
}

export interface Subscription {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  clientPhone: string;
  amount: number;
  currency: string;
  status: "PENDING" | "ACTIVE" | "FAILED" | "PAID";
  expiresAt?: string;
  createdAt: string;
  notes?: string;
}

export interface SubscriptionStats {
  _id: string;
  totalCount: number;
  totalRevenueUSD: number;
  totalRevenueCDF: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  sections: { _id: string; name: string }[];
  status: "published" | "draft";
  totalQuestions?: number;
  createdAt: string;
  publishedAt?: string;
}
