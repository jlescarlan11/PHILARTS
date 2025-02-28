import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";

/* -------------------------------------------------------
   Enhanced Analytics Tracker Utility
-------------------------------------------------------- */
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else if (process.env.NODE_ENV === "development") {
      console.warn("Analytics not available", eventName, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

/* -------------------------------------------------------
   useOnScreen Hook
   Detects if an element is visible using IntersectionObserver.
-------------------------------------------------------- */
const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.5
) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold]);
  return isVisible;
};

/* -------------------------------------------------------
   useResponsiveImage Hook
   Manages lazy-loading, error fallback, and responsive delivery.
-------------------------------------------------------- */
const useResponsiveImage = (baseUrl: string) => {
  const [src, setSrc] = useState(`${baseUrl}.webp`);
  const [hasError, setHasError] = useState(false);
  const handleError = () => {
    if (!hasError) {
      setSrc(`${baseUrl}.jpg`);
      setHasError(true);
    }
  };
  return { src, hasError, handleError };
};

/* -------------------------------------------------------
   ResponsiveImage Component
   Uses the <picture> element for WebP with JPEG fallback.
-------------------------------------------------------- */
interface ResponsiveImageProps {
  baseUrl: string;
  alt: string;
  className?: string;
}
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  baseUrl,
  alt,
  className,
}) => {
  const { src, handleError } = useResponsiveImage(baseUrl);
  return (
    <picture>
      <source srcSet={`${baseUrl}.webp`} type="image/webp" />
      <source srcSet={`${baseUrl}.jpg`} type="image/jpeg" />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={handleError}
        srcSet={`${baseUrl}.webp 1x, ${baseUrl}@2x.webp 2x`}
        sizes="(max-width: 640px) 100vw, 33vw"
        className={className}
      />
    </picture>
  );
};

/* -------------------------------------------------------
   Cart Utility
   Adds a product to the shopping cart stored in localStorage.
-------------------------------------------------------- */
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string; // Base path without extension (e.g., "/images/product1")
  details: string;
  rating: number;
  reviews: number;
}
const addProductToCart = (product: Product) => {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  trackEvent("add_to_cart", { productId: product.id, title: product.title });
};

