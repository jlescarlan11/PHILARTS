// MobileMenu.tsx
// Refactored mobile bottom sheet modal with a minimal and compact design.
// - Uses ample white space and a consistent grid layout for spacing.
// - Removes extra theme controls to simplify the UI.
// - Implements a swipe-to-dismiss gesture with an elastic effect and optional subtle parallax,
//   but also includes a clearly visible close button to avoid unintended page refreshes.
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
  // State for swipe-to-dismiss gesture
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  // Record the time when the swipe starts to capture duration analytics
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const swipeThreshold = 120; // Minimum swipe distance required for dismissal

  // State to show a contextual tooltip (hint for dismissing)
  const [showTooltip, setShowTooltip] = useState(true);

  // Handle initial touch – record starting Y position and timestamp, and show tooltip.
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default behavior to avoid triggering native refresh.
    e.preventDefault();
    setTouchStartY(e.touches[0].clientY);
    setSwipeStartTime(Date.now());
    setShowTooltip(true);
  };

  // Handle touch move with an elastic effect (with resistance) and optional parallax effect.
  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default to help block native refresh behavior.
    e.preventDefault();
    if (touchStartY !== null) {
      const delta = e.touches[0].clientY - touchStartY;
      // Only consider downward swipes and apply resistance
      setTouchDeltaY(delta > 0 ? delta * 0.5 : 0);
    }
  };

  // On touch end, if the swipe distance is sufficient, dismiss the menu.
  // Capture swipe analytics (distance and duration). Otherwise, reset.
  const handleTouchEnd = () => {
    const swipeDuration = swipeStartTime ? Date.now() - swipeStartTime : 0;
    if (touchDeltaY > swipeThreshold) {
      trackEvent("mobile_menu_swipe_dismiss", {
        swipeDistance: touchDeltaY,
        swipeDuration,
      });
      closeMenu();
    }
    // Reset swipe states
    setTouchStartY(null);
    setTouchDeltaY(0);
    setSwipeStartTime(null);
    setShowTooltip(false);
  };

  // Calculate style for the menu translation with a subtle parallax effect.
  const menuStyle = {
    transform: isOpen ? `translateY(${touchDeltaY}px)` : "translateY(100%)",
    transition:
      touchStartY === null
        ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)"
        : "none",
  };

  return (
    <>
      {/* Blurred overlay with semi-transparent background */}
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
          {/* Expanded ARIA live region with detailed feedback */}
          <div aria-live="assertive" className="sr-only">
            {isOpen
              ? "Mobile menu opened. Swipe down to dismiss, or tap the close button."
              : "Mobile menu closed."}
          </div>

          {/* Header area with a drag indicator and a clearly visible close button */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 bg-gray-400 rounded-full" />
              {showTooltip && (
                <span className="text-xs text-gray-500">
                  Swipe down to dismiss
                </span>
              )}
            </div>
            {/* Close button as a fallback to prevent unintended refresh */}
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              &times;
            </button>
          </div>

          {/* Content area using grid for spacing and clear visual dividers */}
          <div className="px-6 py-4 grid gap-6">
            {/* Navigation items */}
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

            {/* CTAs – only key actions remain (no extra theme controls) */}
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
