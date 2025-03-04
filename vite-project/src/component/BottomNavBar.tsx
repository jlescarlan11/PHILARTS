// BottomNavBar.tsx
// Redesigned sticky bottom navigation bar with a compact layout.
// It now includes a dark mode toggle button, key CTAs ("Order Now" and "Cart"),
// and micro-interaction effects for enhanced engagement.
import React from "react";
import { HashLink } from "react-router-hash-link";
import { MdShoppingCart, MdDarkMode, MdLightMode } from "react-icons/md";
import { trackEvent } from "../utils/analytics";

interface BottomNavBarProps {
  cartCount: number;
  navigate: (path: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  cartCount,
  navigate,
  darkMode,
  toggleDarkMode,
}) => {
  return (
    <div
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-inner flex justify-around items-center py-1 z-40"
    >
      {/* Dark mode toggle button added to the bottom nav */}
      <button
        onClick={() => {
          toggleDarkMode();
          trackEvent("bottom_nav_darkmode_toggle", { darkMode: !darkMode });
        }}
        className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition transform duration-200 hover:scale-105 hover:shadow-sm"
        title="Toggle Dark Mode"
      >
        {darkMode ? (
          <MdLightMode className="w-6 h-6" />
        ) : (
          <MdDarkMode className="w-6 h-6" />
        )}
      </button>

      <HashLink
        smooth
        to="/#products"
        onClick={() => trackEvent("bottom_nav_click", { section: "order" })}
        className="text-base font-bold px-3 py-1 rounded bg-green-700 text-white transition transform duration-200 hover:scale-105 hover:shadow-sm"
      >
        Order Now
      </HashLink>

      <button
        onClick={() => {
          trackEvent("bottom_nav_click", { section: "cart" });
          navigate("/cart");
        }}
        className="relative p-1 focus:outline-none focus:ring-3 focus:ring-red-500 transition transform duration-200 hover:scale-105 hover:shadow-sm"
        title="View Cart"
      >
        <MdShoppingCart className="w-7 h-7" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default BottomNavBar;