/* -------------------------------------------------------
   CartModal Component
   Displays a modal confirming that a product has been added to the cart.
-------------------------------------------------------- */
interface CartModalProps {
  product: Product;
  onClose: () => void;
}
const CartModal: React.FC<CartModalProps> = ({ product, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white p-6 rounded-lg max-w-sm w-full z-10">
        <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
          Added to Cart!
        </h3>
        <p className="mt-2 text-[var(--color-secondary)]">
          {product.title} has been added to your cart.
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 ease-in-out ripple"
            role="button"
            aria-label="Continue Shopping"
          >
            Continue Shopping
          </button>
          <HashLink
            smooth
            to="#cart"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out ripple"
            role="button"
            aria-label="View Cart"
          >
            View Cart
          </HashLink>
        </div>
      </div>
    </div>
  );
};

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}
const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10">
        <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
          {product.title}
        </h3>
        <p className="mt-2 text-[var(--color-secondary)]">
          {product.description}
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--color-accent)]">
          ${product.price.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-gray-600">{product.details}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out ripple"
          role="button"
          aria-label="Close Quick View"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Sample Product Data
-------------------------------------------------------- */
const products: Product[] = [
  {
    id: 1,
    title: "Crunchy Delight",
    description: "A crispy treat that will leave you wanting more.",
    price: 9.99,
    image: "/images/product1",
    details:
      "Crafted with a secret blend of spices and the freshest ingredients.",
    rating: 4,
    reviews: 87,
  },
  {
    id: 2,
    title: "Spicy Surprise",
    description: "Experience the kick of our signature spice blend.",
    price: 12.99,
    image: "/images/product2",
    details: "A perfect balance of heat and flavor to awaken your taste buds.",
    rating: 5,
    reviews: 112,
  },
  {
    id: 3,
    title: "Sweet Harmony",
    description: "Indulge in the perfect blend of sweet and savory.",
    price: 11.49,
    image: "/images/product3",
    details:
      "Our chefs have perfected this recipe with decades of culinary expertise.",
    rating: 4,
    reviews: 95,
  },
  // Additional products...
];

/* -------------------------------------------------------
   ProductCard Component
   - Accessible product card with interactive buttons.
   - Uses ResponsiveImage and tracks product impressions.
   - Triggers onAddToCart callback when the product is added.
-------------------------------------------------------- */
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(cardRef, 0.5);
  const [hasBeenImpressed, setHasBeenImpressed] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [favorite, setFavorite] = useState(
    JSON.parse(localStorage.getItem(`favorite-${product.id}`) || "false")
  );

  // Track product impression once when visible
  useEffect(() => {
    if (isOnScreen && !hasBeenImpressed) {
      trackEvent("product_impression", {
        productId: product.id,
        title: product.title,
      });
      setHasBeenImpressed(true);
      setViewStartTime(Date.now());
    }
  }, [isOnScreen, hasBeenImpressed, product]);

  // Track view duration on unmount
  useEffect(() => {
    return () => {
      if (viewStartTime) {
        const duration = Date.now() - viewStartTime;
        trackEvent("product_view_duration", {
          productId: product.id,
          duration,
        });
      }
    };
  }, [viewStartTime, product]);

  // Toggle tooltip visibility
  const handleTooltipToggle = (visible: boolean) => {
    setShowTooltip(visible);
    trackEvent("product_tooltip", { productId: product.id, visible });
  };

  // Toggle favorite state with persistence
  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newFav = !favorite;
    setFavorite(newFav);
    localStorage.setItem(`favorite-${product.id}`, JSON.stringify(newFav));
    trackEvent("toggle_favorite", { productId: product.id, favorite: newFav });
  };

  // Open Quick View modal
  const openQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setQuickViewOpen(true);
    trackEvent("quick_view_click", {
      productId: product.id,
      title: product.title,
    });
  };
  const closeQuickView = () => setQuickViewOpen(false);

  // Handle Add to Cart by invoking callback (modal will be shown by parent)
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <>
      <div
        ref={cardRef}
        className="group relative bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 focus-within:scale-105 focus-within:shadow-xl"
        onMouseEnter={() => handleTooltipToggle(true)}
        onMouseLeave={() => handleTooltipToggle(false)}
        onFocus={() => handleTooltipToggle(true)}
        onBlur={() => handleTooltipToggle(false)}
        tabIndex={0}
        aria-describedby={`tooltip-${product.id}`}
        role="article"
      >
        <ResponsiveImage
          baseUrl={product.image}
          alt={`Nutcha Bite product: ${product.title}. ${product.description}`}
          className="w-full h-48 object-cover"
        />

        <div className="p-4">
          <h3 className="text-xl font-bold text-[var(--color-secondary)]">
            {product.title}
          </h3>
          <p className="mt-2 text-[var(--color-secondary)]">
            {product.description}
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-accent)]">
            ${product.price.toFixed(2)}
          </p>
          {/* Star Ratings & Review Count */}
          <div className="mt-2 flex items-center">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < product.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.118L10 13.011l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.64 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-[var(--color-secondary)]">
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Accessible Tooltip */}
        <div
          id={`tooltip-${product.id}`}
          role="tooltip"
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-tertiary)] text-white text-sm px-2 py-1 rounded transition-opacity duration-300 ${
            showTooltip ? "opacity-100" : "opacity-0"
          }`}
        >
          {product.details}
          <span className="sr-only"> – {product.title} additional details</span>
        </div>

        {/* Interactive Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <button
            onClick={openQuickView}
            className="p-2 bg-[var(--color-accent)] text-white rounded-full focus:outline-none transition transform hover:scale-110 ripple"
            role="button"
            aria-label={`Quick View for ${product.title}`}
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-[var(--color-accent)] text-white rounded-full focus:outline-none transition transform hover:scale-110 ripple"
            role="button"
            aria-label={`Add ${product.title} to Cart`}
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.293a1 1 0 00-.207.707V19a1 1 0 001 1h12a1 1 0 001-1v-3.293a1 1 0 00-.207-.707L17 13M7 13l10 0"
              />
            </svg>
          </button>
          <button
            onClick={toggleFavorite}
            className="p-2 bg-[var(--color-accent)] text-white rounded-full focus:outline-none transition transform hover:scale-110 ripple"
            role="button"
            aria-label={
              favorite
                ? `Remove ${product.title} from Favorites`
                : `Add ${product.title} to Favorites`
            }
            tabIndex={0}
          >
            {favorite ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 "
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={closeQuickView} />
      )}
    </>
  );
};

/* -------------------------------------------------------
   ProductShowcase Component
   Renders a grid of ProductCards and manages the CartModal.
-------------------------------------------------------- */
const ProductShowcase: React.FC = () => {
  // State to track which product was last added to cart for modal display.
  const [cartModalProduct, setCartModalProduct] = useState<Product | null>(
    null
  );

  // onAddToCart callback invoked by ProductCard.
  const handleAddToCart = (product: Product) => {
    // Add product to cart (persisted in localStorage)
    addProductToCart(product);
    // Show the CartModal by setting the product state
    setCartModalProduct(product);
  };

  // Close the CartModal
  const closeCartModal = () => setCartModalProduct(null);

  return (
    <section
      id="products"
      className="bg-[var(--color-primary)] py-16"
      role="region"
      aria-label="Product Showcase"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-secondary)] text-center mb-8">
          Our Delicacies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
      {/* Render the CartModal if a product was added */}
      {cartModalProduct && (
        <CartModal product={cartModalProduct} onClose={closeCartModal} />
      )}
      {/* JSON‑LD Structured Data for Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.title,
                description: product.description,
                image: `${product.image}.webp`,
                offers: {
                  "@type": "Offer",
                  price: product.price.toFixed(2),
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  url: `https://nutchabite.com/products/${product.id}`,
                },
                brand: {
                  "@type": "Brand",
                  name: "Nutcha Bite",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviews,
                },
              },
            })),
          }),
        }}
      />
    </section>
  );
};

export default ProductShowcase;
