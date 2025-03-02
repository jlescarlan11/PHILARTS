import React, { useState, useEffect, FormEvent, useRef } from "react";
import InputMask from "react-input-mask"; // For phone input masking
import { jsPDF } from "jspdf"; // For PDF generation

// Interface for form data
interface FormData {
  name: string;
  email: string;
  phone: string; // Added phone field
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

const ContactForm: React.FC = () => {
  // State declarations for form data, errors, submission status, and messages
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [, setErrorMsg] = useState<string>("");
  // Honeypot field for spam prevention (hidden from real users)
  const [honeypot, setHoneypot] = useState<string>("");
  // Modal state for confirmation on successful submission
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Reference for error summary to set focus after validation errors
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // ---------------------------
  // Autosave functionality: load saved data from localStorage on mount.
  useEffect(() => {
    const savedData = localStorage.getItem("contactFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem("contactFormData", JSON.stringify(formData));
  }, [formData]);

  // ---------------------------
  // Enhanced validation function with length constraints and format checks.
  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validate Name: required, between 2 and 50 characters.
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 50
    ) {
      newErrors.name = "Name must be between 2 and 50 characters";
    }

    // Validate Email: required and must be in valid email format.
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    // Validate Phone: optional but if provided must be 10 digits (US format).
    if (formData.phone.trim()) {
      // Remove non-digit characters and check length.
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }

    // Validate Subject: required, between 5 and 100 characters.
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    } else if (formData.subject.trim().length > 100) {
      newErrors.subject = "Subject must be less than 100 characters";
    }

    // Validate Message: required, between 10 and 500 characters.
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message must be less than 500 characters";
    }

    setErrors(newErrors);

    // If there are errors, focus on the error summary for accessibility.
    if (Object.keys(newErrors).length > 0) {
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      } else {
        // Fallback: focus the first invalid field.
        const firstKey = Object.keys(newErrors)[0];
        const element = document.querySelector(
          `[name="${firstKey}"]`
        ) as HTMLElement;
        if (element) element.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------
  // Handler for input changes, including for the honeypot field.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "website") {
      // Honeypot field (hidden from users)
      setHoneypot(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // ---------------------------
  // Function to generate a PDF of the form submission using jsPDF.
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Contact Form Submission", 10, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${formData.name}`, 10, 40);
    doc.text(`Email: ${formData.email}`, 10, 50);
    if (formData.phone) {
      doc.text(`Phone: ${formData.phone}`, 10, 60);
    }
    doc.text(`Subject: ${formData.subject}`, 10, 70);
    doc.text("Message:", 10, 80);
    // Split message text if too long.
    const splitMessage = doc.splitTextToSize(formData.message, 180);
    doc.text(splitMessage, 10, 90);
    doc.save("submission.pdf");
  };

  // ---------------------------
  // Form submission handler including sanitization and simulated backend call.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // If the honeypot field is filled, it's likely spam.
    if (honeypot) {
      return;
    }
    if (!validate()) return;

    setStatus("submitting");

    // Simulate a backend submission with a delay.
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% chance of success.
      if (success) {
        setStatus("success");
        // Clear autosaved data on successful submission.
        localStorage.removeItem("contactFormData");
        // Reset form to its initial state.
        setFormData(initialFormData);
        // Show modal confirmation with a preview of entered data.
        setModalVisible(true);
      } else {
        setStatus("error");
        setErrorMsg("Submission failed. Please try again.");
      }
    }, 1500);
  };

  // ---------------------------
  // Function to print a receipt. Dedicated print CSS should be added externally.
  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Contact Nutcha Bite</h2>
      {/* ARIA live region for error summary */}
      {status === "error" && (
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
        {/* Hidden honeypot field for spam prevention */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={handleChange}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Name Field with inline label and helper text */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)]"
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field with inline label and helper text */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)]"
            placeholder="example@domain.com"
          />
          <p className="text-gray-500 text-xs mt-1">
            Enter a valid email address
          </p>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field with inline label, helper text, and input mask */}
        <div className="mb-4">
          <label htmlFor="phone" className="block mb-1 font-medium">
            Phone (Optional)
          </label>
          <InputMask
            mask="(999) 999-9999"
            maskChar={null}
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          >
            {(inputProps: any) => (
              <input
                {...inputProps}
                type="text"
                aria-invalid={!!errors.phone}
                className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)]"
                placeholder="(123) 456-7890"
              />
            )}
          </InputMask>
          <p className="text-gray-500 text-xs mt-1">
            Enter a 10-digit phone number
          </p>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Subject Field with inline label and helper text */}
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
            aria-invalid={!!errors.subject}
            className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)]"
            placeholder="Brief subject of your message"
          />
          <p className="text-gray-500 text-xs mt-1">
            Between 5 and 100 characters
          </p>
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field with inline label, helper text, and character counter */}
        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            aria-invalid={!!errors.message}
            className="w-full p-2 border rounded focus:outline-none focus:border-[var(--color-accent)]"
            placeholder="Type your message here..."
            rows={4}
          />
          <div className="flex justify-between text-gray-500 text-xs mt-1">
            <span>Between 10 and 500 characters</span>
            <span>{formData.message.length} / 500</span>
          </div>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit button with spinner indicator during submission */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full flex items-center justify-center py-2 px-4 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors"
        >
          {status === "submitting" && (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
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
          )}
          {status === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Print & Download buttons for print receipt and PDF download (visible after successful submission) */}
      {status === "success" && (
        <div className="mt-4 flex justify-between">
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

      {/* Modal confirmation on successful submission showing a preview of entered data */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="relative bg-white p-6 rounded shadow-lg max-w-sm mx-auto text-center">
            <h3 className="text-xl font-bold mb-4 text-[var(--color-secondary)]">
              Thank You!
            </h3>
            <p className="mb-4 text-[var(--color-secondary)]">
              Your message has been sent successfully.
            </p>
            {/* Preview of the entered data */}
            <div className="text-left text-[var(--color-secondary)] text-sm">
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
            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 py-2 px-4 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
