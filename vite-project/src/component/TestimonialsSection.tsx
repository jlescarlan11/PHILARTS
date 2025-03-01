import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { HashLink } from "react-router-hash-link";

/* -------------------------------------------------------
   Type Definitions
------------------------------------------------------- */
interface Testimonial {
  id: number;
  name: string;
  photo: string;
  rating: number;
  review: string;
  title?: string;
  location?: string;
  verified?: boolean;
  publicationDate?: string;
  reviewCount?: number;
}

/* Sample testimonials data */
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "John Doe",
    photo: "/images/customer1.jpg",
    rating: 5,
    review:
      "Nutcha Bite is simply amazing! The fusion of tradition and matcha flavor is unique and unforgettable. I love every bite!",
    title: "Food Critic",
    location: "Iloilo, Philippines",
    verified: true,
    publicationDate: "2023-01-15",
    reviewCount: 120,
  },
  {
    id: 2,
    name: "Jane Smith",
    photo: "/images/customer2.jpg",
    rating: 4,
    review:
      "A delightful twist on a classic favorite. The subtle matcha notes really elevate the flavor. Highly recommended!",
    title: "Blogger",
    location: "Cebu, Philippines",
    verified: true,
    publicationDate: "2023-02-10",
    reviewCount: 85,
  },
  {
    id: 3,
    name: "Robert Lee",
    photo: "/images/customer3.jpg",
    rating: 5,
    review:
      "The perfect combination of flavors that truly captures the essence of Iloilo. This is a must-try delicacy!",
    title: "Chef",
    location: "Iloilo, Philippines",
    verified: true,
    publicationDate: "2023-03-05",
    reviewCount: 95,
  },
];

/* -------------------------------------------------------
   Analytics Tracker Utility
------------------------------------------------------- */
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.warn("Analytics not available", eventName, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

/* -------------------------------------------------------
   Custom Hook: useSlider
   Manages auto-rotation, progress tracking, pause/play, and keyboard navigation.
------------------------------------------------------- */
const useSlider = (slideCount: number, autoRotateInterval = 5000) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    if (!paused) {
      setProgress(0);
      const startTime = Date.now();
      progressRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.min((elapsed / autoRotateInterval) * 100, 100));
      }, 100);
      intervalRef.current = window.setInterval(() => {
        setCurrent((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
        trackEvent("slide_change", { newSlide: current + 1, method: "auto" });
        setProgress(0);
      }, autoRotateInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, autoRotateInterval, slideCount, current]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setProgress(0);
  };

  return {
    current,
    paused,
    setPaused,
    progress,
    handleKeyDown,
    goToSlide,
    nextSlide,
    prevSlide,
  };
};

