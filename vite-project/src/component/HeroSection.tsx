import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLink } from "react-router-hash-link";
import heroImage from "../assets/hero-image.webp";
import Navbar from "./NavBar";

/* --------------------------------------------
   Analytics Utility with Rich Metadata & Error Handling
----------------------------------------------- */
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    // Replace this with your real analytics integration (e.g., Google Analytics)
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.warn("Analytics not available", eventName, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

/* --------------------------------------------
   useParallax Custom Hook
   Uses requestAnimationFrame for smooth parallax effect
----------------------------------------------- */
const useParallax = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.3); // Adjust parallax factor as needed
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return offset;
};

/* --------------------------------------------
   LazyBackgroundImage Component
   Handles progressive image loading with a low-res fallback.
   Accepts next‑gen image formats (e.g., WebP).
----------------------------------------------- */
interface LazyBackgroundImageProps {
  lowResSrc: string;
  highResSrc: string;
  className?: string;
}
const LazyBackgroundImage: React.FC<LazyBackgroundImageProps> = ({
  lowResSrc,
  highResSrc,
  className,
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = highResSrc;
    img.onload = () => setHighResLoaded(true);
  }, [highResSrc]);

  return (
    <>
      {/* High-resolution image */}
      <div
        className={`${className} absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          highResLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${heroImage}})` }}
      ></div>
      {/* Low-resolution fallback image */}
      <div
        className={`${className} absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          highResLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
    </>
  );
};

/* --------------------------------------------
   HeroSection Component
----------------------------------------------- */
const HeroSection: React.FC = () => {
  const parallaxOffset = useParallax();
  const heroRef = useRef<HTMLDivElement>(null);
  const [announceMessage, setAnnounceMessage] = useState("");

  // Track hero impression using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackEvent("hero_impression", {
              timestamp: Date.now(),
              section: "hero",
            });
          }
        });
      },
      { threshold: 0.5 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  // Track scroll depth for analytics
  useEffect(() => {
    const handleScrollDepth = () => {
      trackEvent("hero_scroll_depth", {
        depth: window.scrollY,
        timestamp: Date.now(),
      });
    };
    window.addEventListener("scroll", handleScrollDepth, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollDepth);
  }, []);

  // Announce high-res image load (this could be triggered via a callback from LazyBackgroundImage for real-time updates)
  useEffect(() => {
    const timer = setTimeout(
      () => setAnnounceMessage("High resolution image loaded"),
      1000
    );
    return () => clearTimeout(timer);
  }, []);

  // Expanded JSON‑LD structured data (Organization and BreadcrumbList added)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPageElement",
      name: "Hero Section",
      description: "Experience the Twist of Tradition with Nutcha Bite",
      image: "https://nutchabite.com/images/delicacy-highres.webp",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nutcha Bite",
      url: "https://nutchabite.com",
      logo: "https://nutchabite.com/logo.svg",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://nutchabite.com/#hero",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Order",
          item: "https://nutchabite.com/#order",
        },
      ],
    },
  ];

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ARIA Live Region for dynamic announcements (e.g., image load, parallax updates) */}
      <div aria-live="polite" className="sr-only">
        {announceMessage}
      </div>
      {/* Full-screen hero section with role="banner" for accessibility */}
      <section
        id="hero"
        role="banner"
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Lazy-loaded background images with progressive loading (WebP format) */}
        <LazyBackgroundImage
          lowResSrc="/images/delicacy-lowres.webp" // Replace with your low-res image URL
          highResSrc="/images/delicacy-highres.webp" // Replace with your high-res image URL
          className=""
        />
        {/* Overlay for improved text readability.
            Ensure that the color values defined in var(--color-primary),
            var(--color-tertiary), and var(--color-accent) meet WCAG contrast guidelines. */}
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-60"></div>
        {/* Hero content container with subtle fade-in and parallax effect */}
        <div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-tertiary)] drop-shadow-lg">
            Experience the Twist of Tradition
          </h1>
          <p className="mt-4 text-xl text-[var(--color-tertiary)] max-w-2xl">
            "Every bite tells a story of passion and flavor." – A Happy Customer
          </p>
          <HashLink
            smooth
            to="#order"
            title="Order Now"
            onClick={() =>
              trackEvent("cta_click", {
                element: "Order Now",
                section: "hero",
                timestamp: Date.now(),
              })
            }
            className="mt-8 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-tertiary)] ripple"
          >
            Order Now
          </HashLink>
        </div>
        {/* Scroll Down Indicator with periodic animation */}
        <div className="z-10 absolute bottom-8 w-full flex justify-center">
          <HashLink
            smooth
            to="#product"
            title="Scroll Down"
            aria-label="Scroll down"
            className="animate-bounce text-[var(--color-tertiary)]"
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

export default HeroSection;
