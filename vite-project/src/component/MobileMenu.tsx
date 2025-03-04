// MobileMenu.tsx
// This component renders the mobile bottom sheet menu with a minimal, modern look.
// Changes include:
// • A compact layout with ample white space and consistent grid spacing.
// • Clear visual dividers between nav items and CTAs.
// • Preventing native pull-to-refresh via e.preventDefault() in touch events.
// • A visible close button is always available as a fallback for dismissing the menu.
// • (Optional) A subtle parallax effect during swipe gestures.
import React, { useState } from "react";
import FocusLock from "react-focus-lock";
import { HashLink } from "react-router-hash-link";
import NavItem from "./NavItem";
import DarkModeToggle from "./DarkModeToggle";
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
  darkMode,
  toggleDarkMode,
}) => {
  // State for tracking touch swipe distance and timing
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const swipeThreshold = 120; // Minimum swipe distance to trigger dismiss

  // State for showing a contextual tooltip (e.g., "Swipe down to dismiss")
  const [showTooltip, setShowTooltip] = useState(true);

  // Handle initial touch: record start Y and time, and prevent default to help block native refresh.
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent native pull-to-refresh
    e.preventDefault();
    setTouchStartY(e.touches[0].clientY);
    setSwipeStartTime(Date.now());
    setShowTooltip(true);
  };

  // Handle touch move: compute swipe delta with an elastic (resisted) effect and optional parallax.
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Attempt to block native refresh behavior
    if (touchStartY !== null) {
      const delta = e.touches[0].clientY - touchStartY;
      // Only consider downward swipes; apply 0.5 resistance for a natural elastic feel.
      setTouchDeltaY(delta > 0 ? delta * 0.5 : 0);
    }
  };

  // On touch end, check if the swipe distance exceeds threshold.
  // If so, dismiss the menu and capture swipe analytics.
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

  // Apply a subtle parallax effect by translating the menu as the user swipes.
  const menuStyle = {
    transform: isOpen ? `translateY(${touchDeltaY}px)` : "translateY(100%)",
    transition:
      touchStartY === null
        ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)"
        : "none",
  };

  return (
    <>
      {/* Semi-transparent, blurred overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      <FocusLock disabled={!isOpen}>
        <nav
          id="mobile-menu"
          role="menu"
          aria-label="Mobile Navigation Menu"
          className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-t-xl shadow-lg"
          style={menuStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* ARIA live region with detailed feedback */}
          <div aria-live="assertive" className="sr-only">
            {isOpen
              ? "Mobile menu opened. Swipe down to dismiss, or tap the close button."
              : "Mobile menu closed."}
          </div>

          {/* Header area: Drag indicator and a visible close button */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 bg-gray-400 rounded-full" />
              {showTooltip && (
                <span className="text-xs text-gray-500">
                  Swipe down to dismiss
                </span>
              )}
            </div>
            {/* Always visible close button as fallback */}
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              &times;
            </button>
          </div>

          {/* Content area using grid layout for consistent spacing */}
          <div className="px-6 py-4 grid gap-6">
            {/* Navigation items with clear visual dividers */}
            <ul
              className="grid gap-4 border-b border-gray-300 pb-4"
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

            {/* Key CTAs – extra theme controls removed for simplicity */}
            <div className="grid gap-4">
              <button
                title="Go to Cart"
                onClick={() => {
                  closeMenu();
                  navigate("/cart");
                }}
                className="w-full py-3 rounded bg-red-600 text-white font-bold focus:outline-none focus:ring-3 focus:ring-red-500 transition transform hover:scale-105 shadow-lg"
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              <HashLink
                smooth
                to="/#products"
                onClick={() => handleNavItemClick("order")}
                title="Order Now"
                className="block text-center w-full py-3 rounded bg-green-600 text-white font-bold focus:outline-none focus:ring-3 focus:ring-green-500 transition transform hover:scale-105 shadow-lg"
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
