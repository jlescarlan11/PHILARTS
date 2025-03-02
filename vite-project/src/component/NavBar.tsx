import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLink } from "react-router-hash-link";
import FocusLock from "react-focus-lock";
import logo from "../assets/logo.svg";
import { MdDarkMode, MdLightMode, MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

// ----------------------
// Utility: Throttle Hook
// ----------------------
/**
 * useThrottle - custom hook to throttle a function call.
 * @param callback - function to throttle.
 * @param delay - delay in milliseconds.
 */
const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef(0);
  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      }
    },
    [callback, delay]
  );
};

// -------------------------
// Utility: Analytics Tracker
// -------------------------
/**
 * trackEvent - Enhanced analytics tracking with error handling.
 */
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    // Replace with your analytics integration (e.g., Google Analytics)
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.warn("Analytics not available", eventName, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

// ------------------------
// Reusable NavItem Component
// ------------------------
interface NavItemProps {
  name: string;
  link: string;
  isActive: boolean;
  onClick: (link: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ name, link, isActive, onClick }) => {
  return (
    <li>
      <HashLink
        smooth
        to={link}
        title={`Navigate to ${name}`}
        onClick={() => {
          onClick(link);
          trackEvent("nav_click", { element: "NavItem", name, link });
        }}
        aria-current={isActive ? "page" : undefined}
        className={`block  px-3 py-2 rounded transition-transform duration-300 ease-in-out transform
          hover:scale-105 hover:text-[var(--color-accent)] ${
            isActive ? "font-bold border-b-2 border-[var(--color-accent)]" : ""
          }`}
      >
        {name}
      </HashLink>
    </li>
  );
};

// ------------------------
// Searchable Content Items (example data)
// ------------------------
const contentItems = [
  { id: 1, title: "About", url: "/#about" },
  { id: 2, title: "Menu", url: "/#menu" },
  { id: 3, title: "Testimonials", url: "/#testimonials" },
  { id: 4, title: "FAQ", url: "/#faq" },
  { id: 5, title: "Contact", url: "/#contact" },
];

// Structured data (JSON‑LD) for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: "Main Navigation",
  url: "https://nutchabite.com",
  mainEntity: contentItems.map((item) => ({
    "@type": "WebPage",
    name: item.title,
    url: `https://nutchabite.com/${item.url}`,
  })),
};

