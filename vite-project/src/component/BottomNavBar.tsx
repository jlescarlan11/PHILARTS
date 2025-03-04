// BottomNavBar.tsx
// Sticky bottom navigation bar that emphasizes key CTAs with enlarged buttons,
// bold contrasting colors, and micro-interactions (scaling and shadow effects) on tap.
// This component is separate from the mobile menu, ensuring key actions are always visible.
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
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-inner flex justify-around items-center py-4 z-40"
    >
      <HashLink
        smooth
        to="/#products"
        onClick={() => trackEvent("bottom_nav_click", { section: "order" })}
        className="text-xl font-bold px-6 py-3 rounded bg-green-800 text-white transition transform duration-200 hover:scale-105 hover:shadow-lg"
      >
        Order Now
      </HashLink>
      <button
        onClick={() => {
          trackEvent("bottom_nav_click", { section: "cart" });
          navigate("/cart");
        }}
        className="relative p-3 focus:outline-none focus:ring-4 focus:ring-red-500 transition transform duration-200 hover:scale-105 hover:shadow-lg"
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
