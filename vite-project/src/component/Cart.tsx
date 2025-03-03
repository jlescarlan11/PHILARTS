import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, useCart } from "../hooks/useCart";

// -------------------------
// Analytics Tracker Utility
// Define trackEvent so it is available in our component.
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.log(`Event: ${eventName}`, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

// -------------------------
// Helper: groupCartItems
// Groups duplicate cart items (by name, price, and size) by summing their quantities.
const groupCartItems = (items: CartItem[]): CartItem[] => {
  const grouped: Record<string, CartItem> = {};
  items.forEach((item) => {
    // Include size in key if available.
    const key = `${item.name}-${item.price}-${item.size || "default"}`;
    if (grouped[key]) {
      grouped[key].quantity += item.quantity;
    } else {
      grouped[key] = { ...item };
    }
  });
  return Object.values(grouped);
};

// -------------------------
// Toast Component
// Displays temporary toast notifications.
const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-[var(--color-accent)] text-white px-4 py-2 rounded shadow-md animate-fadeIn">
    {message}
  </div>
);

// -------------------------
// ConfirmModal Component
// Custom modal to confirm cart clearance. ARIA attributes added.
interface ConfirmModalProps {
  name: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  name,
  message,
  onConfirm,
  onCancel,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    aria-describedby="confirm-modal-description"
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onCancel}
      aria-hidden="true"
    ></div>
    <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
      <h3
        id="confirm-modal-title"
        className="text-2xl font-bold text-[var(--color-secondary)]"
      >
        {name}
      </h3>
      <p
        id="confirm-modal-description"
        className="mt-2 text-[var(--color-secondary)]"
      >
        {message}
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Confirm clear cart"
        >
          Clear Cart
        </button>
      </div>
    </div>
  </div>
);

// -------------------------
// ViewProductModal Component (Optional)
// Displays detailed product info (including size) in a modal.
const ViewProductModal: React.FC<{ item: CartItem; onClose: () => void }> = ({
  item,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="view-product-title"
    aria-describedby="view-product-description"
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onClose}
      aria-hidden="true"
    ></div>
    <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10">
      <h3
        id="view-product-title"
        className="text-2xl font-bold text-[var(--color-secondary)]"
      >
        {item.name}
      </h3>
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover rounded my-4"
        loading="lazy"
      />
      <p
        id="view-product-description"
        className="text-[var(--color-secondary)]"
      >
        Price: ${item.price.toFixed(2)} | Quantity: {item.quantity}{" "}
        {item.size && `| Size: ${item.size}`}
      </p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        aria-label="Close product details"
      >
        Close
      </button>
    </div>
  </div>
);

