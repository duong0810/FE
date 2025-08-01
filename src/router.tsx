import Layout from "@/components/layout";
import CartPage from "@/pages/cart";
import ProductListPage from "@/pages/product/ProductListPage";
import CategoryListPage from "@/pages/catalog/category-list";
import ProductDetailPage from "@/pages/catalog/product-detail";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import SearchPage from "@/pages/search";
import { createHashRouter } from "react-router-dom";
import GiftPage from "./pages/voucher/gift";
import AccountInfo from "./pages/profile/AccountInfo";
import AccountUpdate from "./pages/profile/AccountUpdate";
import VoucherWarehouse from "./pages/voucher/VoucherWarehouse";
import Point from "./pages/voucher/point";
// import Core from "./pages/voucher/core";
const router = createHashRouter([
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
      { path: "/account", element: <AccountInfo />, handle: { title: "Tài khoản" } },
      { path: "/account/update", element: <AccountUpdate />, handle: { title: "Cập nhật tài khoản" } },
      { path: "/voucher-warehouse", element: <VoucherWarehouse />, handle: { title: "kho voucher" } },
      { path: "/point", element: <Point />, handle: { title: "Vòng quay may mắn" } },
      // { path: "/core", element: <Core />, handle: { title: "Tích điểm" } },
      // Fallback route: chuyển về trang chủ nếu không khớp bất kỳ route nào
      { path: "*", element: <HomePage /> },
    ],
  },
]);

export default router;