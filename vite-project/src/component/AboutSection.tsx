import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";
import aboutImage from "../assets/hero-image.webp";

/* -------------------------------------------------------
   Custom Hook: useInViewAnimation
   Detects when an element enters the viewport using IntersectionObserver.
-------------------------------------------------------- */
const useInViewAnimation = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    // Fallback for unsupported browsers.
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
   Displays the visual content with responsive image handling.
-------------------------------------------------------- */
const AboutVisual: React.FC = () => {
  return (
    <div className="w-full md:w-1/2 mb-8 md:mb-0">
      <picture>
        <source
          media="(max-width: 640px)"
          srcSet={aboutImage}
          type="image/jpeg"
        />
        <source
          media="(min-width: 641px)"
          srcSet={aboutImage}
          type="image/jpeg"
        />
        <img
          src="/images/about-nutchabite-highres.jpg"
          alt="Nutcha Bite delicacy with a matcha twist, blending Iloilo tradition with modern flavor"
          loading="lazy"
          className="rounded-lg shadow-lg w-full max-h-[500px] object-cover transition-transform duration-500 hover:scale-105"
        />
      </picture>
    </div>
  );
};

/* -------------------------------------------------------
   AboutNarrative Component
   Displays the narrative text, testimonial, and interactive CTA.
-------------------------------------------------------- */
interface AboutNarrativeProps {
  inView: boolean;
  onCTAClick: () => void;
}
const AboutNarrative: React.FC<AboutNarrativeProps> = ({
  inView,
  onCTAClick,
}) => {
  return (
    <div
      className="w-full md:w-1/2 md:pl-12"
      style={{
        transform: inView ? "translateY(0)" : "translateY(10px)",
        transition: "transform 500ms ease-out",
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)] mb-4">
        About Nutcha Bites
      </h2>
      <p className="mb-4 text-base sm:text-lg text-justify">
        Nestled in the heart of Iloilo, Nutcha Bite celebrates a rich culinary
        heritage by infusing a classic delicacy with an unexpected twist of
        matcha. Our recipe honors centuries‑old traditions while embracing
        modern innovation.
      </p>
      <p className="mb-4 text-base sm:text-lg text-justify">
        Each bite is a journey into the vibrant flavors of Iloilo – where
        time‑honored techniques meet subtle, earthy matcha notes. The result is
        a delicacy that captivates both the palate and the imagination.
      </p>
      <p className="mb-4 text-base sm:text-lg text-justify">
        At Nutcha Bite, passion, tradition, and creativity converge to deliver
        an unforgettable taste experience that feels both nostalgic and
        refreshingly contemporary.
      </p>
      <div className="mb-6 p-4 border-l-4 border-[var(--color-tertiary)] bg-[var(--color-tertiary-10)] bg-opacity-80 rounded shadow-sm">
        <p className="italic text-[var(--color-secondary)] text-justify">
          "Nutcha Bite transports me back to my childhood while introducing me
          to exciting new flavors. A true masterpiece!"
        </p>
        <p className="italic text-[var(--color-secondary)] text-justify">
          - Satisfied Customer
        </p>
      </div>
      <HashLink
        smooth
        to="#menu"
        onClick={onCTAClick}
        title="Explore Our Menu"
        role="button"
        aria-label="Explore Our Menu"
        className="block w-full text-center mt-4 px-6 py-4 bg-[var(--color-accent)] text-[var(--color-primary)] text-lg font-semibold rounded-full focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition duration-300 ease-in-out"
      >
        Explore Our Menu
      </HashLink>
    </div>
  );
};

/* -------------------------------------------------------
   AboutSection Component
   Combines visual and narrative subcomponents, includes dynamic announcements and scroll tracking.
-------------------------------------------------------- */
const AboutSection: React.FC = () => {
  const { ref, inView, announcement } = useInViewAnimation(0.2);

  // Conversion tracking for CTA clicks.
  const handleCTAClick = () => {
    if (window.gtag) {
      window.gtag("event", "cta_click", {
        event_category: "AboutSection",
        event_label: "Explore Our Menu",
      });
    }
  };

  // Example scroll depth and time spent analytics.
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

  // Expanded JSON‑LD structured data for SEO.
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
        className={`bg-[var(--color-primary)] text-[var(--color-secondary)] py-16 px-4 sm:px-6 md:px-8 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        role="region"
        aria-label="About Nutcha Bite"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <AboutVisual />
          <div className="md:ml-12">
            <AboutNarrative inView={inView} onCTAClick={handleCTAClick} />
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
