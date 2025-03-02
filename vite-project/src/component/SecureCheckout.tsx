import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, useCart } from "../hooks/useCart";

// -------------------------
// Type Definitions for Checkout Form
// -------------------------
type CheckoutStep = 1 | 2 | 3 | 4;

export interface BillingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

// -------------------------
// Input Formatting Helpers
// These functions help format inputs as the user types.
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").substring(0, 16);
  let formatted = "";
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += " ";
    formatted += cleaned[i];
  }
  return formatted;
};

const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").substring(0, 4);
  if (cleaned.length < 3) return cleaned;
  return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
};

const formatCVV = (value: string): string =>
  value.replace(/\D/g, "").substring(0, 4);

const formatPostalCode = (value: string): string =>
  value.replace(/\D/g, "").substring(0, 4);

// -------------------------
// Analytics Tracker Utility
// Logs interaction events.
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
  <div className="fixed bottom-4 right-4 bg-[var(--color-accent)] text-white px-4 py-2 rounded shadow-md animate-fadeIn">
    {message}
  </div>
);

// -------------------------
// ConfirmModal Component
// Reusable modal for confirming actions.
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Confirm order"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

// -------------------------
// OrderConfirmationModal Component
// Displays order confirmation details and clears the cart.
const OrderConfirmationModal: React.FC<{
  onConfirm: () => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="order-confirmation-title"
    aria-describedby="order-confirmation-description"
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onClose}
      aria-hidden="true"
    ></div>
    <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
      <h3
        id="order-confirmation-title"
        className="text-2xl font-bold text-[var(--color-secondary)]"
      >
        Order Placed Successfully!
      </h3>
      <p
        id="order-confirmation-description"
        className="mt-2 text-[var(--color-secondary)]"
      >
        Thank you for your order. Your cart has been cleared.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Close confirmation"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

// -------------------------
// BillingForm Component
// Renders the Billing Details step with explicit labels and persistent guidance.
const BillingForm: React.FC<{
  billing: BillingDetails;
  setBilling: React.Dispatch<React.SetStateAction<BillingDetails>>;
  errors: Record<string, string>;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ billing, setBilling, errors, firstInputRef }) => (
  <div className="bg-gradient-to-b from-white/80 to-gray-200 p-6 rounded-lg shadow mb-6">
    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
      Billing Details
    </h2>
    <label
      htmlFor="billing-fullName"
      className="block text-sm font-medium text-gray-700"
    >
      Full Name
    </label>
    <input
      id="billing-fullName"
      type="text"
      value={billing.fullName}
      onChange={(e) => setBilling({ ...billing, fullName: e.target.value })}
      ref={firstInputRef}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="billing-fullname-error"
    />
    {errors.fullName && (
      <p id="billing-fullname-error" className="text-red-500 text-sm">
        {errors.fullName}
      </p>
    )}
    <label
      htmlFor="billing-email"
      className="block text-sm font-medium text-gray-700"
    >
      Email
    </label>
    <input
      id="billing-email"
      type="email"
      value={billing.email}
      onChange={(e) => setBilling({ ...billing, email: e.target.value })}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
    <label
      htmlFor="billing-phone"
      className="block text-sm font-medium text-gray-700"
    >
      Phone
    </label>
    <input
      id="billing-phone"
      type="tel"
      value={billing.phone}
      onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
    <label
      htmlFor="billing-address"
      className="block text-sm font-medium text-gray-700"
    >
      Address
    </label>
    <input
      id="billing-address"
      type="text"
      value={billing.address}
      onChange={(e) => setBilling({ ...billing, address: e.target.value })}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
  </div>
);

