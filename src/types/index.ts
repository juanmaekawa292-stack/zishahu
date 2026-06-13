export type ProductCategory = "teapot" | "cup" | "teaPet" | "teaTool" | "gift";

export interface ProductSpecs {
  capacity?: string; // e.g. "200ml"
  clay?: string; // e.g. "紫泥"
  craft?: string; // e.g. "手工制作"
  dimensions?: string; // e.g. "12×8×6cm"
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
  inStock: boolean;
  stock: number;
  featured?: boolean;
  specs: ProductSpecs;
  createdAt: string;
  rating: number;
 reviewCount: number;
  /** 天猫原始商品链接，用于下单时溯源 */
  sourceUrl?: string;
  /** 天猫货号/SKU编码 */
  sourceSku?: string;
  /** 商品视频链接 */
  videos?: string[];
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
  /** 订单商品溯源映射：商品ID → 天猫链接和货号 */
  sourceMap?: Record<string, { sourceUrl: string; sourceSku?: string }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  wishlist: string[];
  orders: string[];
  createdAt: string;
}