/* -------------------------------------------------------
   Subcomponent: TestimonialCard
   Renders an individual testimonial with a "Read More" toggle.
------------------------------------------------------- */
interface TestimonialCardProps {
  testimonial: Testimonial;
  onReadMore: (testimonial: Testimonial) => void;
}
const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  onReadMore,
}) => (
  <div className="w-full flex-shrink-0 flex flex-col items-center p-8">
    <picture>
      <source
        media="(max-width: 640px)"
        srcSet={`${testimonial.photo}?w=200`}
        type="image/jpeg"
      />
      <source
        media="(min-width: 641px)"
        srcSet={testimonial.photo}
        type="image/jpeg"
      />
      <img
        src={testimonial.photo}
        alt={`${testimonial.name}'s photo`}
        loading="lazy"
        className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg transition-transform duration-300 hover:scale-105"
      />
    </picture>
    <div
      className="flex mb-2"
      aria-label={`Rating: ${testimonial.rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-6 w-6 ${
            i < testimonial.rating
              ? "text-[var(--color-accent)]"
              : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.118L10 13.011l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.64 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
        </svg>
      ))}
    </div>
    <p className="text-center text-xl text-[var(--color-secondary)] italic mb-2">
      {testimonial.review.length > 100
        ? testimonial.review.slice(0, 100) + "..."
        : testimonial.review}
    </p>
    <p className="text-center text-lg font-semibold text-[var(--color-accent)]">
      {testimonial.name}
      {testimonial.verified && (
        <span className="ml-2 px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
          Verified Buyer
        </span>
      )}
      {testimonial.title && (
        <span className="block text-sm text-gray-600">{testimonial.title}</span>
      )}
      {testimonial.location && (
        <span className="block text-sm text-gray-600">
          {testimonial.location}
        </span>
      )}
    </p>
    {testimonial.review.length > 100 && (
      <button
        onClick={() => onReadMore(testimonial)}
        className="mt-2 underline text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        aria-label={`Read full testimonial from ${testimonial.name}`}
      >
        Read More
      </button>
    )}
  </div>
);

/* -------------------------------------------------------
   Subcomponent: SliderControls
   Renders navigation arrows, indicator dots, a pause/play toggle, and a progress bar.
------------------------------------------------------- */
interface SliderControlsProps {
  total: number;
  current: number;
  progress: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  paused: boolean;
  onTogglePause: () => void;
}
const SliderControls: React.FC<SliderControlsProps> = ({
  total,
  current,
  progress,
  onPrev,
  onNext,
  onSelect,
  paused,
  onTogglePause,
}) => (
  <>
    {/* Navigation Arrows */}
    <button
      onClick={onPrev}
      aria-label="Previous Testimonial"
      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-[var(--color-secondary)] rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] pulse"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <button
      onClick={onNext}
      aria-label="Next Testimonial"
      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-[var(--color-secondary)] rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] pulse"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
    {/* Indicator Dots */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-3 h-3 rounded-full focus:outline-none ${
            i === current ? "bg-[var(--color-accent)]" : "bg-gray-300"
          }`}
          aria-label={`Go to testimonial ${i + 1}`}
        ></button>
      ))}
    </div>
    {/* Pause/Play Toggle */}
    <button
      onClick={onTogglePause}
      aria-label={paused ? "Play slideshow" : "Pause slideshow"}
      className="absolute top-4 right-4 bg-white text-[var(--color-secondary)] rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] pulse"
    >
      {paused ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
        </svg>
      )}
    </button>
    {/* Progress Bar */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
      <div
        className="h-1 bg-[var(--color-accent)] transition-all duration-100"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </>
);

/* -------------------------------------------------------
   Subcomponent: Modal
   Generic modal to display confirmation messages.
------------------------------------------------------- */
interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
}
const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
  >
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onClose}
      aria-hidden="true"
    ></div>
    <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10">
      <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
        {title}
      </h3>
      <p className="mt-2 text-[var(--color-secondary)]">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ripple"
        aria-label="Close"
      >
        Close
      </button>
    </div>
  </div>
);

