export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  originalPrice?: number;
  image: string;
  category?: string; // <-- Đổi thành string
  details?: Detail[];
  colors?: Color[];
  categoryId: string | number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Detail {
  title: string;
  content: string;
}
export type Size = string;

export interface Color {
  name: string;
  hex: string;
}

export type SelectedOptions = {
  size?: Size;
  color?: Color["name"];
};

export interface CartItem {
  id: number;
  product: Product;
  options: SelectedOptions;
  quantity: number;
}

export type Cart = CartItem[];