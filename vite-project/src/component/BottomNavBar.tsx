// BottomNavBar.tsx
// This sticky bottom navigation bar is designed to be short and unobtrusive.
// It uses minimal vertical padding and a compact layout while clearly displaying the key CTAs.
import React from "react";
import { HashLink } from "react-router-hash-link";
import { MdShoppingCart } from "react-icons/md";
import { trackEvent } from "../utils/analytics";

interface BottomNavBarProps {
  cartCount: number;
  navigate: (path: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ cartCount, navigate }) => {
  return (
    <div
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-inner flex justify-around items-center py-2 z-40"
    >
      <HashLink
        smooth
        to="/#products"
        onClick={() => trackEvent("bottom_nav_click", { section: "order" })}
        className="text-lg font-bold px-4 py-2 rounded bg-green-700 text-white transition transform duration-200 hover:scale-105 hover:shadow-md"
      >
        Order Now
      </HashLink>
      <button
        onClick={() => {
          trackEvent("bottom_nav_click", { section: "cart" });
          navigate("/cart");
        }}
        className="relative p-2 focus:outline-none focus:ring-3 focus:ring-red-500 transition transform duration-200 hover:scale-105 hover:shadow-md"
        title="View Cart"
      >
        <MdShoppingCart className="w-8 h-8" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default BottomNavBar;