/* -------------------------------------------------------
   Subcomponent: ReviewFormModal
   Modal for submitting a review, now including additional fields for reviewer's name, occupation, and address.
------------------------------------------------------- */
interface ReviewFormModalProps {
  onSubmit: (
    review: string,
    rating: number,
    name: string,
    occupation: string,
    address: string
  ) => void;
  onClose: () => void;
}
const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  onSubmit,
  onClose,
}) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-10">
        <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
          Submit Your Review
        </h3>
        <div className="mb-4">
          <span className="block mb-1 text-[var(--color-secondary)]">
            Rating:
          </span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
                aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
              >
                <svg
                  className={`h-6 w-6 transition-colors duration-200 ${
                    i < rating ? "text-[var(--color-accent)]" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.118L10 13.011l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.64 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Write your review here..."
          aria-label="Review Text"
        ></textarea>
        <div className="mt-4">
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Your Name"
            aria-label="Your Name"
          />
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Your Occupation"
            aria-label="Your Occupation"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Your Address (e.g., Iloilo, Philippines)"
            aria-label="Your Address"
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Cancel review submission"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSubmit(reviewText, rating, reviewerName, occupation, address)
            }
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ripple"
            aria-label="Submit your review"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Main Component: TestimonialsSection
   Combines slider, modals for review submission and share confirmation,
   and conversion tracking.
------------------------------------------------------- */
const TestimonialsSection: React.FC = () => {
  const {
    current,
    paused,
    setPaused,
    progress,
    handleKeyDown,
    goToSlide,
    nextSlide,
    prevSlide,
  } = useSlider(testimonials.length, 5000);
  const [announcement, setAnnouncement] = useState("");
  const [fullReview, setFullReview] = useState<Testimonial | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewSuccessOpen, setReviewSuccessOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<string>("");

  // Announce current slide
  useEffect(() => {
    const message = `Slide ${current + 1} of ${testimonials.length}`;
    setAnnouncement(message);
    trackEvent("slide_impression", { slide: current + 1 });
  }, [current]);

  // Keyboard navigation for slider container.
  const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") prevSlide();
    else if (e.key === "ArrowRight") nextSlide();
  };

  // Handle review submission with rating and additional reviewer details.
  const handleReviewSubmit = (
    review: string,
    rating: number,
    name: string,
    occupation: string,
    address: string
  ) => {
    trackEvent("review_submitted", {
      review,
      rating,
      name,
      occupation,
      address,
    });
    setReviewFormOpen(false);
    setReviewSuccessOpen(true);
  };

  // Handler for social share: opens modal confirmation.
  const handleShareClick = (platform: string) => {
    setSharePlatform(platform);
    setShareModalOpen(true);
    trackEvent("share_click", { platform });
  };

  return (
    <section
      id="testimonials"
      className="py-16 bg-white"
      role="region"
      aria-label="Customer Testimonials"
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
    >
      {/* ARIA live region for slide announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-secondary)] mb-8">
          What Our Customers Say
        </h2>
        {/* Slider Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onReadMore={setFullReview}
              />
            ))}
          </div>
          <SliderControls
            total={testimonials.length}
            current={current}
            progress={progress}
            onPrev={prevSlide}
            onNext={nextSlide}
            onSelect={goToSlide}
            paused={paused}
            onTogglePause={() => setPaused(!paused)}
          />
        </div>
        {/* Additional CTAs */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setReviewFormOpen(true)}
            className="px-8 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]"
            aria-label="Submit Your Review"
          >
            Submit Your Review
          </button>
          <button
            onClick={() => handleShareClick("Facebook")}
            className="ml-4 px-8 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]"
            aria-label="Share on Facebook"
          >
            Share on Facebook
          </button>
          <button
            onClick={() => handleShareClick("Twitter")}
            className="ml-4 px-8 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]"
            aria-label="Share on Twitter"
          >
            Share on Twitter
          </button>
        </div>
      </div>
      {/* Modals */}
      {fullReview && (
        <Modal
          title="Full Testimonial"
          message={fullReview.review}
          onClose={() => setFullReview(null)}
        />
      )}
      {reviewFormOpen && (
        <ReviewFormModal
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewFormOpen(false)}
        />
      )}
      {reviewSuccessOpen && (
        <Modal
          title="Review Submitted"
          message="Thank you! Your review has been submitted."
          onClose={() => setReviewSuccessOpen(false)}
        />
      )}
      {shareModalOpen && (
        <Modal
          title="Shared Successfully"
          message={`This testimonial has been shared on ${sharePlatform}.`}
          onClose={() => setShareModalOpen(false)}
        />
      )}
      {/* JSON‑LD Structured Data for Reviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: testimonials.map((testimonial, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Review",
                author: testimonial.name,
                datePublished: testimonial.publicationDate || "2023-01-01",
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: testimonial.rating,
                  bestRating: "5",
                  worstRating: "1",
                },
                reviewBody: testimonial.review,
                publisher: {
                  "@type": "Organization",
                  name: "Nutcha Bite",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: testimonial.rating,
                  reviewCount: testimonial.reviewCount || 0,
                },
              },
            })),
          }),
        }}
      />
    </section>
  );
};

export default TestimonialsSection;
