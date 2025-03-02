import React, { useState, useEffect, FormEvent, useRef } from "react";
import { IMaskInput } from "react-imask"; // Using react-imask for React 18 compatibility
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import autotable plugin for structured PDF layout

// ---------------------------------------------------------
// ErrorBoundary Component with improved logging and user-friendly fallback
// ---------------------------------------------------------
class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Log error details to the console or an external service.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // TODO: Integrate with an external logging service here.
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700">
          Oops! Something went wrong. Please try refreshing the page or contact
          support.
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------
// Interface for form data
// ---------------------------------------------------------
interface FormData {
  name: string;
  email: string;
  phone: string; // Phone field (with input mask)
  subject: string;
  message: string;
}

// Initial form data values
const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// Basic sanitization function to escape HTML tags (avoids XSS)

const ContactForm: React.FC = () => {
  // ---------------------------------------------------------
  // State declarations for form data, errors, status, etc.
  // ---------------------------------------------------------
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [, setErrorMsg] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>(""); // Hidden spam prevention field
  const [captchaChecked, setCaptchaChecked] = useState<boolean>(false); // Simple CAPTCHA checkbox
  const [previewModalVisible, setPreviewModalVisible] =
    useState<boolean>(false); // Preview modal before final submission
  const [finalModalVisible, setFinalModalVisible] = useState<boolean>(false); // Final modal after successful submission
  const [autosaveFeedback, setAutosaveFeedback] = useState<string>("");
  // Tracks which input field is focused for dynamic tooltips.
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Ref for error summary for accessibility focus management
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // Autosave: Load saved form data from localStorage on mount.
  // ---------------------------------------------------------
  useEffect(() => {
    const savedData = localStorage.getItem("contactFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Autosave: Save form data on each change and display brief feedback.
  useEffect(() => {
    localStorage.setItem("contactFormData", JSON.stringify(formData));
    setAutosaveFeedback("Your data has been autosaved.");
    const timer = setTimeout(() => setAutosaveFeedback(""), 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // ---------------------------------------------------------
  // Dynamic inline validation: run validation on every change.
  // ---------------------------------------------------------
  useEffect(() => {
    // Call validate without focusing error summary (only update errors)
    const newErrors: Record<string, string> = {};

    // Validate Name: required; 2-50 characters.
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 50
    ) {
      newErrors.name = "Name must be between 2 and 50 characters.";
    }

    // Validate Email: required; valid format; no consecutive dots.
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email =
        "Please enter a valid email (e.g., example@domain.com).";
    } else if (formData.email.includes("..")) {
      newErrors.email = "Email should not contain consecutive dots.";
    }

    // Validate Phone: optional; if provided, must have exactly 10 digits.
    if (formData.phone.trim()) {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.phone = "Phone number must contain exactly 10 digits.";
      }
    }

    // Validate Subject: required; 5-100 characters.
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters.";
    } else if (formData.subject.trim().length > 100) {
      newErrors.subject = "Subject must be less than 100 characters.";
    }

    // Validate Message: required; 10-500 characters.
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message must be less than 500 characters.";
    }

    // Validate CAPTCHA: must be checked.
    if (!captchaChecked) {
      newErrors.captcha = "Please verify that you are not a robot.";
    }

    setErrors(newErrors);
  }, [formData, captchaChecked]);

  // ---------------------------------------------------------
  // validate() used on form submission to check for errors and manage focus.
  // ---------------------------------------------------------
  const validate = (): boolean => {
    if (Object.keys(errors).length > 0) {
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return false;
    }
    return true;
  };

  // ---------------------------------------------------------
  // Handler for input changes; updates formData and manages honeypot.
  // ---------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "website") {
      // Honeypot field (hidden)
      setHoneypot(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handler for CAPTCHA checkbox changes.
  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptchaChecked(e.target.checked);
  };

  // ---------------------------------------------------------
  // Generate a professional PDF invoice using jsPDF and autotable.
  // ---------------------------------------------------------
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header: Company logo or name
    doc.setFontSize(22);
    doc.text("Nutcha Bite", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Invoice", 105, 25, { align: "center" });

    // Use autotable for Contact Details & Message
    (doc as any).autoTable({
      head: [["Field", "Value"]],
      body: [
        ["Name", formData.name],
        ["Email", formData.email],
        ["Phone", formData.phone || "N/A"],
        ["Subject", formData.subject],
        ["Message", formData.message],
      ],
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer: Pricing Summary (dummy data)
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("Pricing Summary", 10, finalY + 20);
    doc.setFontSize(12);
    doc.text("Subtotal: $100.00", 10, finalY + 30);
    doc.text("Tax: $8.25", 10, finalY + 40);
    doc.text("Total: $108.25", 10, finalY + 50);

    doc.save("invoice.pdf");
  };

  // ---------------------------------------------------------
  // Print function: refined print CSS for a clean, professional receipt.
  // ---------------------------------------------------------
  const printReceipt = () => {
    window.print();
  };

  // ---------------------------------------------------------
  // Final submission: called after user confirms the preview modal.
  // ---------------------------------------------------------
  const handleFinalSubmit = () => {
    setPreviewModalVisible(false);
    setStatus("submitting");

    // Sanitize form data before submission.

    // Simulate backend submission with a progress indicator.
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% chance of success.
      if (success) {
        setStatus("success");
        localStorage.removeItem("contactFormData");
        setFinalModalVisible(true);
        setFormData(initialFormData);
      } else {
        setStatus("error");
        setErrorMsg("Submission failed. Please try again.");
      }
    }, 1500);
  };

  // ---------------------------------------------------------
  // Main submission handler: validates inputs then shows preview modal.
  // ---------------------------------------------------------
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Prevent spam submissions.
    if (!validate()) return;
    setPreviewModalVisible(true);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-lg mx-auto p-6 bg-gradient-to-br from-gray-100 to-gray-200 text-[var(--color-secondary)] shadow-md rounded">
        {/* Improved Print Styles */}
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .printable, .printable * {
                visibility: visible;
              }
              .printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}
        </style>
        <h2 className="text-2xl font-bold mb-4">Contact Nutcha Bite</h2>

        {/* Autosave Feedback */}
        {autosaveFeedback && (
          <p className="text-green-600 text-sm mb-2" role="status">
            {autosaveFeedback}
          </p>
        )}

        {/* ARIA live error summary */}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            ref={errorSummaryRef}
            className="mb-4 p-2 border border-red-500 rounded bg-red-100 text-red-700"
          >
            <p>Please fix the following errors:</p>
            <ul className="list-disc list-inside">
              {Object.values(errors).map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Hidden honeypot for spam prevention */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name Field with dynamic tooltip on focus */}
          <div className="mb-4 relative">
            <label htmlFor="name" className="block mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={!!errors.name}
              aria-describedby="name-helper"
              className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)] transition duration-300"
              placeholder="John Doe"
            />
            {/* Tooltip: appears when field is focused */}
            {focusedField === "name" && (
              <div className="absolute top-0 right-0 mt-2 mr-2 p-1 bg-blue-100 text-blue-700 text-xs rounded shadow">
                Enter your full name.
              </div>
            )}
            <p id="name-helper" className="text-gray-500 text-xs mt-1">
              e.g., John Doe
            </p>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field with dynamic tooltip on focus */}
          <div className="mb-4 relative">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={!!errors.email}
              aria-describedby="email-helper"
              className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)] transition duration-300"
              placeholder="example@domain.com"
            />
            {focusedField === "email" && (
              <div className="absolute top-0 right-0 mt-2 mr-2 p-1 bg-blue-100 text-blue-700 text-xs rounded shadow">
                Enter a valid email.
              </div>
            )}
            <p id="email-helper" className="text-gray-500 text-xs mt-1">
              e.g., example@domain.com
            </p>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field with dynamic tooltip on focus */}
          <div className="mb-4 relative">
            <label htmlFor="phone" className="block mb-1 font-medium">
              Phone (Optional)
            </label>
            <IMaskInput
              mask="(000) 000-0000"
              value={formData.phone}
              unmask={false}
              onAccept={(value) => setFormData({ ...formData, phone: value })}
              id="phone"
              name="phone"
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="(123) 456-7890"
              className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)] transition duration-300"
            />
            {focusedField === "phone" && (
              <div className="absolute top-0 right-0 mt-2 mr-2 p-1 bg-blue-100 text-blue-700 text-xs rounded shadow">
                Format: (123) 456-7890
              </div>
            )}
            <p id="phone-helper" className="text-gray-500 text-xs mt-1">
              Enter a 10-digit phone number.
            </p>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div className="mb-4">
            <label htmlFor="subject" className="block mb-1 font-medium">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onFocus={() => setFocusedField("subject")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={!!errors.subject}
              aria-describedby="subject-helper"
              className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)] transition duration-300"
              placeholder="Brief subject of your message"
            />
            {focusedField === "subject" && (
              <div className="absolute top-0 right-0 mt-2 mr-2 p-1 bg-blue-100 text-blue-700 text-xs rounded shadow">
                Provide a concise subject.
              </div>
            )}
            <p id="subject-helper" className="text-gray-500 text-xs mt-1">
              5-100 characters.
            </p>
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="mb-4">
            <label htmlFor="message" className="block mb-1 font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={!!errors.message}
              aria-describedby="message-helper"
              className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)] transition duration-300"
              placeholder="Type your message here..."
              rows={4}
            />
            <div className="flex justify-between text-gray-500 text-xs mt-1">
              <span id="message-helper">10-500 characters</span>
              <span>{formData.message.length} / 500</span>
            </div>
            {errors.message && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {/* CAPTCHA Checkbox */}
          <div className="mb-4">
            <input
              type="checkbox"
              id="captcha"
              name="captcha"
              checked={captchaChecked}
              onChange={handleCaptchaChange}
              aria-invalid={!!errors.captcha}
              className="mr-2"
            />
            <label htmlFor="captcha" className="font-medium">
              I am not a robot
            </label>
            {errors.captcha && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.captcha}
              </p>
            )}
          </div>

          {/* Submit Button with spinner and progress indicator */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full flex items-center justify-center py-2 px-4 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors relative"
          >
            {status === "submitting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>
            )}
            <span className={status === "submitting" ? "invisible" : "visible"}>
              {status === "submitting" ? "Sending..." : "Send Message"}
            </span>
          </button>
        </form>

        {/* Print & Download buttons (shown after successful submission) */}
        {status === "success" && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
            <button
              onClick={printReceipt}
              className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={downloadPDF}
              className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download Confirmation
            </button>
          </div>
        )}

        {/* Preview Modal: Displays entered data for confirmation before final submission */}
        {previewModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
            {/* Modal Backdrop */}
            <div className="absolute inset-0 bg-black opacity-50 transition-opacity"></div>
            {/* Modal Content with smooth animation */}
            <div className="relative bg-white p-6 rounded shadow-lg max-w-sm mx-auto text-left transform transition-all duration-300 ease-out scale-95">
              <h3 className="text-xl font-bold mb-4 text-[var(--color-secondary)]">
                Confirm Your Submission
              </h3>
              <div className="mb-4 text-[var(--color-secondary)] text-sm">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                {formData.phone && (
                  <p>
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                )}
                <p>
                  <strong>Subject:</strong> {formData.subject}
                </p>
                <p>
                  <strong>Message:</strong> {formData.message}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setPreviewModalVisible(false)}
                  className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="py-2 px-4 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal: Displays after successful submission with improved focus management */}
        {finalModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
            {/* Modal Backdrop */}
            <div className="absolute inset-0 bg-black opacity-50 transition-opacity"></div>
            {/* Modal Content with smooth animation */}
            <div className="relative bg-white p-6 rounded shadow-lg max-w-sm mx-auto text-center transform transition-all duration-300 ease-out scale-95">
              <h3 className="text-xl font-bold mb-4 text-[var(--color-secondary)]">
                Thank You!
              </h3>
              <p className="mb-4 text-[var(--color-secondary)]">
                Your message has been sent successfully.
              </p>
              <button
                onClick={() => setFinalModalVisible(false)}
                className="mt-4 py-2 px-4 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ContactForm;
