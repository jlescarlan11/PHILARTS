import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../hooks/useCart";
// Use CartContext instead of useCart hook directly.
import { useCartContext } from "./CartContext";
import { HashLink } from "react-router-hash-link";
import { IoMdEye, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import {
  MdAdd,
  MdBookmarkAdd,
  MdBookmarkAdded,
  MdDelete,
  MdRemove,
} from "react-icons/md";

// -------------------------
// Analytics Tracker Utility
// -------------------------
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
  <div className="fixed bottom-14 right-4 bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 rounded shadow-md animate-fadeIn z-50">
    {message}
  </div>
);

// -------------------------
// ConfirmModal Component
// Custom modal to confirm cart clearance.
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
    <div className="relative bg-[var(--color-primary)] p-6 sm:p-8 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
      <h3
        id="confirm-modal-title"
        className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]"
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
          className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
          aria-label="Confirm clear cart"
        >
          Clear Cart
        </button>
      </div>
    </div>
  </div>
);

// -------------------------
// ViewProductModal Component
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
    <div className="relative bg-[var(--color-primary)] p-6 sm:p-8 rounded-lg max-w-md w-full z-10">
      <h3
        id="view-product-title"
        className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]"
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
        className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
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
// Modified to use CartContext via useCartContext.
const Cart: React.FC = () => {
  // Use CartContext to get shared cart state and methods.
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    applyCoupon,
    getSubtotal,
  } = useCartContext();
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
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    return localStorage.getItem("bookmarks")
      ? JSON.parse(localStorage.getItem("bookmarks")!)
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

  // Toggle bookmark state in localStorage.
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((bid) => bid !== id)
        : [...prev, id];
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  // Handle Save For Later: if already bookmarked, remove and show toast accordingly.
  const handleSaveForLater = (id: string, itemName: string, size: string) => {
    const isBookmarked = bookmarks.includes(id);
    toggleBookmark(id);
    saveForLater(id, itemName, size);
    if (isBookmarked) {
      showToast(`${itemName} is removed from favorites`);
      trackEvent("item_removed_from_saved", { itemName });
    } else {
      showToast(`${itemName} is added to favorites`);
      trackEvent("favorite_added", { itemName });
    }
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

  if (loading)
    return (
      <p className="text-center p-4 text-[var(--color-secondary)]">
        Loading cart...
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto min-h-screen p-4 sm:p-6 bg-[var(--color-primary)] grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Cart Items */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">
            Your Cart
          </h2>
          {groupedItems.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Clear cart"
            >
              Clear Cart
            </button>
          )}
        </div>
        {groupedItems.length === 0 ? (
          <>
            <p className="text-[var(--color-secondary)]">Your cart is empty.</p>
            <div className="mt-6 p-4 bg-[var(--color-primary)] rounded border">
              <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-2">
                Recommended for You
              </h3>
              <p className="text-sm text-[var(--color-secondary)]">
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
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[var(--color-tertiary-20)] via-[var(--color-tertiary-40)] to-[var(--color-tertiary-70)]"></div>
                <div className="relative z-10 pt-36 pb-4 px-4 text-[var(--color-primary)]">
                  <p className="text-lg sm:text-xl font-bold ">{item.name}</p>
                  {item.size && (
                    <p className="text-sm sm:text-base ">Size: {item.size}</p>
                  )}
                  <p className="text-sm sm:text-base">
                    Unit Price: ${item.price.toFixed(2)}
                  </p>
                  <p className="text-sm sm:text-base ">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex flex-col space-y-1 z-20">
                  <button
                    onClick={() => {
                      const alreadyFav = favorites.includes(item.id);
                      toggleFavorite(item.id);
                      if (alreadyFav) {
                        showToast(`${item.name} is removed from favorites`);
                        trackEvent("favorite_removed", { itemName: item.name });
                      } else {
                        showToast(`${item.name} is added to favorites`);
                        trackEvent("favorite_added", { itemName: item.name });
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                    aria-label={
                      favorites.includes(item.id)
                        ? `Remove ${item.name} from favorites`
                        : `Add ${item.name} to favorites`
                    }
                  >
                    {favorites.includes(item.id) ? (
                      <IoMdHeart className="text-red-500 text-xl" />
                    ) : (
                      <IoMdHeartEmpty className="text-[var(--color-primary)] text-xl" />
                    )}
                  </button>
                  <button
                    onClick={() => setViewProduct(item)}
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                    aria-label={`View product details for ${item.name}`}
                  >
                    <IoMdEye className="text-[var(--color-primary)] text-xl" />
                  </button>
                  <button
                    onClick={() =>
                      handleRemove(item.id, item.name, item.size || "default")
                    }
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <MdDelete className="text-[var(--color-primary)] text-xl" />
                  </button>
                  <button
                    onClick={() =>
                      handleSaveForLater(
                        item.id,
                        item.name,
                        item.size || "default"
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent)] rounded-full shadow hover:bg-[var(--color-accent-90)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                    aria-label={`Save ${item.name} for later`}
                  >
                    {bookmarks.includes(item.id) ? (
                      <MdBookmarkAdded className="text-[var(--color-primary)] text-xl" />
                    ) : (
                      <MdBookmarkAdd className="text-[var(--color-primary)] text-xl" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 flex bg-[var(--color-accent-10)] rounded-lg items-center space-x-2 z-20">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        item.size || "default",
                        -1,
                        item.name
                      )
                    }
                    className="px-2 py-2 bg-[var(--color-accent)] rounded-l-lg hover:bg-opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <MdRemove className="text-[var(--color-primary)]" />
                  </button>
                  <span className="text-[var(--color-primary)] w-4 text-center font-semibold">
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
                    className="px-2 py-2 bg-[var(--color-accent)] rounded-r-lg hover:bg-opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <MdAdd className="text-[var(--color-primary)]" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Right Column: Sticky Checkout Summary */}
      <div className="lg:sticky lg:top-6 mb-10 md:mb-0">
        <div className="bg-[var(--color-primary)] rounded-lg shadow p-6">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-[var(--color-secondary)]">
            Order Summary
          </h3>
          <p className="text-lg text-[var(--color-secondary)]">
            Subtotal: ${subtotal.toFixed(2)}
          </p>
          <p className="text-lg text-[var(--color-secondary)]">
            Tax (10%): ${tax.toFixed(2)}
          </p>
          <p className="text-lg text-[var(--color-secondary)]">
            Shipping: ${shipping.toFixed(2)}
          </p>
          {discount > 0 && (
            <p className="text-lg text-green-600">
              Discount: -${discountAmount.toFixed(2)}
            </p>
          )}
          <p className="text-2xl font-bold mt-4 text-[var(--color-secondary)]">
            Total: ${total.toFixed(2)}
          </p>
          {/* Coupon Code Input */}
          <div className="mt-4 flex flex-col sm:flex-row">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon Code"
              className="p-2 border border-[var(--color-secondary-50)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] flex-1 text-[var(--color-secondary)]"
              aria-label="Enter coupon code"
            />
            <button
              onClick={handleApplyCoupon}
              className="mt-2 sm:mt-0 sm:ml-2 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] w-full sm:w-auto"
              aria-label="Apply coupon"
            >
              Apply
            </button>
          </div>
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
            <HashLink
              smooth
              to="/#menu"
              className="w-full sm:w-auto px-6 py-3 text-center bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] mb-4 sm:mb-0"
              aria-label="Go to Menu"
            >
              Go to Menu
            </HashLink>
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Proceed to Secure Checkout"
            >
              Proceed to Secure Checkout
            </button>
          </div>
          {subtotal > 0 && subtotal < 50 && (
            <p className="mt-4 text-sm text-[var(--color-secondary)]">
              Free shipping on orders over $50!
            </p>
          )}
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </div>
      {toast && <Toast message={toast} />}
      {showConfirmModal && (
        <ConfirmModal
          name="Clear Cart"
          message="Are you sure you want to clear your cart?"
          onConfirm={() => {
            clearCart();
            setShowConfirmModal(false);
            setAriaAnnouncement("Cart cleared");
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
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
