import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import { useState } from "react";

export interface ProductItemProps {
  product: Product;
  replace?: boolean;
}

export default function ProductItem(props: ProductItemProps) {
  return (
    <div
      className="flex flex-col group overflow-hidden"
      style={{ border: "none", boxShadow: "none" }}
    >
      <img
        src={props.product.image || "/no-image.png"}
        className="w-full h-auto max-w-[250px] mx-auto object-contain"
        style={{
          maxHeight: "400px",
        }}
        alt={props.product.name}
        onError={e => {
          const target = e.target as HTMLImageElement;
          if (target.src.indexOf("/no-image.png") === -1) {
            target.onerror = null;
            target.src = "/no-image.png";
          }
        }}
      />
      <div className="py-2">
        <div className="text-sm font-medium h-9 line-clamp-2">
          {props.product.name}
        </div>
        <div className="mt-0.5 text-sm">
          Giá từ: <span className="font-medium">{formatPrice(props.product.price)}</span>
        </div>
      </div>
    </div>
  );
}