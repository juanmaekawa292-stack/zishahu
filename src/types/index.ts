export type ProductCategory = "teapot" | "cup" | "teaPet" | "teaTool" | "gift";

export interface ProductVariant {
  id: string;
  name_zhCN: string;
  name_zhTW: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  sku?: string;
}

export interface ProductSpecs {
  [key: string]: string | undefined;
  capacity?: string;
  clay?: string;
  craft?: string;
  dimensions?: string;
  material?: string;
  origin?: string;
  handmade?: string;
  firingType?: string;
  scenario?: string;
  cleaning?: string;
  packaging?: string;
  kiln?: string;
  year?: string;
  color?: string;
  suitableTea?: string;
  mainImageSource?: string;
  shapeType?: string;
}

export interface ShippingInfo {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface Product {
  id: string;
  slug: string;
  title_zhCN: string;
  title_zhTW: string;
  description_zhCN: string;
  description_zhTW: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  /** 壶型，如 "石瓢壶"、"归兽壶"、"西施壶" 等 */
  shape?: string;
  inStock: boolean;
  stock: number;
  featured?: boolean;
  specs: ProductSpecs;
  createdAt: string;
  rating: number;
  reviewCount: number;
  detailImages: string[];
  variants?: ProductVariant[];
  sourceUrl?: string;
  sourceSku?: string;
  videos: string[];
  shipping?: ShippingInfo;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "stripe" | "paypal";
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  sourceMap?: Record<string, { sourceUrl: string; sourceSku?: string }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: "user" | "admin";
  wishlist: string[];
  orders: string[];
  createdAt: string;
}
