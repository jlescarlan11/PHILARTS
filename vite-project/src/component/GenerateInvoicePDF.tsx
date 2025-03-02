import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Ensure this plugin is installed for table formatting

// Define types for order details (assumed to be imported or declared elsewhere)
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

/**
 * generateInvoicePDF - Enhanced invoice generation function using jsPDF.
 *
 * This function accepts an order object (of type OrderDetails) and an optional flag
 * (printInsteadOfDownload) to either download the invoice as a PDF or trigger printing.
 *
 * Key Features:
 * - Uses jsPDF and the autoTable plugin to create a well-formatted invoice.
 * - Organizes the invoice into clearly defined sections with headers and dividers.
 * - Applies custom font sizes, colors, and draws lines for visual separation.
 * - Includes a header with the company name/logo.
 * - Constructs a dynamic filename based on the order number.
 * - Provides robust error handling.
 *
 * @param order - The order details to include in the invoice.
 * @param printInsteadOfDownload - (Optional) If true, triggers print; otherwise, downloads the PDF.
 */
const generateInvoicePDF = (
  order: OrderDetails,
  printInsteadOfDownload: boolean = false
): void => {
  try {
    if (!order) {
      throw new Error("Order details are missing.");
    }

    // Create a new jsPDF document.
    const doc = new jsPDF();

    // -------------------------
    // Header Section with Company Logo/Name
    // -------------------------
    doc.setFontSize(22);
    doc.setTextColor(40);
    // Centered company name; replace with logo if available.
    doc.text("Nutcha Bite", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Invoice", 105, 28, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32); // Divider line

    // -------------------------
    // Order Details Section
    // -------------------------
    doc.setFontSize(14);
    doc.text("Order Number:", 20, 42);
    doc.setFontSize(12);
    doc.text(`${order.orderNumber}`, 70, 42);
    doc.setFontSize(14);
    doc.text("Estimated Delivery:", 20, 50);
    doc.setFontSize(12);
    doc.text(`${order.estimatedDelivery}`, 70, 50);

    // -------------------------
    // Purchased Items Section using autoTable for neat alignment.
    // -------------------------
    const itemRows = order.items.map((item) => [
      item.name + (item.size ? ` (${item.size})` : ""),
      String(item.quantity),
      `$${item.price.toFixed(2)}`,
    ]);
    doc.autoTable({
      head: [["Item", "Quantity", "Unit Price"]],
      body: itemRows,
      startY: 60,
      theme: "striped",
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    // Retrieve the y-coordinate where the autoTable finished.
    const finalY = (doc as any).lastAutoTable.finalY || 70;

    // -------------------------
    // Billing Information Section
    // -------------------------
    doc.setFontSize(14);
    doc.text("Billing Information:", 20, finalY + 10);
    doc.setFontSize(12);
    doc.text(`Name: ${order.billing.fullName}`, 20, finalY + 18);
    doc.text(`Email: ${order.billing.email}`, 20, finalY + 26);
    doc.text(`Phone: ${order.billing.phone}`, 20, finalY + 34);
    doc.text(`Address: ${order.billing.address}`, 20, finalY + 42);
    doc.line(20, finalY + 46, 190, finalY + 46); // Divider

    // -------------------------
    // Shipping Information Section
    // -------------------------
    doc.setFontSize(14);
    doc.text("Shipping Information:", 20, finalY + 56);
    doc.setFontSize(12);
    doc.text(`Name: ${order.shipping.fullName}`, 20, finalY + 64);
    doc.text(
      `Address: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}`,
      20,
      finalY + 72
    );
    doc.line(20, finalY + 76, 190, finalY + 76); // Divider

    // -------------------------
    // Pricing Summary Section
    // -------------------------
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
    doc.line(20, finalY + 130, 190, finalY + 130); // Final Divider

    // -------------------------
    // Save or Print the Invoice
    // -------------------------
    const filename = `Invoice_Order_${order.orderNumber}.pdf`;
    if (printInsteadOfDownload) {
      // Auto-print the document.
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

export default generateInvoicePDF;