// -------------------------
// Cart Component
// Displays cart items as modern cards with background images and gradient overlays,
// and a sticky checkout summary with conversion-focused CTAs.
const Cart: React.FC = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    applyCoupon,
    getSubtotal,
  } = useCart();
  const [toast, setToast] = useState<string>("");
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [viewProduct, setViewProduct] = useState<CartItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    return localStorage.getItem("favorites")
      ? JSON.parse(localStorage.getItem("favorites")!)
      : [];
  });
  const navigate = useNavigate();

  // Group duplicate items to ensure proper display.
  const groupedItems = groupCartItems(cartItems);

  // Update favorite state in localStorage.
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  // showToast helper: displays a toast and updates ARIA live region.
  const showToast = (message: string) => {
    setToast(message);
    setAriaAnnouncement(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Handle quantity update.
  const handleQuantityChange = (
    id: string,
    size: string,
    delta: number,
    itemName: string
  ) => {
    const item = groupedItems.find((i) => i.id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    updateQuantity(id, itemName, size, newQuantity);
    showToast(`Quantity updated for ${itemName}`);
    trackEvent("quantity_updated", { itemName, newQuantity });
  };

  // Handle item removal.
  const handleRemove = (id: string, itemName: string, size: string) => {
    removeItem(id, itemName, size);
    showToast(`Item removed from cart: ${itemName}`);
    trackEvent("item_removed", { itemName });
  };

  // Handle saving an item for later.
  const handleSaveForLater = (id: string, itemName: string, size: string) => {
    saveForLater(id, itemName, size);
    showToast(`${itemName} saved for later`);
    trackEvent("item_saved_for_later", { itemName });
  };

  // Handle coupon code application.
  const handleApplyCoupon = () => {
    const discountRate = applyCoupon(couponCode);
    setDiscount(discountRate);
    showToast(
      discountRate > 0 ? "Coupon applied: 10% off" : "Invalid coupon code"
    );
    trackEvent("coupon_applied", { couponCode, discountRate });
  };

  // Pricing calculations.
  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 0 && subtotal < 50 ? 5 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal + tax + shipping - discountAmount;

  // Navigation actions.
  const handleCheckout = () => {
    navigate("/checkout");
  };
  const handleContinueShopping = () => {
    navigate("/menu");
  };

  if (loading) return <p className="text-center p-4">Loading cart...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Cart Items */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)] mb-6">
          Your Cart
        </h2>
        {groupedItems.length === 0 ? (
          <>
            <p>Your cart is empty.</p>
            {/* Recommended for You (Optional) */}
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-2">
                Recommended for You
              </h3>
              <p className="text-sm">
                Check out our latest Nutcha Bite offerings to add to your cart.
              </p>
            </div>
          </>
        ) : (
          <ul className="grid grid-cols-1 gap-6">
            {groupedItems.map((item) => (
              <li
                key={item.id}
                className="relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
                // Use product image as background with a gradient overlay.
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-black/80"></div>
                {/* Overlaid product details */}

                {/* Icon buttons overlay arranged vertically at top-left */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1 z-20">
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label={
                      favorites.includes(item.id)
                        ? `Remove ${item.name} from favorites`
                        : `Add ${item.name} to favorites`
                    }
                  >
                    {favorites.includes(item.id) ? (
                      // Filled heart icon.
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    ) : (
                      // Outline heart icon.
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setViewProduct(item)}
                    className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label={`View product details for ${item.name}`}
                  >
                    {/* Eye icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[var(--color-accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                    onClick={() =>
                      handleRemove(item.id, item.name, item.size || "default")
                    }
                    className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    {/* Trash can icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v2H9V4a1 1 0 011-1z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleSaveForLater(
                        item.id,
                        item.name,
                        item.size || "default"
                      )
                    }
                    className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Save ${item.name} for later`}
                  >
                    {/* Bookmark icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
                      />
                    </svg>
                  </button>
                </div>
                {/* Overlaid product details */}
                <div className="relative z-10 pt-36 pb-4 px-4">
                  <p className="text-lg font-bold text-white">{item.name}</p>
                  {item.size && (
                    <p className="text-sm text-white">Size: {item.size}</p>
                  )}
                  <p className="text-sm text-white">
                    Unit Price: ${item.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-white">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                {/* Quantity Controls - Positioned at bottom center */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-20">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        item.size || "default",
                        -1,
                        item.name
                      )
                    }
                    className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-transform duration-200"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    –
                  </button>
                  <span className="text-white font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        item.size || "default",
                        1,
                        item.name
                      )
                    }
                    className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-transform duration-200"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Right Column: Sticky Checkout Summary */}
      <div className="lg:sticky lg:top-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
          <p className="text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="text-lg">Tax (10%): ${tax.toFixed(2)}</p>
          <p className="text-lg">Shipping: ${shipping.toFixed(2)}</p>
          {discount > 0 && (
            <p className="text-lg text-green-600">
              Discount: -${discountAmount.toFixed(2)}
            </p>
          )}
          <p className="text-2xl font-bold mt-4">Total: ${total.toFixed(2)}</p>
          {/* Coupon Code Input */}
          <div className="mt-4 flex items-center">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon Code"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              aria-label="Enter coupon code"
            />
            <button
              onClick={handleApplyCoupon}
              className="ml-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Apply coupon"
            >
              Apply
            </button>
          </div>
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
            <button
              onClick={handleContinueShopping}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] mb-4 sm:mb-0"
              aria-label="Continue shopping"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Proceed to Secure Checkout"
            >
              Proceed to Secure Checkout
            </button>
          </div>
          {/* Persuasive Banner */}
          {subtotal > 0 && subtotal < 50 && (
            <p className="mt-4 text-sm text-[var(--color-secondary)]">
              Free shipping on orders over $50!
            </p>
          )}
          {/* Clear Cart Button moved into Checkout Summary */}
          {groupedItems.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Clear cart"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>
      {/* ARIA live region for cart updates */}
      <div aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </div>
      {/* Toast Notification */}
      {toast && <Toast message={toast} />}
      {/* Confirm Clear Cart Modal */}
      {showConfirmModal && (
        <ConfirmModal
          name="Clear Cart"
          message="Are you sure you want to clear your cart?"
          onConfirm={() => {
            clearCart();
            setShowConfirmModal(false);
            showToast("Cart cleared");
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {/* View Product Modal */}
      {viewProduct && (
        <ViewProductModal
          item={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}
    </div>
  );
};

export default Cart;
