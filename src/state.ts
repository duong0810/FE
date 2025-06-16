import { atom } from "jotai";
import { atomFamily, unwrap } from "jotai/utils";
import { Cart, Category, Color, Product } from "./types";
import { requestWithFallback } from "@/utils/request";
import { getUserInfo } from "zmp-sdk";

// User info
export const userState = atom(() =>
  getUserInfo({
    avatarType: "normal",
  })
);

// Banners (FIX: Return hardcoded array instead of API call)
export const bannersState = atom(() => {
  // Return hardcoded banners for now
  const defaultBanners: string[] = [
    '/images/banner/banner-1.jpg',
    '/images/banner/banner-2.jpg',
    '/images/banner/banner-3.jpg'
  ];
  return Promise.resolve(defaultBanners);
});

// Tabs
export const tabsState = atom([
  "Tất cả",
  "Xe tay ga",
  "Xe số",
  "Xe côn tay",
  "Xe phân khối lớn",
  "Xe điện",
]);

export const selectedTabIndexState = atom(0);

// Categories (FIX: Add missing image property)
export const categoriesState = atom(() => {
  // Return hardcoded categories with ALL required properties
  const defaultCategories: Category[] = [
    { 
      id: 1, 
      name: 'Tất cả', 
      image: '/images/category/category-general.webp' 
    },
    { 
      id: 2, 
      name: 'Xe tay ga', 
      image: '/images/category/category-motorbike.webp' 
    },
    { 
      id: 3, 
      name: 'Xe số', 
      image: '/images/category/category-parts.webp' 
    },
    { 
      id: 4, 
      name: 'Xe côn tay', 
      image: '/images/category/category-parts.webp' 
    },
    { 
      id: 5, 
      name: 'Xe phân khối lớn', 
      image: '/images/category/category-parts.webp' 
    },
    { 
      id: 6, 
      name: 'Xe điện', 
      image: '/images/category/category-parts.webp' 
    }
  ];
  return Promise.resolve(defaultCategories);
});

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);


// Products
export const productsState = atom(async () => {
  try {
    console.log('🚀 Fetching products from API...');
    
    // FIX: Use correct API URL (port 3000)
    const response = await fetch('https://be-sgv1.onrender.com/api/products');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (!data.success || !data.data?.products) {
      throw new Error('Invalid API response format');
    }
    
    // Map BE format to FE format
    const mappedProducts: Product[] = data.data.products.map((product: any) => ({
      id: String(product.productid),           // productid → id
      name: product.productname,               // productname → name  
      price: parseFloat(product.price),        // string → number
      image: product.imageurl || '/images/default-product.jpg', // handle null
      description: product.description || '',  // handle undefined
      categoryId: product.category,            // category → categoryId
      category: product.category,              // category → category
    }));
    
    console.log('✅ Mapped Products:', mappedProducts);
    return mappedProducts;
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    // Return empty array instead of fallback data
    return [];
  }
});

export const flashSaleProductsState = atom((get) => get(productsState));
export const recommendedProductsState = atom((get) => get(productsState));

// Sizes, Colors
export const sizesState = atom(["S", "M", "L", "XL"]);
export const selectedSizeState = atom<string | undefined>(undefined);

export const colorsState = atom<Color[]>([
  { name: "Đỏ", hex: "#FFC7C7" },
  { name: "Xanh dương", hex: "#DBEBFF" },
  { name: "Xanh lá", hex: "#D1F0DB" },
  { name: "Xám", hex: "#D9E2ED" },
]);
export const selectedColorState = atom<Color | undefined>(undefined);

// Product detail
export const productState = atomFamily((id: number | string) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => String(product.id) === String(id));
  })
);

// Cart
export const cartState = atom<Cart>([]);
export const selectedCartItemIdsState = atom<number[]>([]);

export const checkoutItemsState = atom((get) => {
  const ids = get(selectedCartItemIdsState);
  const cart = get(cartState);
  return cart.filter((item) => ids.includes(item.id));
});

export const cartTotalState = atom((get) => {
  const items = get(checkoutItemsState);
  return {
    totalItems: items.length,
    totalAmount: items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
  };
});

// Search
export const keywordState = atom("");
export const searchResultState = atom(async (get) => {
  const keyword = get(keywordState);
  const products = await get(productsState);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
});