// ------------------------
// Main Navbar Component
// ------------------------
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [activeLink, setActiveLink] = useState("#home"); // Active navigation link
  const [menuStatus, setMenuStatus] = useState("Mobile menu closed"); // ARIA live region status
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [] = useState(""); // Search query for filtering
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ------------------------
  // Dark Mode Persistence
  // ------------------------
  useEffect(() => {
    const savedPreference = localStorage.getItem("darkMode");
    if (savedPreference === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // ------------------------
  // IntersectionObserver Callback (Throttled)
  // ------------------------
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    },
    []
  );

  const throttledIntersection = useThrottle(handleIntersection, 200);

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        throttledIntersection(entries);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.6,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [throttledIntersection]);

  // ------------------------
  // Toggle Mobile Menu
  // ------------------------
  const toggleMenu = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      setMenuStatus(newState ? "Mobile menu opened" : "Mobile menu closed");
      trackEvent("mobile_menu_toggle", { isOpen: newState });
      return newState;
    });
  };

  // Close mobile menu (used by backdrop, dedicated close button)
  const closeMenu = () => {
    setIsOpen(false);
    setMenuStatus("Mobile menu closed");
    trackEvent("mobile_menu_close", { source: "close_button" });
  };

  // ------------------------
  // Handle Navigation Item Click
  // ------------------------
  const handleNavItemClick = (link: string) => {
    setActiveLink(link);
    setIsOpen(false);
    trackEvent("nav_item_click", { link });
  };

  // ------------------------
  // Toggle Dark Mode
  // ------------------------
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      trackEvent("toggle_dark_mode", { darkMode: newMode });
      return newMode;
    });
  };

  // ------------------------
  // Search Functionality
  // ------------------------

  // Optionally, handle Enter key in search input to select first result

  // Filter the content items based on search query (case-insensitive)

  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="skip-link absolute top-[-40px] left-0 bg-[var(--color-accent)] text-[var(--color-primary)] p-2 z-50 focus:top-0 transition-all"
      >
        Skip to content
      </a>

      {/* ARIA Live Region for Mobile Menu Status */}
      <div aria-live="polite" className="sr-only">
        {menuStatus}
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Backdrop Overlay for Mobile Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav
        role="navigation"
        className="sticky top-0 z-50 bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[var(--nav-height)]">
          {/* Logo Section */}
          <div className="flex-shrink-0 ">
            <HashLink
              smooth
              to="/#hero"
              onClick={() => handleNavItemClick("/#hero")}
              title="Nutcha Bite Home"
              className="flex items-center gap-2"
            >
              <img
                src={logo}
                alt="Nutcha Bite logo"
                className="h-8 w-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
              />
              <h1 className="shrikhand-regular text-xl text-[var(--color-tertiary)]">
                NUTCHA BITES
              </h1>

              {/* <h6 className="poppins-regular text-xs">
                Old School Crunch, New School Vibes
              </h6> */}
            </HashLink>
          </div>

          {/* Desktop Navigation */}
          <nav role="navigation" className="hidden md:block">
            <ul className="flex space-x-8">
              {contentItems.map((item) => (
                <NavItem
                  key={item.url}
                  name={item.title}
                  link={item.url}
                  isActive={activeLink === item.url}
                  onClick={handleNavItemClick}
                />
              ))}
            </ul>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                title="Toggle dark mode"
                aria-pressed={darkMode}
                className="p-2 rounded focus:outline-none hover:bg-[var(--color-accent-20)] transition-colors duration-300 ripple"
              >
                {darkMode ? (
                  <MdLightMode className="size-6" />
                ) : (
                  <MdDarkMode className="size-6" />
                )}
              </button>
              <div className="relative mr-4">
                <button
                  title="Go to Cart"
                  onClick={() => navigate("/cart")}
                  className="p-2 rounded focus:outline-none hover:bg-[var(--color-accent-20)] transition-colors duration-300 ripple"
                >
                  <MdShoppingCart className="size-6" />
                </button>
                {(cartCount ?? 0) > 0 && (
                  <span className="absolute top-0 right-0 bg-[var(--color-tertiary)] text-[var(--color-primary)] text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
            <div>
              <HashLink
                smooth
                to="\#products"
                onClick={() => {
                  handleNavItemClick("#order");
                  trackEvent("cta_click", {
                    element: "Order Now",
                    link: "#order",
                  });
                }}
                title="Order Now"
                className="bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
              >
                Order Now
              </HashLink>
            </div>
          </div>

          <div className=" md:hidden flex items-center gap-2">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle Button */}
              <button
                onClick={toggleMenu}
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                className="md:hidden text-[var(--color-secondary)] hover:text-[var(--color-accent)] focus:outline-none ripple"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu with Focus Lock */}
        <FocusLock disabled={!isOpen}>
          <nav
            id="mobile-menu"
            role="navigation"
            ref={mobileMenuRef}
            className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden z-50 ${
              isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="px-2 pt-2 pb-3 space-y-1">
              {contentItems.map((item) => (
                <NavItem
                  key={item.url}
                  name={item.title}
                  link={item.url}
                  isActive={activeLink === item.url}
                  onClick={handleNavItemClick}
                />
              ))}

              <li>
                <button
                  onClick={toggleDarkMode}
                  title="Toggle dark mode"
                  aria-pressed={darkMode}
                  className="flex items-center gap-2  w-full border border-[var(--color-accent)] text-[var(--color-secondary)] px-3 py-2 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
                >
                  {darkMode ? (
                    <>
                      <MdLightMode className="size-6" />
                      Toggle Light Mode
                    </>
                  ) : (
                    <>
                      <MdDarkMode className="size-6" />
                      Toggle Light Mode
                    </>
                  )}
                </button>
              </li>

              <li>
                <button
                  title="Go to Cart"
                  onClick={() => navigate("/cart")}
                  className="w-full bg-[var(--color-accent)] flex items-center gap-2 text-[var(--color-primary)] px-3 py-2 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
                >
                  <MdShoppingCart className="size-6" />
                  Shopping Cart
                </button>
              </li>

              <li>
                <HashLink
                  smooth
                  to="\#products"
                  onClick={() => {
                    handleNavItemClick("#menu");
                    trackEvent("cta_click", {
                      element: "Order Now",
                      link: "#order",
                    });
                  }}
                  title="Order Now"
                  className="block bg-[var(--color-accent)] text-[var(--color-primary)] px-3 py-2 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
                >
                  Order Now
                </HashLink>
              </li>
            </ul>
          </nav>
        </FocusLock>
      </nav>
    </>
  );
};

export default Navbar;
