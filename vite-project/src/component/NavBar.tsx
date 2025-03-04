// NavBar.tsx
// Main navigation component integrating desktop navigation, the updated mobile bottom sheet,
// and the compact sticky bottom navigation bar.
// It manages active section detection and dark mode toggling, with improved ARIA and analytics.
import React, { useState, useEffect, useCallback } from "react";
import { HashLink } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.svg";
import { useCart } from "../hooks/useCart";
import useThrottle from "../utils/useThrottle";
import NavItem from "./NavItem";
import DarkModeToggle from "./DarkModeToggle";
import MobileMenu from "./MobileMenu";
import BottomNavBar from "./BottomNavBar";
import { trackEvent } from "../utils/analytics";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // State for active section and mobile menu control
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Navigation items (localized)
  const contentItems = [
    { id: "about", title: t("About"), url: "/#about" },
    { id: "menu", title: t("Menu"), url: "/#menu" },
    { id: "testimonials", title: t("Testimonials"), url: "/#testimonials" },
    { id: "faq", title: t("FAQ"), url: "/#faq" },
    { id: "contact", title: t("Contact"), url: "/#contact" },
  ];

  // Structured data for SEO (breadcrumbs, publisher details)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://nutchabite.com",
    name: "Nutcha Bites",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: contentItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        item: `https://nutchabite.com${item.url}`,
      })),
    },
    publisher: {
      "@type": "Organization",
      name: "Nutcha Bites",
      logo: {
        "@type": "ImageObject",
        url: "https://nutchabite.com/assets/logo.svg",
      },
    },
  };

  // Initialize dark mode from local storage or system preference.
  useEffect(() => {
    const savedPreference = localStorage.getItem("darkMode");
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedPreference === "true" || (!savedPreference && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Active section detection using IntersectionObserver (with throttling)
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const visibleSections = entries.filter(
        (entry) => entry.isIntersecting && entry.target.id
      );
      if (visibleSections.length > 0) {
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
      { root: null, rootMargin: "0px", threshold: 0.25 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [throttledIntersection]);

  // Toggle mobile menu with ARIA announcements via analytics
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => {
      const newState = !prev;
      trackEvent("mobile_menu_toggle", { isOpen: newState });
      return newState;
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    trackEvent("mobile_menu_close", { source: "close_button" });
  };

  const handleNavItemClick = (sectionId: string) => {
    setActiveSection(sectionId);
    closeMobileMenu();
    trackEvent("nav_item_click", { sectionId });
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="Nutcha Bites - Delicious meals delivered fast."
        />
        <link rel="alternate" href="https://nutchabite.com/en" hrefLang="en" />
        <link rel="alternate" href="https://nutchabite.com/es" hrefLang="es" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Skip-to-content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link absolute top-[-40px] left-0 bg-[var(--color-accent)] text-[var(--color-primary)] p-2 z-50 focus:top-0 transition-all"
      >
        {t("Skip to content")}
      </a>

      {/* Desktop Navbar */}
      <nav
        role="navigation"
        className="sticky top-0 z-50 bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[var(--nav-height)]">
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
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-tertiary)]">
                NUTCHA BITES
              </h1>
            </HashLink>
          </div>
          <div className="hidden md:block">
            <ul className="flex space-x-8" role="menubar">
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
          </div>
          <div className="hidden md:flex items-center gap-4">
            <DarkModeToggle
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <button
              title="Go to Cart"
              onClick={() => navigate("/cart")}
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300 relative"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4h-2l-3 7v9a1 1 0 001 1h16a1 1 0 001-1v-9l-3-7h-2" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full px-2">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? t("Close navigation menu")
                  : t("Open navigation menu")
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="text-[var(--color-secondary)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
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
      </nav>

      {/* Mobile Bottom Sheet Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        closeMenu={closeMobileMenu}
        activeSection={activeSection}
        handleNavItemClick={handleNavItemClick}
        contentItems={contentItems}
        cartCount={cartCount}
        navigate={navigate}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <div className="md:hidden">
        <BottomNavBar cartCount={cartCount} navigate={navigate} />
      </div>
    </>
  );
};

export default Navbar;
