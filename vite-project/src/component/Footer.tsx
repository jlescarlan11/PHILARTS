import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your analytics/tracking code here
  };

  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[var(--color-secondary)]">
            Nutcha Bite
          </h3>
          <p className="text-sm text-gray-600">
            Savor Every Bite - Our mission is to delight your taste buds with
            fresh, flavorful experiences that inspire every meal.
          </p>
          <address className="not-italic text-sm text-gray-600">
            1234 Culinary St.
            <br />
            Flavor Town, USA
            <br />
            <a
              href="mailto:contact@nutchabite.com"
              className="text-[var(--color-accent)] hover:underline transition-colors"
            >
              contact@nutchabite.com
            </a>
          </address>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation" className="space-y-2">
          <ul className="space-y-2">
            <li>
              <a
                href="#home"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#menu"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                Menu
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="#privacy"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-[var(--color-accent)] hover:underline transition-colors"
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        {/* Newsletter Subscription CTA */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
            Join Our Newsletter
          </h4>
          <p className="text-sm text-gray-600">
            Get the latest updates and exclusive offers delivered straight to
            your inbox.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              type="email"
              id="newsletter-email"
              placeholder="Enter your email"
              required
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              aria-label="Email address for newsletter subscription"
            />
            <button
              type="submit"
              data-tracking="newsletter-subscribe"
              className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Media & Trust Badge */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
            Connect with Us
          </h4>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105"
            >
              <FaInstagram size={20} />
            </a>
          </div>
          {/* Social Proof */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Trusted by over 10,000 happy customers!
            </p>
          </div>
        </div>
      </div>
      {/* Bottom Footer */}
      <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Nutcha Bite. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
