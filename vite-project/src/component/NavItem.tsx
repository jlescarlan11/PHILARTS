// Reusable navigation item with enhanced accessibility (ARIA roles, keyboard focus).
import React from "react";
import { HashLink } from "react-router-hash-link";
import { trackEvent } from "../utils/analytics";

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
    <li role="none" className="w-full">
      <HashLink
        smooth
        to={url}
        role="menuitem"
        tabIndex={0}
        title={`Navigate to ${name}`}
        onClick={() => {
          onClick(sectionId);
          trackEvent("nav_click", { element: "NavItem", name, url });
        }}
        aria-current={isActive ? "page" : undefined}
        className={`block px-4 py-3 text-base md:text-lg transition-transform duration-300 ease-in-out transform
          hover:scale-105 hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
          ${
            isActive ? "font-bold border-b-2 border-[var(--color-accent)]" : ""
          }`}
      >
        {name}
      </HashLink>
    </li>
  );
};

export default NavItem;
