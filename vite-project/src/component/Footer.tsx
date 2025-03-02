import React, { useState, lazy, Suspense, ChangeEvent, FormEvent } from "react";

// Lazy load social icons for performance
const FaFacebookF = lazy(() =>
  import("react-icons/fa").then((module) => ({ default: module.FaFacebookF }))
);
const FaTwitter = lazy(() =>
  import("react-icons/fa").then((module) => ({ default: module.FaTwitter }))
);
const FaInstagram = lazy(() =>
  import("react-icons/fa").then((module) => ({ default: module.FaInstagram }))
);

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simple email regex validation
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setError("Please enter a valid email address.");
    } else {
      setError(null);
    }
  };

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Simulate analytics tracking
    console.log("Newsletter subscribe clicked", email);
    // Simulate subscription success with a discount incentive
    setSuccess(
      "Thank you for subscribing! Enjoy a 10% discount on your next order."
    );
    setEmail("");
  };

  // Analytics tracking for social interactions
  const handleSocialClick = (platform: string) => {
    console.log(`Social icon clicked: ${platform}`);
  };

  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
        {/* Brand Story & Contact */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-secondary">Nutcha Bite</h3>
          <p className="text-sm text-gray-600">
            At Nutcha Bite, we blend passion with flavor. Our mission is to
            serve fresh, innovative, and delectable cuisine that nourishes both
            body and soul.
          </p>
          <address className="not-italic text-sm text-gray-600">
            1234 Culinary St.
            <br />
            Flavor Town, USA
            <br />
            <a
              href="mailto:contact@nutchabite.com"
              className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#menu"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Menu
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="#privacy"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#careers"
                className="text-accent hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Careers
              </a>
            </li>
          </ul>
        </nav>

        {/* Newsletter Subscription Form */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-secondary">
            Join Our Newsletter
          </h4>
          <p className="text-sm text-gray-600">
            Subscribe now and get a 10% discount on your next order, plus
            exclusive updates and offers.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              type="email"
              id="newsletter-email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Email address for newsletter subscription"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {success && <p className="text-green-500 text-xs">{success}</p>}
            <button
              type="submit"
              data-cta="subscribeA"
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            >
              Get Started & Save 10%
            </button>
          </form>
        </div>

        {/* Social Media & Trust Signals */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-secondary">
            Connect with Us
          </h4>
          <div className="flex space-x-4">
            <Suspense fallback={<div>Loading...</div>}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                onClick={() => handleSocialClick("Facebook")}
                className="text-accent hover:text-accent/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                onClick={() => handleSocialClick("Twitter")}
                className="text-accent hover:text-accent/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                onClick={() => handleSocialClick("Instagram")}
                className="text-accent hover:text-accent/80 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <FaInstagram size={20} />
              </a>
            </Suspense>
          </div>
          {/* Trust Signals */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              "Best dining experience ever!" - A Happy Customer
            </p>
            <div className="mt-2">
              <img
                src="/trust-badge.png"
                alt="Trust Badge"
                className="w-24 h-auto"
                loading="lazy"
              />
            </div>
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
