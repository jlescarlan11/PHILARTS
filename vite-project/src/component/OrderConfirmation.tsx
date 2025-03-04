import { jsPDF } from "jspdf";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import autoTable from "jspdf-autotable";

// -------------------------
// TrackingModal Component
// -------------------------
interface TrackingModalProps {
  onClose: () => void;
  trackingNumber: string;
}
const TrackingModal: React.FC<TrackingModalProps> = ({
  onClose,
  trackingNumber,
}) => {
  const currentStatus = "In Transit";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
      aria-describedby="tracking-modal-description"
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-[var(--color-primary)] p-6 md:p-8 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
        <h3
          id="tracking-modal-title"
          className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]"
        >
          Track Your Order
        </h3>
        <p
          id="tracking-modal-description"
          className="mt-2 text-base md:text-lg text-[var(--color-secondary)]"
        >
          Tracking Number: <span className="font-bold">{trackingNumber}</span>
        </p>
        <p className="mt-2 text-base md:text-lg text-[var(--color-secondary)]">
          Current Status: {currentStatus}
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[var(--color-accent)] text-white rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Close tracking modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// OrderConfirmationModal Component
// -------------------------
interface OrderConfirmationModalProps {
  onConfirm: () => void;
  onClose: () => void;
}
const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  onConfirm,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="order-confirmation-modal-title"
    aria-describedby="order-confirmation-modal-description"
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onClose}
      aria-hidden="true"
    ></div>
    <div className="relative bg-[var(--color-primary)] p-6 md:p-8 rounded-lg max-w-md w-full z-10 transition-transform duration-300">
      <h3
        id="order-confirmation-modal-title"
        className="text-2xl md:text-3xl font-bold text-[var(--color-secondary)]"
      >
        Order Placed Successfully!
      </h3>
      <p
        id="order-confirmation-modal-description"
        className="mt-2 text-base md:text-lg text-[var(--color-secondary)]"
      >
        Thank you for your order. Your cart has been cleared.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onConfirm}
          className="w-full sm:w-auto px-5 py-2 bg-[var(--color-accent)] text-white rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Confirm order"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

