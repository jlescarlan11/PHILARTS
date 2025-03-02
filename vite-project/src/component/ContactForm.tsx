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

// Helper: API call with retry logic.
async function simulateApiCallWithRetry(
  _data: ContactFormValues,
  maxAttempts = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (Math.random() < 0.2) throw new Error("Simulated API failure");
      return true;
    } catch (error) {
      console.error(`Submission attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) return false;
    }
  }
  return false;
}

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

  const formData = watch();
  useAutoSave(formData);

  useExitIntent(() => {
    if (
      formData.name ||
      formData.email ||
      formData.subject ||
      formData.message
    ) {
      toast.info("Hold on! Your form data has been auto‑saved.", {
        autoClose: 5000,
      });
    }
  });

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onSubmit = async (data: ContactFormValues) => {
    const sanitizedData: ContactFormValues = {
      name: sanitizeHtml(data.name),
      email: sanitizeHtml(data.email),
      subject: sanitizeHtml(data.subject),
      message: sanitizeHtml(data.message),
      recaptcha: data.recaptcha,
    };

    trackEvent("ContactFormSubmit", { email: sanitizedData.email });
    const success = await simulateApiCallWithRetry(sanitizedData);
    if (!success) {
      toast.error(
        "Submission failed after multiple attempts. Please try again later."
      );
      return;
    }
    localStorage.removeItem("contactFormData");
    reset();
    toast.success(
      "Thank you! Your message has been sent successfully. We'll get back to you soon."
    );
  };

  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    setFocus(firstErrorField as keyof ContactFormValues);
    toast.error("Please fix the errors in the form before submitting.");
  };

  const handleRecaptchaChange = (token: string | null) => {
    setValue("recaptcha", token || "");
    trackEvent("RecaptchaVerified");
  };

  return (
    <section id="contact" className="bg-primary py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-secondary">Get in Touch</h2>
          <div className="flex items-center text-secondary mt-2 sm:mt-0">
            <FaLock className="mr-1" />
            <span className="text-sm">Your data is secure</span>
          </div>
        </div>
        <p className="mb-4 text-sm text-secondary">
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
            title="Enter your full name"
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
            title="Enter your email (e.g., name@example.com)"
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
            title="What is your inquiry about?"
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
            title="Write your message here"
          />
          <div className="mb-6 flex flex-col">
            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string}
                className="w-full scale-75 sm:scale-100"
                style={{ transformOrigin: "0  0" }}
                onChange={handleRecaptchaChange}
              />
            </div>
            {errors.recaptcha && (
              <p
                id="recaptcha-error"
                className="text-sm text-red-500 mt-2 transition-opacity duration-300"
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
              className="w-full px-6 py-3 bg-accent text-white rounded-full hover:bg-accent-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Send Your Message
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary text-justify">
            By clicking “Send Your Message”, you agree to our Privacy Policy.
            Your data is secure and will never be shared.
          </p>
          <p className="mt-1 text-xs text-secondary italic">
            We’ll get back to you promptly.
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </section>
  );
};

export default ContactForm;
