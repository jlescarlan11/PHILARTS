import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import nutcha1 from "../assets/nutcha1.webp";
// Instead of using useCart from hooks, we import useCartContext from the shared context.
import { useCartContext } from "./CartContext";
import { CartItem } from "../hooks/useCart";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { MdBlock, MdRemoveRedEye, MdShoppingCart } from "react-icons/md";

// -------------------------
// Type Definitions
// -------------------------
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: { label: string; priceAdjustment: number }[];
  trustBadges?: string[];
  aggregateRating?: number;
  availability?: string;
}

// -------------------------
// Sample Product Data
// -------------------------
const products: Product[] = [
  {
    id: "1",
    name: "Nutcha Bites Original",
    description:
      "Savor the timeless taste of our Nutcha Bite Classic – a delightful fusion of traditional Iloilo flavors with a modern matcha twist. A nutcha-try favorite!",
    price: 30,
    image: `${nutcha1}`, // already a .webp image
    sizes: [
      { label: "Small", priceAdjustment: 0 },
      { label: "Medium", priceAdjustment: 15 },
      { label: "Large", priceAdjustment: 25 },
    ],
    trustBadges: ["Bestseller", "Free Shipping"],
    aggregateRating: 4.5,
    availability: "InStock",
  },
  {
    id: "2",
    name: "Nutcha Bites Deluxe",
    description:
      "Nutcha Bite Deluxe: A bold fusion of heritage flavors with a matcha twist—sprinkled with premium matcha for an irresistible burst of flavor.",
    price: 40,
    image: "/images/product2", // assumed .webp
    sizes: [
      { label: "Regular", priceAdjustment: 0 },
      { label: "Family Pack", priceAdjustment: 60 },
    ],
    trustBadges: ["Customer Favorite"],
    aggregateRating: 4.3,
    availability: "Out of Stock",
  },
];

// -------------------------
// Custom Hook: useResponsiveImage
// Uses the provided image URL (assumed to be .webp) and handles load errors.
// On error, updates the error state so ARIA live regions can notify the user.
const useResponsiveImage = (imageUrl: string) => {
  const [src] = useState(imageUrl);
  const [error, setError] = useState(false);
  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };
  return { src, handleError, error };
};

// -------------------------
// Custom Hook: useFocusTrap
// Traps focus within a modal dialog.
const useFocusTrap = (modalRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
    ].join(",");
    const modal = modalRef.current;
    if (!modal) return;
    const focusableElements =
      modal.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as unknown as KeyboardEvent;
      if (keyboardEvent.key === "Tab") {
        if (keyboardEvent.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    modal.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();
    return () => modal.removeEventListener("keydown", handleKeyDown);
  }, [modalRef]);
};

// -------------------------
// Analytics Helper (Debounced)
// -------------------------
const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

const trackEvent = debounce(
  (eventName: string, details: Record<string, any>) => {
    try {
      const metadata = {
        ...details,
        deviceType: window.innerWidth < 768 ? "mobile" : "desktop",
        sessionId: sessionStorage.getItem("sessionId") || "unknown",
      };
      if (window.gtag) {
        window.gtag("event", eventName, metadata);
      } else {
        console.log(`Tracked Event: ${eventName}`, metadata);
      }
    } catch (error) {
      console.error("Analytics tracking error:", error, eventName, details);
    }
  },
  300
);

