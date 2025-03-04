// MobileMenu.tsx
// Refactored mobile bottom sheet menu with a minimal, modern layout.
// Changes include:
// • Removing the visible close button so that the menu can only be dismissed via swipe or tapping the overlay.
// • Disabling background scrolling by toggling a "no-scroll" class on the body when the menu is open.
// • Preventing native pull‑to‑refresh via e.preventDefault() in touch event handlers.
import React, { useState, useEffect } from "react";
import FocusLock from "react-focus-lock";
import { HashLink } from "react-router-hash-link";
import NavItem from "./NavItem";
import { trackEvent } from "../utils/analytics";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  activeSection: string;
  handleNavItemClick: (sectionId: string) => void;
  contentItems: { id: string; title: string; url: string }[];
  cartCount: number;
  navigate: (path: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  closeMenu,
  activeSection,
  handleNavItemClick,
  contentItems,
  cartCount,
  navigate,
}) => {
  // State for tracking touch swipe distance and timing
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const swipeThreshold = 120; // Minimum swipe distance to trigger dismiss

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    // Cleanup in case component unmounts while menu is open
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  // State for displaying a contextual tooltip (e.g., "Swipe down to dismiss")
  const [showTooltip, setShowTooltip] = useState(true);

  // Disable background scrolling by toggling a "no-scroll" class on the body when the menu is open.
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    // Cleanup in case component unmounts while menu is open
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  // Handle initial touch: record the starting Y position and time; prevent default to block native refresh.
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchStartY(e.touches[0].clientY);
    setSwipeStartTime(Date.now());
    setShowTooltip(true);
  };

  // Handle touch move: compute swipe delta with an elastic effect.
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent native pull-to-refresh
    if (touchStartY !== null) {
      const delta = e.touches[0].clientY - touchStartY;
      setTouchDeltaY(delta > 0 ? delta * 0.5 : 0); // Apply resistance factor
    }
  };

  // On touch end, if the swipe exceeds the threshold, capture analytics and dismiss the menu.
  // Otherwise, reset the swipe state.
  const handleTouchEnd = () => {
    const swipeDuration = swipeStartTime ? Date.now() - swipeStartTime : 0;
    if (touchDeltaY > swipeThreshold) {
      trackEvent("mobile_menu_swipe_dismiss", {
        swipeDistance: touchDeltaY,
        swipeDuration,
      });
      closeMenu();
    }
    setTouchStartY(null);
    setTouchDeltaY(0);
    setSwipeStartTime(null);
    setShowTooltip(false);
  };

  // The menu translates vertically according to touchDeltaY (with a subtle parallax effect)
  const menuStyle = {
    transform: isOpen ? `translateY(${touchDeltaY}px)` : "translateY(100%)",
    transition:
      touchStartY === null
        ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)"
        : "none",
  };

  return (
    <>
      {/* Overlay to disable background interactions and dismiss the menu when tapped */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-[var(--color-primary)] bg-opacity-50 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      <FocusLock disabled={!isOpen}>
        <nav
          id="mobile-menu"
          role="menu"
          aria-label="Mobile Navigation Menu"
          className="fixed left-0 right-0 bottom-0 z-50 bg-[var(--color-primary)] text-[var(--color-secondary)] rounded-t-xl shadow-lg"
          style={menuStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* ARIA live region for detailed feedback */}
          <div aria-live="assertive" className="sr-only">
            {isOpen
              ? "Mobile menu opened. Swipe down to dismiss, or tap outside the menu."
              : "Mobile menu closed."}
          </div>

          {/* Header area with drag indicator and contextual tooltip */}
          <div className="flex items-center justify-center px-4 py-2 border-b border-[var(--color-secondary)]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 bg-[var(--color-secondary)] rounded-full" />
              {showTooltip && (
                <span className="text-xs text-[var(--color-secondary)]">
                  Swipe down to dismiss
                </span>
              )}
            </div>
          </div>

          {/* Content area: Grid layout for navigation items and CTAs */}
          <div className="px-6 py-4 grid gap-6">
            {/* Navigation items with clear dividers */}
            <ul
              className="grid gap-4 border-b border-[var(--color-secondary)] pb-4"
              role="menu"
            >
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

            {/* Key CTAs (theme controls removed for simplicity) */}
            <div className="grid gap-4">
              <button
                title="Go to Cart"
                onClick={() => {
                  closeMenu();
                  navigate("/cart");
                }}
                className="w-full py-3 rounded bg-[var(--color-tertiary)] text-[var(--color-primary)] font-bold focus:outline-none focus:ring-3 focus:ring-red-500 transition transform hover:scale-105 shadow-lg"
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              <HashLink
                smooth
                to="/#products"
                onClick={() => handleNavItemClick("order")}
                title="Order Now"
                className="block text-center w-full py-3 rounded bg-[var(--color-accent)] text-[var(--color-primary)] font-bold focus:outline-none focus:ring-3 focus:ring-green-500 transition transform hover:scale-105 shadow-lg"
              >
                Order Now
              </HashLink>
            </div>
          </div>
        </nav>
      </FocusLock>
    </>
  );
};

export default MobileMenu;
