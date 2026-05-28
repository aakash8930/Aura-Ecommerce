// Shared product / order shapes — kept loose so the API contract can evolve.

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl: string;
  _count?: { products: number };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string;
  stock: number;
  badge: string | null;
  tags: string;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: Category;
};

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  userName: string;
  verifiedPurchase: boolean;
  createdAt: string;
};

export type ProductQuestion = {
  id: string;
  question: string;
  userName: string;
  createdAt: string;
  answers: ProductAnswer[];
};

export type ProductAnswer = {
  id: string;
  answer: string;
  userName: string;
  isStaff: boolean;
  createdAt: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export type Address = {
  id: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

export type Order = {
  id: string;
  email: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  items: { id: string; name: string; imageUrl: string; quantity: number; price: number; productId: string }[];
  shippingAddress?: Address | null;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
};
