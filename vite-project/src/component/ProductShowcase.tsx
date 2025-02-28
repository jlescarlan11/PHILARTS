// ProductShowcase.tsx
import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  lazy,
  FC,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { trackEvent } from "../utils/eventTracking"; // isolated utility for event tracking
import ErrorBoundary from "./ErrorBoundary"; // isolated ErrorBoundary module

// =======================
// Countdown Timer Component
// =======================
interface CountdownTimerProps {
  endTime: Date;
}
const CountdownTimer: FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    endTime.getTime() - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(endTime.getTime() - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft <= 0) {
    return <span>Offer expired</span>;
  }
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <span>
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
};

// =======================
// QuickViewModal Component (Lazy-loaded with Focus Trap)
// =======================
interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}
const QuickViewModal: FC<QuickViewModalProps> = ({
  product,
  onClose,
  triggerRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      modalRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements && focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current =
        focusableElements[focusableElements.length - 1];
      firstFocusableRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        if (!focusableElements || focusableElements.length === 0) return;
        if (
          e.shiftKey &&
          document.activeElement === firstFocusableRef.current
        ) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === lastFocusableRef.current
        ) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to the triggering element when modal closes.
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      } else {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose, triggerRef]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      ref={modalRef}
    >
      <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Close quick view modal"
        >
          &times;
        </button>
        <h2 id="quick-view-title" className="text-2xl font-bold mb-4">
          {product.name}
        </h2>
        <video
          src={product.video}
          controls
          className="w-full h-64 object-cover rounded mb-4"
          aria-label={`${product.name} feature video`}
        />
        <p className="mb-4 text-gray-700">{product.description}</p>
        <div className="mb-4">
          <h3 className="font-bold">Benefits:</h3>
          <ul className="list-disc list-inside">
            {product.details.benefits.map((benefit, idx) => (
              <li key={idx}>
                <span className="inline-block mr-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold text-[var(--color-accent)]">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={() => {
              trackEvent("buyNow", { productId: product.id });
              // Add to cart logic here.
            }}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-tertiary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now &amp; Enjoy Limited-Time Savings!
          </button>
        </div>
      </div>
    </div>
  );
};

// Lazy-load the QuickViewModal for performance.
const LazyQuickViewModal = lazy(() =>
  Promise.resolve({ default: QuickViewModal })
);

// =======================
// Product Interface & Data
// =======================
interface Product {
  id: number;
  name: string;
  description: string;
  video: string; // URL for a short feature video
  details: {
    benefits: string[];
    features: string[];
    testimonials: string[];
  };
  image: string;
  price: number;
  stock: number;
  rating: number; // out of 5
  tooltip?: string;
}

const fallbackImage = "/images/fallback.png";

const products: Product[] = [
  {
    id: 1,
    name: "Nutcha Bite Classic",
    description: "The original Iloilo delicacy's Bandi with a twist of matcha.",
    video: "/videos/nutcha-classic.mp4",
    details: {
      benefits: ["High in flavor", "Authentic taste", "Healthy ingredients"],
      features: ["Locally sourced", "Premium matcha", "Gluten-free"],
      testimonials: ["Absolutely delicious!", "A game changer!", "Must try!"],
    },
    image: "/images/nutcha-classic.jpg",
    price: 2.99,
    stock: 25,
    rating: 4.5,
    tooltip:
      "Crafted with locally sourced ingredients and premium matcha infusion.",
  },
  {
    id: 2,
    name: "Nutcha Bite Deluxe",
    description: "An elevated version with a richer matcha experience.",
    video: "/videos/nutcha-deluxe.mp4",
    details: {
      benefits: ["Richer taste", "Exquisite texture", "Modern twist"],
      features: ["Extra matcha infusion", "Unique recipe", "Artisan quality"],
      testimonials: [
        "Exceeded my expectations!",
        "A delightful treat!",
        "Highly recommended!",
      ],
    },
    image: "/images/nutcha-deluxe.jpg",
    price: 3.99,
    stock: 10,
    rating: 4.8,
    tooltip: "A perfect blend of tradition and innovation in every bite.",
  },
  // ... add more products as needed
];

// =======================
// Simulated Real-Time Updates
// =======================
const useRealTimeUpdates = (initialStock: number, initialRating: number) => {
  const [stock, setStock] = useState(initialStock);
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock((prev) => Math.max(0, prev - Math.floor(Math.random() * 2)));
      setRating((prev) =>
        Number((prev + (Math.random() - 0.5) * 0.1).toFixed(1))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stock, rating };
};

// =======================
// Product Card Component
// =======================
const ProductCard: FC<{ product: Product }> = ({ product }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  // Change ref type to HTMLButtonElement but pass it as HTMLElement | null
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { stock, rating } = useRealTimeUpdates(product.stock, product.rating);

  const handleImgError = () => {
    setImgSrc(fallbackImage);
  };

  const handleQuickAdd = () => {
    trackEvent("quickAddToCart", { productId: product.id });
    alert(`${product.name} added to cart!`);
  };

  const handleQuickView = () => {
    setModalOpen(true);
    trackEvent("quickView", { productId: product.id });
  };

  return (
    <div
      className="relative bg-[var(--color-primary)] p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      tabIndex={0}
      aria-labelledby={`product-${product.id}-title`}
    >
      <img
        src={imgSrc}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md"
        loading="lazy"
        onError={handleImgError}
      />
      <div className="mt-4">
        <h3
          id={`product-${product.id}-title`}
          className="text-xl font-bold text-[var(--color-secondary)]"
        >
          {product.name}
        </h3>
        <p className="text-sm text-[var(--color-secondary)] mt-2">
          {product.description}
        </p>
        <ul className="list-disc list-inside text-sm text-[var(--color-secondary)] mt-2">
          {product.details.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
        <p className="text-lg font-semibold text-[var(--color-accent)] mt-2">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {stock > 0 ? `Only ${stock} left in stock!` : "Out of stock"}
        </p>
        <div className="flex items-center mt-2">
          <span className="text-[var(--color-secondary)] mr-1">Rating:</span>
          <span className="text-[var(--color-accent)]">{rating} / 5</span>
        </div>
        <div className="mt-2">
          <CountdownTimer
            endTime={new Date(new Date().getTime() + 3600 * 1000)}
          />
        </div>
        <div className="mt-2 flex items-center">
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded mr-2">
            Trending
          </span>
          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
            Limited Stock
          </span>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleQuickAdd}
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-tertiary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
        <button
          onClick={handleQuickView}
          ref={triggerRef}
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-tertiary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label={`Quick view ${product.name}`}
        >
          Quick View
        </button>
      </div>
      {isModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyQuickViewModal
            product={product}
            onClose={() => setModalOpen(false)}
            triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
          />
        </Suspense>
      )}
    </div>
  );
};

// =======================
// Live Chat Widget (Lazy-loaded)
// =======================
const LiveChatWidget = lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="fixed z-50 bottom-4 right-4 bg-white p-4 rounded shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
        <button
          aria-label="Open live chat"
          onClick={() => alert("Live chat opened!")}
        >
          Live Chat
        </button>
      </div>
    ),
  })
);

// =======================
// Main Product Showcase Component
// =======================
const ProductShowcase: FC = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    responsive: [
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <ErrorBoundary>
      <section
        id="nutcha-bite-showcase"
        className="py-12 bg-[var(--color-primary)]"
        aria-label="Nutcha Bite Product Showcase"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[var(--color-secondary)] mb-8">
            Nutcha Bite Showcase
          </h2>

          {/* Carousel layout for mobile */}
          <div
            className="block sm:hidden"
            role="region"
            aria-label="Product Carousel"
          >
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <div key={product.id} className="p-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>

          {/* Grid layout for tablet and desktop */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Navigation to the full products section */}
          <div className="flex justify-center mt-8">
            <Link
              to="/products"
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-tertiary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              aria-label="View all products"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
      <Suspense fallback={<div>Loading chat...</div>}>
        <LiveChatWidget />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProductShowcase;