// -------------------------
// CartConfirmationModal Component
// Displays a confirmation after adding to cart with clear next-step options.
interface CartConfirmationModalProps {
  onViewCart: () => void;
  onContinue: () => void;
  onUndo: () => void;
}
const CartConfirmationModal: React.FC<CartConfirmationModalProps> = ({
  onViewCart,
  onContinue,
  onUndo,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(modalRef);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-confirmation-title"
      aria-describedby="cart-confirmation-desc"
    >
      <div
        className="absolute inset-0 bg-[var(--color-secondary)] opacity-50"
        aria-hidden="true"
      ></div>
      <div
        ref={modalRef}
        className="relative bg-[var(--color-primary)] p-6 rounded-lg max-w-md w-full z-10 transition-transform duration-300"
      >
        <h3
          id="cart-confirmation-title"
          className="text-2xl font-bold text-[var(--color-secondary)]"
        >
          Great Choice!
        </h3>
        <p
          id="cart-confirmation-desc"
          className="mt-2 text-[var(--color-secondary)]"
        >
          Your product was added to your cart. Would you like to review your
          cart or continue shopping?
        </p>
        <div className="mt-4 flex justify-between space-x-2">
          <button
            onClick={onUndo}
            className="px-4 py-2 bg-[var(--color-secondary-50)] text-[var(--color-secondary)] rounded hover:bg-[var(--color-secondary-40)] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Undo the cart addition"
          >
            Undo
          </button>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onViewCart}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] hover:bg-[var(--color-accent-90)] rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Go to your cart to review your selections"
            >
              View Cart
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-[var(--color-tertiary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-tertiary-90)] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Continue browsing products"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// AddToCartModal Component
// Modal for selecting product options with persuasive microcopy.
interface AddToCartModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (size: string, quantity: number) => void;
}
const AddToCartModal: React.FC<AddToCartModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(modalRef);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].label);
  const [quantity, setQuantity] = useState(1);
  const [ariaMsg, setAriaMsg] = useState("");

  useEffect(() => {
    setAriaMsg(`Selected size: ${selectedSize}, Quantity: ${quantity}`);
  }, [selectedSize, quantity]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-title"
      aria-describedby="add-to-cart-desc"
    >
      <div
        className="absolute inset-0 bg-[var(--color-secondary)] opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        ref={modalRef}
        className="relative bg-[var(--color-primary)] p-6 rounded-lg max-w-md w-full z-10 transition-transform duration-300"
      >
        <h3
          id="add-to-cart-title"
          className="text-2xl font-bold text-[var(--color-secondary)] mb-4"
        >
          Add to Your Cart
        </h3>
        <p id="add-to-cart-desc" className="mb-4 text-[var(--color-secondary)]">
          Choose the perfect size and quantity for an unforgettable dining
          experience.
        </p>
        <div aria-live="polite" className="sr-only">
          {ariaMsg}
        </div>
        <div className="mb-4">
          <label className="block text-[var(--color-secondary)] mb-1">
            Size:
          </label>
          <select
            value={selectedSize}
            onChange={(e) => {
              setSelectedSize(e.target.value);
              trackEvent("size_selection_changed", {
                productId: product.id,
                size: e.target.value,
              });
            }}
            className="w-full p-2 border border-[var(--color-secondary-30)] text-[var(--color-secondary)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Select the ideal size for your product"
          >
            {product.sizes.map((option, idx) => (
              <option
                key={idx}
                value={option.label}
                className="bg-[var(--color-primary)]"
              >
                {option.label}{" "}
                {option.priceAdjustment > 0 &&
                  `(+₱${option.priceAdjustment.toFixed(2)})`}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[var(--color-secondary)] mb-1">
            Quantity:
          </label>
          <div className="flex">
            <button
              onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-2 bg-[var(--color-accent)] rounded-l hover:bg-[var(--color-accent-90)] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] transition-transform duration-200"
              aria-label="Decrease the quantity"
            >
              –
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-16 text-center border-t border-b border-[var(--color-accent-30)] text-[var(--color-secondary)] focus:outline-none"
              min="1"
              aria-label="Current quantity"
            />
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-3 py-2 bg-[var(--color-accent)] rounded-r hover:bg-[var(--color-accent-90)] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] transition-transform duration-200"
              aria-label="Increase the quantity"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-accent-50)] text-[var(--color-secondary)] rounded hover:bg-[var(--color-accent-70)] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Cancel adding the product"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedSize, quantity)}
            className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded hover:bg-[var(--color-accent-90)] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ripple"
            aria-label="Confirm your selection and add to cart"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// ViewProductModal Component