// -------------------------
// ShippingForm Component
// Renders the Shipping Information step with explicit labels and persistent guidance.
const ShippingForm: React.FC<{
  shipping: ShippingInfo;
  setShipping: React.Dispatch<React.SetStateAction<ShippingInfo>>;
  errors: Record<string, string>;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ shipping, setShipping, errors, firstInputRef }) => (
  <div className="bg-gradient-to-b from-white/80 to-gray-200 p-6 rounded-lg shadow mb-6">
    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
      Shipping Information
    </h2>
    <label
      htmlFor="shipping-fullName"
      className="block text-sm font-medium text-gray-700"
    >
      Full Name
    </label>
    <input
      id="shipping-fullName"
      type="text"
      value={shipping.fullName}
      onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
      ref={firstInputRef}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.shippingFullName && (
      <p className="text-red-500 text-sm">{errors.shippingFullName}</p>
    )}
    <label
      htmlFor="shipping-address"
      className="block text-sm font-medium text-gray-700"
    >
      Address
    </label>
    <input
      id="shipping-address"
      type="text"
      value={shipping.address}
      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.shippingAddress && (
      <p className="text-red-500 text-sm">{errors.shippingAddress}</p>
    )}
    <label
      htmlFor="shipping-city"
      className="block text-sm font-medium text-gray-700"
    >
      City
    </label>
    <input
      id="shipping-city"
      type="text"
      value={shipping.city}
      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
      className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
    />
    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
    <label
      htmlFor="shipping-postalCode"
      className="block text-sm font-medium text-gray-700"
    >
      Postal Code
    </label>
    <input
      id="shipping-postalCode"
      type="text"
      value={formatPostalCode(shipping.postalCode)}
      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
      className="w-full p-2 mb-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="postal-code-guide"
    />
    <p id="postal-code-guide" className="text-xs text-gray-500 mb-2">
      Format: 4 digits (e.g., "1234")
    </p>
    {errors.postalCode && (
      <p className="text-red-500 text-sm">{errors.postalCode}</p>
    )}
  </div>
);

