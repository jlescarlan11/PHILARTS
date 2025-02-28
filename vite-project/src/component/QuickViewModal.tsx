import React, { useEffect, useRef } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  details: {
    benefits: string[];
    features: string[];
    testimonials: string[];
    videoUrl?: string;
  };
  image: string;
  price: number;
  stock: number;
  rating: number;
  tooltip?: string;
  trending?: boolean;
}

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  triggerRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
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
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      } else {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose, triggerRef]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Close quick view modal"
        >
          &times;
        </button>
        <h2 id="quick-view-title" className="text-2xl font-bold mb-4">
          {product.name}
        </h2>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/fallback.png";
          }}
        />
        <p className="mb-4 text-gray-700">{product.description}</p>
        <div className="mb-4">
          <h3 className="font-bold">Benefits:</h3>
          <ul className="list-disc list-inside">
            {product.details.benefits.map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold text-blue-500">
            ${product.price.toFixed(2)}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              console.log(`Buy Now clicked for ${product.name}`);
            }}
          >
            Buy Now &amp; Enjoy Limited-Time Savings!
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
