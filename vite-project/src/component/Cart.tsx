import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, useCart } from "../hooks/useCart";

// -------------------------
// Type Definitions
// -------------------------

// -------------------------
// Helper: groupCartItems
// Groups duplicate cart items (by name and price) by summing their quantities.
const groupCartItems = (items: CartItem[]): CartItem[] => {
  const grouped: Record<string, CartItem> = {};
  items.forEach((item) => {
    const key = `${item.name}-${item.price}`;
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
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onCancel}
      aria-hidden="true"
    ></div>
    <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
      <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
        {name}
      </h3>
      <p className="mt-2 text-[var(--color-secondary)]">{message}</p>
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
// Cart Component
// Displays cart items, pricing breakdown, and CTA buttons.
const Cart: React.FC = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    applyCoupon,
    setCartItems,
  } = useCart();
  const [toast, setToast] = useState<string>("");
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  // Group duplicate items.
  const groupedItems = groupCartItems(cartItems);

  // Show toast notifications for 3 seconds.
  const showToast = (message: string) => {
    setToast(message);
    setAriaAnnouncement(message);
    setTimeout(() => setToast(""), 3000);
  };

  // Handle quantity update with subtle animation feedback.
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
  };

  // Handle item removal.
  const handleRemove = (id: string, itemName: string, size: string) => {
    removeItem(id, itemName, size);
    showToast(`Item removed from cart: ${itemName}`);
  };

  // Handle saving item for later.
  const handleSaveForLater = (id: string, itemName: string, size: string) => {
    saveForLater(id, itemName, size);
    showToast(`${itemName} saved for later`);
  };

  // Apply coupon and update discount in real-time.
  const handleApplyCoupon = () => {
    const discountRate = applyCoupon(couponCode);
    setDiscount(discountRate);
    showToast(
      discountRate > 0 ? "Coupon applied: 10% off" : "Invalid coupon code"
    );
  };

  // Calculate pricing based on grouped items.
  const subtotal = groupedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 0 && subtotal < 50 ? 5 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal + tax + shipping - discountAmount;

  // Navigate to checkout view.
  const handleCheckout = () => {
    navigate("/checkout");
  };

  // Navigate to product catalog.
  const handleContinueShopping = () => {
    navigate("/menu");
  };

  if (loading) return <p className="text-center p-4">Loading cart...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[var(--color-primary)] text-[var(--color-secondary)] rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>
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
        <>
          <ul>
            {groupedItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 py-4"
              >
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-lg font-medium">{item.name}</p>
                    <p className="text-sm">
                      Unit Price: ${item.price.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  {/* Quantity Controls */}
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.size, -1, item.name)
                    }
                    className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transform transition-transform duration-200"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    –
                  </button>
                  <span className="px-4 py-1 border-t border-b border-gray-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.size, 1, item.name)
                    }
                    className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transform transition-transform duration-200"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.name, item.size)}
                    className="ml-4 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() =>
                      handleSaveForLater(item.id, item.name, item.size)
                    }
                    className="ml-4 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Save ${item.name} for later`}
                  >
                    Save for Later
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* Pricing Breakdown */}
          <div className="mt-6 border-t pt-4">
            <p className="text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
            <p className="text-lg">Tax (10%): ${tax.toFixed(2)}</p>
            <p className="text-lg">Shipping: ${shipping.toFixed(2)}</p>
            {discount > 0 && (
              <p className="text-lg text-green-600">
                Discount: -${discountAmount.toFixed(2)}
              </p>
            )}
            <p className="text-2xl font-bold mt-2">
              Total: ${total.toFixed(2)}
            </p>
          </div>
          {/* Coupon Code Input with Live Discount Preview */}
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
          {/* Clear Cart Button with Custom Modal Confirmation */}
          {groupedItems.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Clear cart"
            >
              Clear Cart
            </button>
          )}
        </>
      )}
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
    </div>
  );
};

export default Cart;