// Displays detailed product information with enhanced accessibility.
interface ViewProductModalProps {
  product: Product;
  onClose: () => void;
}
const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(modalRef);
  const { src, handleError, error } = useResponsiveImage(product.image);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-product-title"
      aria-describedby="view-product-desc"
    >
      <div
        className="absolute inset-0 bg-[var(--color-secondary)] opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        ref={modalRef}
        className="relative bg-[var(--color-primary)] p-6 rounded-lg max-w-3xl w-full z-10 transition-transform duration-300"
      >
        <h3
          id="view-product-title"
          className="text-2xl font-bold text-[var(--color-secondary)] mb-4"
        >
          {product.name}
        </h3>
        <div id="view-product-desc" className="flex flex-col sm:flex-row">
          <img
            src={src}
            alt={`${product.name} detailed view`}
            onError={handleError}
            loading="lazy"
            className="w-full sm:w-1/2 h-auto object-cover rounded mb-4 sm:mb-0 sm:mr-4"
          />
          {error && (
            <div role="alert" aria-live="assertive" className="text-red-600">
              We’re sorry – this product image failed to load. Please try again
              later.
            </div>
          )}
          <div>
            <p className="text-lg text-[var(--color-secondary)] mb-2">
              {product.description}
            </p>
            <p className="text-sm font-semibold text-[var(--color-accent)] mb-2">
              ₱{product.price.toFixed(2)}
            </p>
            {product.trustBadges && (
              <div className="mb-2">
                {product.trustBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-[var(--color-tertiary)] text-[var(--color-primary)] text-xs px-2 py-1 rounded mr-2"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-[var(--color-secondary-60)]">
              Rating: {product.aggregateRating} / 5
            </p>
            <p className="text-xs text-[var(--color-secondary-60)]">
              Availability: {product.availability}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Close the product details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// ProductCard Component
// -------------------------
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
  cartCount?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
  onToggleFavorite,
  isFavorite,
  cartCount,
}) => {
  // Use custom hook for responsive image handling
  const { src, error } = useResponsiveImage(product.image);

  // Explicitly cast to boolean to ensure the value is always a boolean.
  // This avoids the possibility of getting an empty string when product.availability is ""
  const isOutOfStock: boolean = product.availability
    ? product.availability.toLowerCase().includes("out of stock")
    : false;

  // Track product card view event for analytics
  useEffect(() => {
    trackEvent("product_card_view", { productId: product.id });
  }, [product.id]);

  return (
    <div
      className="relative h-96 rounded-lg shadow-md p-4 transform transition-transform duration-300 hover:scale-105 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${src})` }}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Transparent gradient overlay for readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[var(--color-tertiary-20)] via-[var(--color-tertiary-40)] to-[var(--color-tertiary-70)]"></div>

      {/* Display error message for screen readers if the image fails */}
      {error && (
        <div role="alert" aria-live="assertive" className="sr-only">
          Unable to load product image.
        </div>
      )}

      {/* Interactive icons */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* View Product Button */}
        <button
          onClick={() => onViewProduct(product)}
          className="p-2 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
          aria-label={`Discover more about ${product.name}`}
        >
          <MdRemoveRedEye className="text-[var(--color-primary)]" />
        </button>
        {/* Add to Cart Button - Disabled if out of stock */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className="relative p-2 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Add ${product.name} to your cart now`}
        >
          <MdShoppingCart className="text-[var(--color-primary)]" />
          {(cartCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--color-tertiary)] text-[var(--color-primary)] text-xs rounded-full px-1">
              {cartCount}
            </span>
          )}
        </button>
        {/* Toggle Favorite Button */}
        <button
          onClick={() => onToggleFavorite(product)}
          className="p-2 bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
          aria-label={
            isFavorite
              ? `Remove ${product.name} from your favorites`
              : `Add ${product.name} to your favorites`
          }
        >
          {isFavorite ? (
            <IoMdHeart className="text-red-500" />
          ) : (
            <IoMdHeartEmpty className="text-[var(--color-primary)]" />
          )}
        </button>
      </div>

      {/* Product details overlaid on the bottom */}
      <div className="absolute font-normal bottom-4 left-4 right-4 text-[var(--color-primary)]">
        <h3 className="text-2xl font-bold">{product.name}</h3>
        <p className="text-sm">{product.description}</p>
        <p className="text-xs font-semibold mt-1">
          ₱{product.price.toFixed(2)}
        </p>
        {/* Trust badges and Out-of-Stock Indicator */}
        <div className="mt-2 flex items-center space-x-2">
          {product.trustBadges &&
            product.trustBadges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-block bg-[var(--color-tertiary)] text-[var(--color-primary)] text-xs px-2 py-1 rounded"
              >
                {badge}
              </span>
            ))}
          {/* Display Out-of-Stock label if applicable */}
          {isOutOfStock && (
            <span className="inline-flex items-center bg-[var(--color-accent)] text-[var(--color-primary)] text-xs px-2 py-1 rounded">
              <MdBlock className="mr-1" />
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Main Component: ProductShowcase
// Displays the product grid and manages all modals and interactions.
const ProductShowcase: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [showCartConfirmationModal, setShowCartConfirmationModal] =
    useState(false);
  // Use the CartContext instead of directly using useCart.
  const { cartItems, addToCart, setCartItems } = useCartContext();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [previousCart, setPreviousCart] = useState<CartItem[]>([]);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setShowAddToCartModal(true);
    trackEvent("add_to_cart_modal_open", { productId: product.id });
  };

  const handleConfirmAddToCart = (size: string, quantity: number) => {
    if (selectedProduct) {
      const sizeOption = selectedProduct.sizes.find((s) => s.label === size);
      const finalPrice =
        selectedProduct.price + (sizeOption ? sizeOption.priceAdjustment : 0);
      const cartItem: CartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        size,
        price: finalPrice,
        quantity,
        image: selectedProduct.image,
      };
      setPreviousCart([...cartItems]);
      addToCart(cartItem);
      trackEvent("add_to_cart", {
        productId: selectedProduct.id,
        size,
        quantity,
      });
      setShowAddToCartModal(false);
      setShowCartConfirmationModal(true);
      setAriaAnnouncement("Product successfully added to your cart.");
    }
  };

  const handleUndoAddToCart = () => {
    setCartItems(previousCart);
    setShowCartConfirmationModal(false);
    setAriaAnnouncement("Your last action was undone. Cart updated.");
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewProductModal(true);
    trackEvent("view_product_modal_open", { productId: product.id });
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
    trackEvent("toggle_favorite", { productId: product.id });
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image,
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: "USD",
          availability: `https://schema.org/${
            product.availability || "InStock"
          }`,
        },
        brand: { "@type": "Brand", name: "Nutcha Bite" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.aggregateRating?.toString() || "4.5",
          reviewCount: "120",
        },
      },
    })),
    keywords:
      "Nutcha Bite, matcha, Iloilo delicacy, food, ordering, ingredients, dietary, support",
  };

  return (
    <section id="products" className="relative py-16 bg-[var(--color-primary)]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)] text-center mb-8">
          Our Delicious Selections
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewProduct={handleViewProduct}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(product.id)}
              cartCount={cartItems
                .filter((ci) => ci.id === product.id)
                .reduce((sum, ci) => sum + ci.quantity, 0)}
            />
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      {showAddToCartModal && selectedProduct && (
        <AddToCartModal
          product={selectedProduct}
          onClose={() => setShowAddToCartModal(false)}
          onConfirm={handleConfirmAddToCart}
        />
      )}
      {showCartConfirmationModal && (
        <CartConfirmationModal
          onViewCart={() => {
            setShowCartConfirmationModal(false);
            navigate("/cart");
          }}
          onContinue={() => setShowCartConfirmationModal(false)}
          onUndo={handleUndoAddToCart}
        />
      )}
      {showViewProductModal && selectedProduct && (
        <ViewProductModal
          product={selectedProduct}
          onClose={() => setShowViewProductModal(false)}
        />
      )}
      <div aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </div>
    </section>
  );
};

export default ProductShowcase;
