import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";

/* -------------------------------------------------------
   Custom Hook: useInViewAnimation
   Detects when an element enters the viewport using IntersectionObserver.
   Falls back gracefully if the browser does not support IntersectionObserver.
   Returns a ref, a boolean flag indicating visibility, and an announcement for screen readers.
-------------------------------------------------------- */
const useInViewAnimation = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    // Fallback if IntersectionObserver is unsupported
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      setAnnouncement("About section is now visible.");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setAnnouncement("About section is now visible.");
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);

  return { ref, inView, announcement };
};

/* -------------------------------------------------------
   AboutVisual Component
   Displays the visual content using a responsive, progressively loaded image.
   Includes a subtle hover scale effect and optional parallax effect.
-------------------------------------------------------- */
const AboutVisual: React.FC = () => {
  return (
    <div className="md:w-1/2">
      <picture>
        {/* Low-res image for mobile */}
        <source
          media="(max-width: 640px)"
          srcSet="/images/about-nutchabite-lowres.jpg"
          type="image/jpeg"
        />
        {/* High-res image for desktop */}
        <source
          media="(min-width: 641px)"
          srcSet="/images/about-nutchabite-highres.jpg"
          type="image/jpeg"
        />
        <img
          src="/images/about-nutchabite-highres.jpg"
          alt="Nutcha Bite delicacy with a matcha twist, blending Iloilo tradition with modern flavor"
          loading="lazy"
          className="rounded-lg shadow-lg w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </picture>
    </div>
  );
};

/* -------------------------------------------------------
   AboutNarrative Component
   Displays the narrative copy, trust signals, and interactive CTA.
   Includes subtle parallax movement and clear focus styles for keyboard users.
-------------------------------------------------------- */
const AboutNarrative: React.FC<{ inView: boolean; onCTAClick: () => void }> = ({
  inView,
  onCTAClick,
}) => {
  return (
    <div
      className="md:w-1/2 md:pl-12 mt-8 md:mt-0 transform transition-transform duration-700 ease-out"
      style={{ transform: inView ? "translateY(0)" : "translateY(20px)" }}
    >
      <h2 className="text-4xl font-bold mb-4">About Nutcha Bite</h2>
      <p className="mb-4 text-lg">
        Nestled in the heart of Iloilo, Nutcha Bite celebrates a rich culinary
        heritage by infusing a classic delicacy with an unexpected twist of
        matcha. Our recipe honors centuries-old traditions while embracing
        modern innovation.
      </p>
      <p className="mb-4 text-lg">
        Each bite is a journey into the vibrant flavors of Iloilo – where
        time-honored techniques meet subtle, earthy matcha notes. The result is
        a delicacy that captivates both the palate and the imagination.
      </p>
      <p className="mb-4 text-lg">
        At Nutcha Bite, passion, tradition, and creativity converge to deliver
        an unforgettable taste experience that feels both nostalgic and
        refreshingly contemporary.
      </p>
      {/* Trust signal: Testimonial snippet */}
      <div className="mb-6 p-4 border-l-4 border-[var(--color-tertiary)] bg-white bg-opacity-80 rounded shadow-sm">
        <p className="italic text-[var(--color-secondary)]">
          "Nutcha Bite transports me back to my childhood while introducing me
          to exciting new flavors. A true masterpiece!" – Satisfied Customer
        </p>
      </div>
      <HashLink
        smooth
        to="#menu"
        onClick={onCTAClick}
        title="Explore Our Menu"
        role="button"
        aria-label="Explore Our Menu"
        className="inline-block mt-4 px-8 py-3 bg-[var(--color-tertiary)] text-white rounded-full focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)] hover:bg-opacity-90 transition duration-300 ease-in-out animate-pulse"
      >
        Explore Our Menu
      </HashLink>
    </div>
  );
};

/* -------------------------------------------------------
   AboutSection Component
   Combines the visual and narrative subcomponents.
   Implements an ARIA live region for dynamic announcements and tracks conversion analytics.
   Also includes an interactive scroll indicator.
-------------------------------------------------------- */
const AboutSection: React.FC = () => {
  const { ref, inView, announcement } = useInViewAnimation(0.2);

  // Conversion tracking for CTA click (and potential A/B testing in future)
  const handleCTAClick = () => {
    if (window.gtag) {
      window.gtag("event", "cta_click", {
        event_category: "AboutSection",
        event_label: "Explore Our Menu",
      });
    }
  };

  // Track scroll depth and time spent in the section for further analytics (example)
  useEffect(() => {
    let startTime = Date.now();
    const handleScroll = () => {
      const scrollDepth = window.scrollY;
      if (window.gtag) {
        window.gtag("event", "about_scroll", {
          event_category: "AboutSection",
          event_label: "Scroll Depth",
          value: scrollDepth,
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      const timeSpent = Date.now() - startTime;
      if (window.gtag) {
        window.gtag("event", "about_time_spent", {
          event_category: "AboutSection",
          event_label: "Time Spent (ms)",
          value: timeSpent,
        });
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Expanded JSON‑LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Nutcha Bite",
    description:
      "Discover the story behind Nutcha Bite – an Iloilo delicacy with a twist of matcha that honors tradition and embraces innovation.",
    publisher: {
      "@type": "Organization",
      name: "Nutcha Bite",
      url: "https://nutchabite.com",
      logo: {
        "@type": "ImageObject",
        url: "https://nutchabite.com/logo.svg",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-555-1234",
        contactType: "Customer Service",
      },
      sameAs: [
        "https://facebook.com/nutchabite",
        "https://instagram.com/nutchabite",
        "https://twitter.com/nutchabite",
      ],
    },
  };

  return (
    <>
      {/* SEO: JSON‑LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ARIA Live Region for dynamic announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <section
        id="about"
        ref={ref}
        className={`bg-[var(--color-primary)] text-[var(--color-secondary)] py-16 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        role="region"
        aria-label="About Nutcha Bite"
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <AboutVisual />
          <AboutNarrative inView={inView} onCTAClick={handleCTAClick} />
        </div>
        {/* Interactive Scroll Indicator */}
        <div className="mt-12 flex justify-center">
          <HashLink
            smooth
            to="#menu"
            title="Scroll Down"
            className="animate-bounce text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-tertiary)]"
            aria-label="Scroll Down to Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </HashLink>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
