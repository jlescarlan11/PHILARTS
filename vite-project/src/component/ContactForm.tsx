// File: ContactForm.tsx
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sanitizeHtml from "sanitize-html";
import FormField from "./FormField";
import ErrorSummary from "./ErrorSummary";
import { useAutoSave } from "../hooks/useAutoSave";
import { useExitIntent } from "../hooks/useExitIntent";
import { trackEvent } from "../utils/analytics";
import { FaLock } from "react-icons/fa";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptcha: string;
}

const getInitialFormData = (): ContactFormValues => {
  const saved = localStorage.getItem("contactFormData");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing saved form data", error);
    }
  }
  return { name: "", email: "", subject: "", message: "", recaptcha: "" };
};

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setFocus,
    setValue,
  } = useForm<ContactFormValues>({
    defaultValues: getInitialFormData(),
    mode: "onBlur",
  });

  // Auto-save form data to local storage.
  const formData = watch();
  useAutoSave(formData);

  // Detect exit intent and prompt the user.
  useExitIntent(() => {
    if (
      formData.name ||
      formData.email ||
      formData.subject ||
      formData.message
    ) {
      toast.info("Hold on! Your form data has been saved automatically.", {
        autoClose: 5000,
      });
    }
  });

  // Reference for reCAPTCHA.
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // onSubmit handler with input sanitization and retry logic.
  const onSubmit = async (data: ContactFormValues) => {
    // Sanitize inputs.
    const sanitizedData = {
      name: sanitizeHtml(data.name),
      email: sanitizeHtml(data.email),
      subject: sanitizeHtml(data.subject),
      message: sanitizeHtml(data.message),
      recaptcha: data.recaptcha,
    };

    trackEvent("ContactFormSubmit", { email: sanitizedData.email });

    // Simulated API call with simple retry logic.
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Simulate network delay.
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // For demo purposes, simulate a failure 20% of the time.
        if (Math.random() < 0.2) throw new Error("Simulated API failure");
        success = true;
        break;
      } catch (error) {
        console.error(`Submission attempt ${attempt} failed:`, error);
        if (attempt === 3) {
          toast.error(
            "Submission failed after multiple attempts. Please try again later."
          );
          return;
        }
      }
    }

    if (success) {
      localStorage.removeItem("contactFormData");
      reset();
      toast.success("Thank you! Your message has been sent successfully.");
    }
  };

  // onError handler: focus the first invalid field and display an error summary.
  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    setFocus(firstErrorField as keyof ContactFormValues);
    toast.error("Please fix the errors in the form.");
  };

  // Handle reCAPTCHA changes.
  const handleRecaptchaChange = (token: string | null) => {
    setValue("recaptcha", token || "");
    trackEvent("RecaptchaVerified");
  };

  return (
    <section id="contact" className="bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Get in Touch</h2>
          <div className="flex items-center text-gray-600">
            <FaLock className="mr-1" />
            <span className="text-sm">Your data is secure</span>
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          We value your privacy and ensure your information is protected.
        </p>
        {/* Error Summary for screen readers */}
        <ErrorSummary errors={errors} />
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <FormField
            name="name"
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            register={register}
            validation={{ required: "Please enter your full name." }}
          />
          <FormField
            name="email"
            label="Email Address"
            placeholder="name@example.com"
            type="email"
            error={errors.email?.message}
            register={register}
            validation={{
              required: "Email is required (e.g., name@example.com).",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message:
                  "Enter a valid email address (e.g., name@example.com).",
              },
            }}
          />
          <FormField
            name="subject"
            label="Subject"
            placeholder="How can we help you?"
            error={errors.subject?.message}
            register={register}
            validation={{
              required: "Please provide a subject for your message.",
            }}
          />
          <FormField
            name="message"
            label="Message"
            placeholder="Your message..."
            isTextArea={true}
            rows={5}
            error={errors.message?.message}
            register={register}
            validation={{
              required: "Please enter your message so we can assist you.",
            }}
          />
          {/* Google reCAPTCHA */}
          <div className="mb-6">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string}
              onChange={handleRecaptchaChange}
            />
            {errors.recaptcha && (
              <p
                id="recaptcha-error"
                className="text-red-500 text-sm mt-1"
                role="alert"
                aria-live="assertive"
              >
                Please complete the reCAPTCHA.
              </p>
            )}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Your Message
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            By clicking “Send Your Message”, you agree to our Privacy Policy.
            Your data is secure and never shared.
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </section>
  );
};

export default ContactForm;
