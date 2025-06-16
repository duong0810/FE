import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import TransitionLink from "./transition-link";
import { useState } from "react";

export interface ProductItemProps {
  product: Product;
  /**
   * Whether to replace the current page when user clicks on this product item. Default behavior is to push a new page to the history stack.
   * This prop should be used when navigating to a new product detail from a current product detail page (related products, etc.)
   */
  replace?: boolean;
}

export default function ProductItem(props: ProductItemProps) {
  const [selected, setSelected] = useState(false);

   return (
    <TransitionLink
      className="flex flex-col cursor-pointer group"
      to={`/product/${props.product.id}`}
      replace={props.replace}
      onClick={() => setSelected(true)}
    >
      {({ isTransitioning }) => (
        <>
          <img
            src={props.product.image || "/no-image.png"}
            className="w-full h-auto max-w-[250px] mx-auto object-contain rounded-t-lg"
            style={{
              viewTransitionName:
                isTransitioning && selected
                  ? `product-image-${props.product.id}`
                  : undefined,
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
            {/* Tăng kích cỡ từ text-xs lên text-sm, thêm font-medium và uppercase */}
            <div className="text-sm font-medium h-9 line-clamp-2">
              {props.product.name}
            </div>
            <div className="mt-0.5 text-sm">
              Giá từ: <span className="font-medium">{formatPrice(props.product.price)}</span>
            </div>
          </div>
        </>
      )}
    </TransitionLink>
  );
}