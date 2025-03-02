import React, { useState, lazy, Suspense } from "react";

// Lazy load social media icons for performance.
const FaFacebookF = lazy(() =>
  import("react-icons/fa").then((mod) => ({ default: mod.FaFacebookF }))
);
const FaTwitter = lazy(() =>
  import("react-icons/fa").then((mod) => ({ default: mod.FaTwitter }))
);
const FaInstagram = lazy(() =>
  import("react-icons/fa").then((mod) => ({ default: mod.FaInstagram }))
);

const Footer: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Real-time email validation.
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  // Stub for analytics tracking.
  const trackEvent = (eventName: string) => {
    console.log(`Analytics event: ${eventName}`);
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailError || email === "") {
      setEmailError("Please enter a valid email address.");
      return;
    }
    // Simulate successful subscription.
    setSubscriptionSuccess(true);
    trackEvent("newsletter_subscribe");
    setEmail("");
  };

  return (
    <footer
      className={`${
        darkMode ? "dark" : ""
      } transition-colors duration-300 bg-gray-50 dark:bg-gray-900`}
    >
      <div className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-4">
        {/* Company Info & Dark Mode Toggle */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Nutcha Bite
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            At Nutcha Bite, we bring you flavors that excite and satisfy. Our
            mission is to create memorable culinary experiences that nourish
            both body and soul.
          </p>
          <address className="not-italic text-sm text-gray-600 dark:text-gray-300">
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
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </section>

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation" className="space-y-2">
          <ul className="space-y-2">
            <li>
              <a
                href="#home"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#menu"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                Menu
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#careers"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#privacy"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-[var(--color-accent)] hover:underline focus:underline transition-colors"
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        {/* Newsletter Subscription */}
        <section className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Subscribe &amp; Get 10% Off!
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Join our newsletter for exclusive offers and updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email Address
            </label>
            <input
              type="email"
              id="newsletter-email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
              aria-invalid={emailError ? "true" : "false"}
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
            {subscriptionSuccess && (
              <p className="text-green-500 text-xs">
                Thank you for subscribing!
              </p>
            )}
            <button
              type="submit"
              data-tracking="newsletter-subscribe"
              className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
            >
              Join Now
            </button>
          </form>
        </section>

        {/* Social Media & Trust Signals */}
        <section className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Connect with Us
          </h4>
          <div className="flex space-x-4">
            <Suspense fallback={<div>Loading...</div>}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <FaFacebookF size={20} />
              </a>
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <FaTwitter size={20} />
              </a>
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <FaInstagram size={20} />
              </a>
            </Suspense>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "Nutcha Bite transformed my dining experience!" - A Happy Customer
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trusted by over 10,000 satisfied food lovers.
            </p>
          </div>
        </section>
      </div>
      {/* Bottom Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Nutcha Bite. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
