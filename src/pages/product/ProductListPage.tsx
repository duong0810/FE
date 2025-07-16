import React, { useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";
import { Product } from "@/types";

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://be-sgv1.onrender.com/api/products");
        if (!response.ok) throw new Error("Lỗi khi lấy sản phẩm");
        const api = await response.json();
        // Lấy mảng sản phẩm từ đúng trường
       const products: Product[] = api.data.products.map((item: any) => ({
        id: item.productid,
        name: item.productname,
        price: item.price,
        description: item.description,
        image: item.imageurl
          ? (item.imageurl.startsWith("http") ? item.imageurl : `https://be-sgv1.onrender.com/${item.imageurl}`)
          : "", // hoặc để ảnh mặc định nếu muốn
        category: item.category,
        categoryId: "",
      }));
        setProducts(products);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Lấy danh sách category duy nhất từ sản phẩm
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 text-center">Danh sách sản phẩm</h1>
      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          {/* <h2 className="font-semibold text-lg mb-2">{cat}</h2> */}
          <ProductGrid products={products.filter((p) => p.category === cat)} />
        </div>
      ))}
    </div>
  );
};

export default ProductListPage;