// -------------------------
// OrderConfirmation Component
// -------------------------
interface OrderItem {
  id: string;
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderNumber: number;
  items: OrderItem[];
  billing: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  shipping: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    discountAmount: number;
    total: number;
  };
  estimatedDelivery: string;
}

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  useEffect(() => {
    const cachedOrder = localStorage.getItem("orderDetails");
    if (cachedOrder) {
      const parsedOrder = JSON.parse(cachedOrder) as OrderDetails;
      setOrder(parsedOrder);
      setTrackingNumber("TRK" + Math.floor(100000 + Math.random() * 900000));
    }
  }, []);

  const handleContinueShopping = () => {
    localStorage.removeItem("orderDetails");
    navigate("/");
  };

  const handleDownloadReceipt = (
    order: OrderDetails,
    printInsteadOfDownload: boolean = false
  ): void => {
    try {
      if (!order) {
        throw new Error("Order details are missing.");
      }
      const doc = new jsPDF();

      // Header Section
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("Nutcha Bite", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("Receipt", 105, 28, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Order Details Section
      doc.setFontSize(14);
      doc.text("Order Number:", 20, 42);
      doc.setFontSize(12);
      doc.text(`${order.orderNumber}`, 80, 42);
      doc.setFontSize(14);
      doc.text("Estimated Delivery:", 20, 50);
      doc.setFontSize(12);
      doc.text(`${order.estimatedDelivery}`, 80, 50);

      // Purchased Items Section using autoTable for layout.
      const itemRows = order.items.map((item) => [
        `${item.name}${item.size ? " (" + item.size + ")" : ""}`,
        String(item.quantity),
        `$${item.price.toFixed(2)}`,
      ]);
      autoTable(doc, {
        head: [["Item", "Quantity", "Unit Price"]],
        body: itemRows,
        startY: 60,
        theme: "grid",
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
      });
      const finalY = (doc as any).lastAutoTable.finalY || 70;

      // Billing Information Section
      doc.setFontSize(14);
      doc.text("Billing Information:", 20, finalY + 10);
      doc.setFontSize(12);
      doc.text(`Name: ${order.billing.fullName}`, 20, finalY + 18);
      doc.text(`Email: ${order.billing.email}`, 20, finalY + 26);
      doc.text(`Phone: ${order.billing.phone}`, 20, finalY + 34);
      doc.text(`Address: ${order.billing.address}`, 20, finalY + 42);
      doc.line(20, finalY + 46, 190, finalY + 46);

      // Shipping Information Section
      doc.setFontSize(14);
      doc.text("Shipping Information:", 20, finalY + 56);
      doc.setFontSize(12);
      doc.text(`Name: ${order.shipping.fullName}`, 20, finalY + 64);
      doc.text(
        `Address: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}`,
        20,
        finalY + 72
      );
      doc.line(20, finalY + 76, 190, finalY + 76);

      // Pricing Summary Section
      doc.setFontSize(14);
      doc.text("Pricing Summary:", 20, finalY + 86);
      doc.setFontSize(12);
      doc.text(
        `Subtotal: $${order.pricing.subtotal.toFixed(2)}`,
        20,
        finalY + 94
      );
      doc.text(`Tax (10%): $${order.pricing.tax.toFixed(2)}`, 20, finalY + 102);
      doc.text(
        `Shipping: $${order.pricing.shippingCost.toFixed(2)}`,
        20,
        finalY + 110
      );
      if (order.pricing.discount > 0) {
        doc.text(
          `Discount: -$${order.pricing.discountAmount.toFixed(2)}`,
          20,
          finalY + 118
        );
      }
      doc.text(`Total: $${order.pricing.total.toFixed(2)}`, 20, finalY + 126);
      doc.line(20, finalY + 130, 190, finalY + 130);

      // Footer / Thank You Note
      doc.setFontSize(12);
      doc.text("Thank you for your purchase!", 20, finalY + 138);

      // Save or Print the PDF
      const filename = `Receipt_Order_${order.orderNumber}.pdf`;
      if (printInsteadOfDownload) {
        doc.autoPrint();
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save(filename);
      }
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice. Please try again later.");
    }
  };

  const handleConfirmation = () => {
    localStorage.removeItem("orderDetails");
    setShowConfirmationModal(false);
    navigate("/order-confirmation");
  };

  if (!order) {
    return (
      <div className="bg-[var(--color-primary)] min-h-screen flex items-center justify-center p-6">
        <div className="bg-[var(--color-primary)] p-8 rounded-lg shadow-lg text-[var(--color-secondary)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            No Order Found
          </h2>
          <p className="mb-4">
            We couldn’t retrieve your order details. Please continue shopping.
          </p>
          <button
            onClick={handleContinueShopping}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Continue shopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[var(--color-primary)] min-h-screen mb-10 md:mb-0 p-4 md:p-6 lg:p-8">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto bg-[var(--color-primary)] rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
        <header className="flex flex-col md:flex-row items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2 text-[var(--color-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zM18 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z"
              />
            </svg>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-secondary)]">
              Order Confirmation
            </h1>
          </div>
        </header>
        <p className="text-lg md:text-xl mb-6 text-[var(--color-secondary)]">
          Your order has been placed successfully!
        </p>
        <section className="space-y-4">
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h3 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Order Number
            </h3>
            <p className="text-lg text-[var(--color-secondary)]">
              {order.orderNumber}
            </p>
          </div>
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h2 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Purchased Items
            </h2>
            <ul className="list-disc pl-6 text-[var(--color-secondary)]">
              {order.items.map((item) => (
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
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h2 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Billing Information
            </h2>
            <p className="text-sm text-[var(--color-secondary)]">
              Name: {order.billing.fullName}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Email: {order.billing.email}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Phone: {order.billing.phone}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Address: {order.billing.address}
            </p>
          </div>
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h2 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Shipping Information
            </h2>
            <p className="text-sm text-[var(--color-secondary)]">
              Name: {order.shipping.fullName}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Address: {order.shipping.address}, {order.shipping.city},{" "}
              {order.shipping.postalCode}
            </p>
          </div>
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h2 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Pricing Summary
            </h2>
            <p className="text-sm text-[var(--color-secondary)]">
              Subtotal: ${order.pricing.subtotal.toFixed(2)}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Tax (10%): ${order.pricing.tax.toFixed(2)}
            </p>
            <p className="text-sm text-[var(--color-secondary)]">
              Shipping: ${order.pricing.shippingCost.toFixed(2)}
            </p>
            {order.pricing.discount > 0 && (
              <p className="text-sm text-green-600">
                Discount: -${order.pricing.discountAmount.toFixed(2)}
              </p>
            )}
            <p className="text-lg font-bold text-[var(--color-secondary)]">
              Total: ${order.pricing.total.toFixed(2)}
            </p>
          </div>
          <div className="bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-md p-4">
            <h2 className="text-xl font-bold mb-2 text-[var(--color-secondary)]">
              Estimated Delivery Date
            </h2>
            <p className="text-sm text-[var(--color-secondary)]">
              {order.estimatedDelivery}
            </p>
          </div>
        </section>
        <section className="flex flex-col sm:flex-row sm:justify-between mt-6 space-y-4 sm:space-y-0">
          <button
            onClick={() => setShowTrackingModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Track Order"
          >
            Track Order
          </button>
          <button
            onClick={() => handleDownloadReceipt(order, false)}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Print Receipt"
          >
            Print Receipt
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Continue Shopping"
          >
            Continue Shopping
          </button>
        </section>
      </div>

      {/* Modals */}
      {showTrackingModal && (
        <TrackingModal
          trackingNumber={trackingNumber}
          onClose={() => setShowTrackingModal(false)}
        />
      )}
      {showConfirmationModal && (
        <OrderConfirmationModal
          onConfirm={handleConfirmation}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </main>
  );
};

export default OrderConfirmation;