// -------------------------
// PaymentForm Component
// Renders the Payment Details step with explicit labels, input masks, and persistent guidance.
const PaymentForm: React.FC<{
  payment: PaymentDetails;
  setPayment: React.Dispatch<React.SetStateAction<PaymentDetails>>;
  errors: Record<string, string>;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ payment, setPayment, errors, firstInputRef }) => (
  <div className="bg-gradient-to-b from-white/80 to-gray-200 p-6 rounded-lg shadow mb-6">
    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4 flex items-center">
      Payment Details{" "}
      <span className="ml-2 inline-flex items-center text-green-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zM18 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z"
          />
        </svg>
        Secure
      </span>
    </h2>
    <label
      htmlFor="payment-cardNumber"
      className="block text-sm font-medium text-gray-700"
    >
      Card Number
    </label>
    <input
      id="payment-cardNumber"
      type="text"
      placeholder="____ ____ ____ ____"
      value={formatCardNumber(payment.cardNumber)}
      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
      ref={firstInputRef}
      className="w-full p-2 mb-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="card-number-guide"
    />
    <p id="card-number-guide" className="text-xs text-gray-500 mb-2">
      Format: 1234 5678 9012 3456
    </p>
    {errors.cardNumber && (
      <p className="text-red-500 text-sm">{errors.cardNumber}</p>
    )}
    <label
      htmlFor="payment-expiryDate"
      className="block text-sm font-medium text-gray-700"
    >
      Expiry Date
    </label>
    <input
      id="payment-expiryDate"
      type="text"
      placeholder="MM/YY"
      value={formatExpiryDate(payment.expiryDate)}
      onChange={(e) => setPayment({ ...payment, expiryDate: e.target.value })}
      className="w-full p-2 mb-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="expiry-date-guide"
    />
    <p id="expiry-date-guide" className="text-xs text-gray-500 mb-2">
      Format: MM/YY
    </p>
    {errors.expiryDate && (
      <p className="text-red-500 text-sm">{errors.expiryDate}</p>
    )}
    <label
      htmlFor="payment-cvv"
      className="block text-sm font-medium text-gray-700"
    >
      CVV
    </label>
    <input
      id="payment-cvv"
      type="text"
      placeholder="___"
      value={formatCVV(payment.cvv)}
      onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
      className="w-full p-2 mb-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="cvv-guide"
    />
    <p id="cvv-guide" className="text-xs text-gray-500 mb-2">
      Format: 3-4 digits
    </p>
    {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
    <label
      htmlFor="payment-cardName"
      className="block text-sm font-medium text-gray-700"
    >
      Name on Card
    </label>
    <input
      id="payment-cardName"
      type="text"
      placeholder="Name on Card"
      value={payment.cardName}
      onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      required
      aria-describedby="card-name-guide"
    />
    <p id="card-name-guide" className="text-xs text-gray-500 mb-2">
      Must match Billing Full Name
    </p>
    {errors.cardName && (
      <p className="text-red-500 text-sm">{errors.cardName}</p>
    )}
  </div>
);

// -------------------------
// CompletedOrderDetails Component
// Displays the completed order details with an order number, detailed items list, billing/shipping info, and an estimated delivery date.

// -------------------------
// SecureCheckout Component
// Implements the multi-step checkout form with a modern card-like layout,
// robust input validation/guidance, dynamic order details, and an order confirmation modal.
const SecureCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getSubtotal } = useCart();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [billing, setBilling] = useState<BillingDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [payment, setPayment] = useState<PaymentDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [ariaMessage, setAriaMessage] = useState("");
  const [, setPaymentSuccess] = useState(false);
  const [toast, setToast] = useState("");
  // State for the order confirmation and clear cart modals.
  const [showOrderConfirmationModal, setShowOrderConfirmationModal] =
    useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  // Ref for focus management.
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  useEffect(() => {
    setOrderNumber(`${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  // Shift focus to the first input on step change.
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  // Validate inputs for the current step.
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;
    if (step === 1) {
      if (!billing.fullName) {
        newErrors.fullName = "Full name is required";
        valid = false;
      }
      if (!billing.email) {
        newErrors.email = "Email is required";
        valid = false;
      }
      if (!billing.phone) {
        newErrors.phone = "Phone is required";
        valid = false;
      }
      if (!billing.address) {
        newErrors.address = "Address is required";
        valid = false;
      }
    } else if (step === 2) {
      if (!shipping.fullName) {
        newErrors.shippingFullName = "Full name is required";
        valid = false;
      }
      if (!shipping.address) {
        newErrors.shippingAddress = "Address is required";
        valid = false;
      }
      if (!shipping.city) {
        newErrors.city = "City is required";
        valid = false;
      }
      if (!/^\d{4}$/.test(shipping.postalCode)) {
        newErrors.postalCode = "Postal code must be exactly 4 digits";
        valid = false;
      }
    } else if (step === 3) {
      if (!/^\d{16}$/.test(payment.cardNumber.replace(/\s+/g, ""))) {
        newErrors.cardNumber = "Card number must be exactly 16 digits";
        valid = false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiryDate)) {
        newErrors.expiryDate = "Expiry date must be in MM/YY format";
        valid = false;
      }
      if (!/^\d{3,4}$/.test(payment.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits";
        valid = false;
      }
      if (
        payment.cardName.trim().toLowerCase() !==
        billing.fullName.trim().toLowerCase()
      ) {
        newErrors.cardName = "Name on card must match Billing Full Name";
        valid = false;
      }
    }
    setErrors(newErrors);
    if (!valid)
      setAriaMessage(
        "Please fill in all required fields correctly for this step."
      );
    return valid;
  };

  // Handler to move to the next step.
  const handleNext = async () => {
    if (!validateStep()) return;
    if (step === 3) {
      setProcessing(true);
      setAriaMessage("Processing payment...");
      // Simulate secure payment processing.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessing(false);
      setPaymentSuccess(true);
      setAriaMessage("Payment processed successfully.");
    }
    setStep((prev) => (prev < 4 ? ((prev + 1) as CheckoutStep) : prev));
    setAriaMessage("");
    trackEvent("step_transition", { step: step + 1 });
  };

  // Handler to move back a step.
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as CheckoutStep);
      setAriaMessage("");
      trackEvent("step_transition", { step: step - 1 });
    }
  };

  // Handler to place the order and show confirmation modal.
  const handlePlaceOrder = () => {
    setShowOrderConfirmationModal(true);
    trackEvent("order_placed", { orderTotal: total });
  };

  // Toast helper for feedback.
  const showToast = (message: string) => {
    setToast(message);
    setAriaMessage(message);
    setTimeout(() => setToast(""), 3000);
  };

  // When order confirmation modal is confirmed, clear the cart and navigate.
  // Inside SecureCheckout component, update the order confirmation handler:
  const handleOrderConfirmation = () => {
    // For the purpose of this example, we'll group the cart items
    const groupedItems = groupCartItems(cartItems);
    // Compute an estimated delivery date (e.g., current date + 5 days)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
    const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString();

    // Build the order object
    const order = {
      orderNumber,
      items: groupedItems,
      billing,
      shipping,
      pricing: {
        subtotal,
        tax,
        shippingCost,
        discount,
        discountAmount,
        total,
      },
      estimatedDelivery: formattedDeliveryDate,
    };

    // Store the order details in local storage for later retrieval
    localStorage.setItem("orderDetails", JSON.stringify(order));

    // Clear the cart and close the confirmation modal
    clearCart();
    setShowOrderConfirmationModal(false);
    showToast("Order placed successfully!");

    // Navigate to the Order Confirmation view (or simply display the modal)
    navigate("/order-confirmation");
  };

  // Dynamic pricing calculations using cart data.
  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const shippingCost = subtotal < 50 ? 5 : 0;
  const discount = 0;
  const discountAmount = subtotal * discount;
  const total = subtotal + tax + shippingCost - discountAmount;
  // Get grouped cart items for detailed order review.
  const groupedItems = groupCartItems(cartItems);

  return (
    <div className="bg-[var(--color-primary)] min-h-screen p-6">
      {/* ARIA live region for dynamic updates */}
      <div aria-live="polite" className="sr-only">
        {ariaMessage}
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {["Billing", "Shipping", "Payment", "Review"].map((label, index) => (
            <div
              key={index}
              className={`flex-1 text-center py-2 border-b-4 ${
                step === index + 1
                  ? "border-[var(--color-accent)] text-[var(--color-secondary)] font-bold"
                  : "border-gray-300 text-gray-500"
              }`}
              aria-label={`Step ${index + 1}: ${label}`}
            >
              {label}
            </div>
          ))}
        </div>
        {/* Multi-Step Form */}
        {step === 1 && (
          <BillingForm
            billing={billing}
            setBilling={setBilling}
            errors={errors}
            firstInputRef={firstInputRef}
          />
        )}
        {step === 2 && (
          <ShippingForm
            shipping={shipping}
            setShipping={setShipping}
            errors={errors}
            firstInputRef={firstInputRef}
          />
        )}
        {step === 3 && (
          <PaymentForm
            payment={payment}
            setPayment={setPayment}
            errors={errors}
            firstInputRef={firstInputRef}
          />
        )}
        {step === 4 && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {/* Completed Order Details View */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                  Completed Order Details
                </h2>
                {/* Generate a random order number */}
                <p className="mb-2">
                  Order Number: <span className="font-bold">{orderNumber}</span>
                </p>
                {/* Detailed list of purchased items */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-secondary)]">
                    Purchased Items
                  </h3>
                  <ul className="list-disc ml-6">
                    {groupedItems.map((item) => (
                      <li
                        key={`${item.id}-${item.size || "default"}`}
                        className="text-sm"
                      >
                        {item.name} {item.size && `(${item.size})`} – Qty:{" "}
                        {item.quantity} – ${item.price.toFixed(2)} each
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-secondary)]">
                    Billing Information
                  </h3>
                  <p className="text-sm">Name: {billing.fullName}</p>
                  <p className="text-sm">Email: {billing.email}</p>
                  <p className="text-sm">Phone: {billing.phone}</p>
                  <p className="text-sm">Address: {billing.address}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-secondary)]">
                    Shipping Information
                  </h3>
                  <p className="text-sm">Name: {shipping.fullName}</p>
                  <p className="text-sm">
                    Address: {shipping.address}, {shipping.city},{" "}
                    {shipping.postalCode}
                  </p>
                </div>
                {/* Estimated delivery date (e.g., current date + 5 days) */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-secondary)]">
                    Estimated Delivery
                  </h3>
                  <p className="text-sm">
                    {new Date(
                      new Date().setDate(new Date().getDate() + 5)
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {/* Sticky Sidebar Order Summary */}
            <div className="w-full lg:w-1/3 sticky top-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
              <p className="text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
              <p className="text-lg">Tax (10%): ${tax.toFixed(2)}</p>
              <p className="text-lg">Shipping: ${shippingCost.toFixed(2)}</p>
              {discount > 0 && (
                <p className="text-lg text-green-600">
                  Discount: -${discountAmount.toFixed(2)}
                </p>
              )}
              <p className="text-2xl font-bold mt-4">
                Total: ${total.toFixed(2)}
              </p>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Clear cart"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Go back to previous step"
            >
              Back
            </button>
          )}
          {step < 4 && (
            <button
              onClick={handleNext}
              className="ml-auto px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Continue to next step"
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button
              onClick={handlePlaceOrder}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Place order"
            >
              Place Order
            </button>
          )}
        </div>
      </div>
      {/* Toast Notification */}
      {toast && <Toast message={toast} />}
      {/* ARIA live region for dynamic updates */}
      <div aria-live="polite" className="sr-only">
        {ariaMessage}
      </div>
      {/* Order Confirmation Modal */}
      {showOrderConfirmationModal && (
        <OrderConfirmationModal
          onConfirm={handleOrderConfirmation}
          onClose={() => setShowOrderConfirmationModal(false)}
        />
      )}
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

export default SecureCheckout;
