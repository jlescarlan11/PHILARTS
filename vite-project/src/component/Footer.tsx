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
    <h2 className="text-2xl font-bold text-secondary">Nutcha Bite</h2>
    <p className="mt-2 text-sm text-secondary">
      Contact us:&nbsp;
      <a
        href="mailto:info@nutchabite.com"
        className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
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
          className="text-accent transition-transform duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
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
const NewsletterSignup: React.FC = () => (
  <div className="mt-6 md:mt-0 flex flex-col items-center">
    <h3 className="text-lg font-semibold text-secondary">Stay Updated!</h3>
    <form className="flex mt-2" aria-label="Newsletter Signup Form">
      <input
        type="email"
        placeholder="Your email"
        className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-300"
        aria-label="Email address"
      />
      <button
        type="submit"
        className="bg-accent text-[var(--color-primary)] bg-[var(--color-accent)] px-4 py-2 rounded-r-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-300"
      >
        Subscribe
      </button>
    </form>
  </div>
);

// -------------------------
// TrustSignals Component
// -------------------------
const TrustSignals: React.FC = () => (
  <div className="mt-6 flex flex-col items-center justify-center">
    <div className="flex items-center space-x-2 justify-center">
      <FaShieldAlt className="text-accent" size={20} aria-hidden="true" />
      <span className="text-xs text-secondary">
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
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-accent text-[var(--color-primary)] bg-[var(--color-accent)] px-2 py-2 rounded-full shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
          aria-label="Back to top"
        >
          <MdArrowUpward />
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
    <footer className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col space-y-6 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <BrandInfo />
        <SocialLinks />
        <NewsletterSignup />
      </div>

      <TrustSignals />

      <div className="mt-8 border-t border-gray-300 pt-4">
        <div className="max-w-7xl mx-auto px-4 flex  justify-center space-y-4 ">
          <p className="text-xs text-secondary">
            &copy; {currentYear} John Lester Escarlan | All rights reserved
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
};

export default Footer;
