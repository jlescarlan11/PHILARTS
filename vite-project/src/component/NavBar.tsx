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
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
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
  url: string;
  sectionId: string;
  isActive: boolean;
  onClick: (sectionId: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  name,
  url,
  sectionId,
  isActive,
  onClick,
}) => {
  return (
    <li className="w-full">
      <HashLink
        smooth
        to={url}
        title={`Navigate to ${name}`}
        onClick={() => {
          onClick(sectionId);
          trackEvent("nav_click", { element: "NavItem", name, url });
        }}
        aria-current={isActive ? "page" : undefined}
        className={`block px-4 py-3 sm:px-5 sm:py-4 text-base md:text-lg transition-transform duration-300 ease-in-out transform hover:scale-105 hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
          isActive ? "font-bold border-b-2 border-[var(--color-accent)]" : ""
        }`}
      >
        {name}
      </HashLink>
    </li>
  );
};

// ------------------------
// Content Items for Navigation
// (id: without the hash, title, and url)
const contentItems = [
  { id: "about", title: "About", url: "/#about" },
  { id: "menu", title: "Menu", url: "/#menu" },
  { id: "testimonials", title: "Testimonials", url: "/#testimonials" },
  { id: "faq", title: "FAQ", url: "/#faq" },
  { id: "contact", title: "Contact", url: "/#contact" },
];

// ------------------------
// Structured Data for SEO
// ------------------------
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: "Main Navigation",
  url: "https://nutchabite.com",
  mainEntity: contentItems.map((item) => ({
    "@type": "WebPage",
    name: item.title,
    url: `https://nutchabite.com${item.url}`,
  })),
};

const Navbar: React.FC = () => {
  // Active section stored as section id (without the hash)
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const [menuStatus, setMenuStatus] = useState("Mobile menu closed");
  const [darkMode, setDarkMode] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get the cart items from context so cart count updates dynamically
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
      // Filter visible sections
      const visibleSections = entries.filter(
        (entry) => entry.isIntersecting && entry.target.id
      );
      if (visibleSections.length > 0) {
        // Pick the section closest to the top of the viewport
        const sortedSections = visibleSections.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        setActiveSection(sortedSections[0].target.id);
      }
    },
    []
  );

  const throttledIntersection = useThrottle(handleIntersection, 200);

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => throttledIntersection(entries),
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.25,
      }
    );
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
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

  // Close mobile menu (for backdrop and when a menu item is clicked)
  const closeMenu = () => {
    setIsOpen(false);
    setMenuStatus("Mobile menu closed");
    trackEvent("mobile_menu_close", { source: "close_button" });
  };

  // ------------------------
  // Handle Navigation Item Click
  // ------------------------
  const handleNavItemClick = (sectionId: string) => {
    setActiveSection(sectionId);
    closeMenu(); // Automatically close mobile menu on item click
    trackEvent("nav_item_click", { sectionId });
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
          className="fixed inset-0 bg-black opacity-50 z-40 transition-opacity duration-300"
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
          <div className="flex-shrink-0 mr-4">
            <HashLink
              smooth
              to="/#hero"
              onClick={() => handleNavItemClick("hero")}
              title="Nutcha Bite Home"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <img
                src={logo}
                alt="Nutcha Bite logo"
                className="h-8 w-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
              />
              <h1 className="shrikhand-regular text-xl md:text-2xl text-[var(--color-tertiary)]">
                NUTCHA BITES
              </h1>
            </HashLink>
          </div>

          {/* Desktop Navigation */}
          <nav role="navigation" className="hidden md:block">
            <ul className="flex space-x-8">
              {contentItems.map((item) => (
                <NavItem
                  key={item.url}
                  name={item.title}
                  url={item.url}
                  sectionId={item.id}
                  isActive={activeSection === item.id}
                  onClick={handleNavItemClick}
                />
              ))}
            </ul>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              title="Toggle dark mode"
              aria-pressed={darkMode}
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300"
            >
              {darkMode ? (
                <MdLightMode className="w-6 h-6" />
              ) : (
                <MdDarkMode className="w-6 h-6" />
              )}
            </button>
            <div className="relative">
              <button
                title="Go to Cart"
                onClick={() => navigate("/cart")}
                className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300"
              >
                <MdShoppingCart className="w-6 h-6" />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </div>
            <HashLink
              smooth
              to="/#products"
              onClick={() => handleNavItemClick("order")}
              title="Order Now"
              className="bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
            >
              Order Now
            </HashLink>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="text-[var(--color-secondary)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors duration-300"
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

        {/* Mobile Navigation Menu with Focus Lock */}
        <FocusLock disabled={!isOpen}>
          <nav
            id="mobile-menu"
            role="navigation"
            ref={mobileMenuRef}
            className={`md:hidden transition-all duration-300 ease-out overflow-hidden z-50 ${
              isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="flex flex-col space-y-6 px-4 py-4">
              {contentItems.map((item) => (
                <NavItem
                  key={item.url}
                  name={item.title}
                  url={item.url}
                  sectionId={item.id}
                  isActive={activeSection === item.id}
                  onClick={handleNavItemClick}
                />
              ))}
            </ul>
            {/* Mobile CTAs */}
            <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col space-y-4">
              <button
                onClick={toggleDarkMode}
                title="Toggle dark mode"
                aria-pressed={darkMode}
                className="flex items-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300"
              >
                {darkMode ? (
                  <MdLightMode className="w-6 h-6" />
                ) : (
                  <MdDarkMode className="w-6 h-6" />
                )}
                <span className="ml-2">Toggle Dark Mode</span>
              </button>
              <div className="relative">
                <button
                  title="Go to Cart"
                  onClick={() => {
                    closeMenu();
                    navigate("/cart");
                  }}
                  className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300"
                >
                  <MdShoppingCart className="w-6 h-6" />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-bold rounded-full px-2 py-0.5">
                    {cartCount}
                  </span>
                )}
              </div>
              <HashLink
                smooth
                to="/#products"
                onClick={() => handleNavItemClick("order")}
                title="Order Now"
                className="bg-[var(--color-accent)] text-[var(--color-primary)] px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-90"
              >
                Order Now
              </HashLink>
            </div>
          </nav>
        </FocusLock>
      </nav>
    </>
  );
};

export default Navbar;
