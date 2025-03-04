// MobileMenu.tsx
// Refactored mobile bottom sheet modal with a minimal, modern design.
// Uses a grid layout with ample whitespace, clear dividers, and a refined visual hierarchy.
// Implements an elastic swipe-to-dismiss gesture with a subtle parallax offset and a tooltip hint.
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
  // Swipe-to-dismiss states
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const swipeThreshold = 120; // Minimum swipe distance to trigger dismissal

  // Show a subtle tooltip hint during swipe
  const [showTooltip, setShowTooltip] = useState(true);

  // Record initial touch position and time
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setSwipeStartTime(Date.now());
    setShowTooltip(true);
  };

  // Apply an elastic effect with a subtle parallax offset during swipe
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const delta = e.touches[0].clientY - touchStartY;
      // Apply resistance so that the movement feels elastic
      setTouchDeltaY(delta > 0 ? delta * 0.5 : 0);
    }
  };

  // On touch end, if the swipe exceeds the threshold, dismiss the menu.
  // Also capture swipe analytics (distance and duration).
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

  // Calculate a parallax translation style with elastic easing.
  const menuStyle = {
    transform: isOpen ? `translateY(${touchDeltaY}px)` : "translateY(100%)",
    transition:
      touchStartY === null
        ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)"
        : "none",
  };

  return (
    <>
      {/* Blurred semi-transparent overlay */}
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
          {/* Expanded ARIA live region for detailed state feedback */}
          <div aria-live="assertive" className="sr-only">
            {isOpen
              ? "Mobile menu opened. Swipe down to dismiss."
              : "Mobile menu closed."}
          </div>

          {/* Drag indicator with subtle tooltip hint */}
          <div className="flex flex-col items-center py-2">
            <div className="w-12 h-1 bg-gray-400 rounded-full mb-1" />
            {showTooltip && (
              <span className="text-xs text-gray-500">
                Swipe down to dismiss
              </span>
            )}
          </div>

          {/* Main content layout using grid for consistent spacing */}
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

            {/* CTA area with dark mode toggle and key actions */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <DarkModeToggle
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
                {/* Removed theme controls entirely for simplified dark mode logic */}
              </div>
              <button
                title="Go to Cart"
                onClick={() => {
                  closeMenu();
                  navigate("/cart");
                }}
                className="w-full py-3 rounded bg-red-600 text-white font-bold focus:outline-none focus:ring-4 focus:ring-red-500 transition transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              <HashLink
                smooth
                to="/#products"
                onClick={() => handleNavItemClick("order")}
                title="Order Now"
                className="block text-center w-full py-3 rounded bg-green-600 text-white font-bold focus:outline-none focus:ring-4 focus:ring-green-500 transition transform duration-200 hover:scale-105 hover:shadow-lg"
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
