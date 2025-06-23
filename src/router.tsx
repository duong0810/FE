import Layout from "@/components/layout";
import CartPage from "@/pages/cart";
import ProductListPage from "@/pages/product/ProductListPage";
import CategoryListPage from "@/pages/catalog/category-list";
import ProductDetailPage from "@/pages/catalog/product-detail";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import SearchPage from "@/pages/search";
import { createBrowserRouter } from "react-router-dom";
import GiftPage from "./pages/voucher/gift";
import VoucherWarehouse from "./pages/voucher/VoucherWarehouse";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage />, handle: { logo: true } },
      { path: "/products", element: <ProductListPage />, handle: { title: "Danh sách sản phẩm" } },
      { path: "/categories", element: <CategoryListPage />, handle: { title: "Danh mục sản phẩm", back: false } },
      { path: "/cart", element: <CartPage />, handle: { title: "Giỏ hàng" } },
      { path: "/profile", element: <ProfilePage />, handle: { logo: true } },
      { path: "/flash-sales", element: <ProductListPage />, handle: { title: "Flash Sales" } },
      { path: "/category/:id", element: <ProductListPage />, handle: { title: ({ categories, params }) => categories.find((c) => c.id === Number(params.id))?.name } },
      { path: "/product/:id", element: <ProductDetailPage />, handle: { scrollRestoration: 0 } },
      { path: "/search", element: <SearchPage />, handle: { title: "Tìm kiếm" } },
      { path: "/gift", element: <GiftPage />, handle: { title: "Chọn ưu đãi từ cửa hàng" } },
      { path: "/voucher-warehouse", element: <VoucherWarehouse />, handle: { title: "kho voucher" } },
    ],
  },
]);

export default router;