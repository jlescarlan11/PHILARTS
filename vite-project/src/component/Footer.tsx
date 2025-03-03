import React, { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaShieldAlt,
} from "react-icons/fa";
import { MdArrowUpward } from "react-icons/md";

// -------------------------
// BrandInfo Component
// -------------------------
const BrandInfo: React.FC = () => (
  <div className="text-center md:text-left">
    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">
      Nutcha Bite
    </h2>
    <p className="mt-2 text-sm" style={{ color: "var(--color-secondary)" }}>
      Contact us:&nbsp;
      <a
        href="mailto:info@nutchabite.com"
        style={{ color: "var(--color-accent)" }}
        className="hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
      >
        info@nutchabite.com
      </a>
      &nbsp;|&nbsp;+1 (555) 123-4567
    </p>
  </div>
);

// -------------------------
// SocialLinks Component
// -------------------------
const SocialLinks: React.FC = () => {
  const icons = [
    {
      href: "https://facebook.com",
      label: "Facebook",
      icon: <FaFacebookF size={20} />,
    },
    {
      href: "https://twitter.com",
      label: "Twitter",
      icon: <FaTwitter size={20} />,
    },
    {
      href: "https://instagram.com",
      label: "Instagram",
      icon: <FaInstagram size={20} />,
    },
    {
      href: "https://linkedin.com",
      label: "LinkedIn",
      icon: <FaLinkedinIn size={20} />,
    },
  ];

  return (
    <div className="flex items-center space-x-6 justify-center">
      {icons.map(({ href, label, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          style={{ color: "var(--color-accent)" }}
          className="transition-transform duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          {icon}
        </a>
      ))}
    </div>
  );
};

// -------------------------
// NewsletterSignup Component
// -------------------------
const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  // Validate email using a simple regex.
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validateEmail(email)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFeedback({ type: "success", message: "Subscribed successfully!" });
      setEmail("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Subscription failed. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 md:mt-0 flex flex-col items-center">
      <h3
        className="text-lg font-semibold"
        style={{ color: "var(--color-secondary)" }}
      >
        Stay Updated!
      </h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row mt-2 w-full max-w-xs"
        aria-label="Newsletter Signup Form"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md md:rounded-l-md md:rounded-r-none focus:outline-none focus:ring-2 transition-colors duration-300"
          aria-label="Email address"
          style={{ borderColor: "var(--color-accent)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 md:mt-0 md:w-auto bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 rounded-md md:rounded-r-md md:rounded-l-none hover:bg-opacity-80 focus:outline-none focus:ring-2 transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
      {feedback && (
        <div aria-live="polite">
          <p
            className={`mt-2 text-sm ${
              feedback.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
};

// -------------------------
// TrustSignals Component
// -------------------------
const TrustSignals: React.FC = () => (
  <div className="mt-4 flex flex-col items-center justify-center">
    <div className="flex items-center space-x-2 justify-center">
      <FaShieldAlt
        className="size-4 text-[var(--color-accent-70)]"
        aria-hidden="true"
      />
      <span className="text-xs" style={{ color: "var(--color-secondary-70)" }}>
        Secure transactions &amp; trusted by thousands
      </span>
    </div>
  </div>
);

// -------------------------
// BackToTop Component (Dynamic)
// -------------------------
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[var(--color-accent)] text-[var(--color-primary)] px-3 py-3 rounded-full shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 transition-all duration-300"
          aria-label="Back to top"
        >
          <MdArrowUpward size={24} />
        </button>
      )}
    </>
  );
};

// -------------------------
// Main Footer Component
// -------------------------
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ backgroundColor: "var(--color-primary)" }}
      className="py-4"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <BrandInfo />
        <SocialLinks />
        <NewsletterSignup />
      </div>

      <TrustSignals />

      <div
        className="mt-4 border-t"
        style={{ borderColor: "var(--color-accent)" }}
      >
        <div className="max-w-7xl mx-auto pt-4 flex justify-center">
          <p className="text-xs" style={{ color: "var(--color-secondary)" }}>
            &copy; {currentYear} John Lester Escarlan | All rights reserved
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
};

export default Footer;
