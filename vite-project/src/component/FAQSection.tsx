import React, { useState, useEffect, ChangeEvent } from "react";
import { HashLink } from "react-router-hash-link";

/* -------------------------------------------------------
   Type Definitions
------------------------------------------------------- */
interface FAQItem {
  question: string;
  answer: string;
  category?: string; // Optional: for grouping FAQs
}

/* -------------------------------------------------------
   Sample FAQ Data
------------------------------------------------------- */
const faqData: FAQItem[] = [
  {
    question: "What is Nutcha Bite?",
    answer:
      "Nutcha Bite is a modern twist on a traditional Iloilo delicacy. Infused with premium matcha, it creates a unique blend of flavors that honors heritage while embracing innovation.",
    category: "Product",
  },
  {
    question: "What ingredients are used in Nutcha Bite?",
    answer:
      'We combine time-honored ingredients with a secret mix of spices and locally-sourced produce. For more details, please check our <a href="/support/ingredients" class="underline text-[var(--color-accent)]">Ingredients Guide</a>.',
    category: "Product",
  },
  {
    question: "How can I place an order?",
    answer:
      'To place an order, visit our Menu section, select your favorite items, and complete the checkout process using our secure payment system. See our <a href="/support/order-guide" class="underline text-[var(--color-accent)]">Order Guide</a> for step-by-step instructions.',
    category: "Ordering",
  },
  {
    question: "Do you cater to dietary restrictions?",
    answer:
      'Yes, we provide detailed ingredient lists and options for various dietary needs. Visit our <a href="/support/dietary-info" class="underline text-[var(--color-accent)]">Dietary Information</a> page or contact our support team.',
    category: "Support",
  },
];

/* -------------------------------------------------------
   Analytics Tracker Utility
   Logs detailed events; replace with your actual integration.
------------------------------------------------------- */
const trackEvent = (eventName: string, details: Record<string, any>) => {
  try {
    if (window.gtag) {
      window.gtag("event", eventName, details);
    } else {
      console.log(`Event: ${eventName}`, details);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error, eventName, details);
  }
};

/* -------------------------------------------------------
   Helper: highlightKeywords
   Wraps occurrences of a query string in the provided text with a highlight.
------------------------------------------------------- */
const highlightKeywords = (text: string, query: string): string => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<span class="bg-yellow-200">$1</span>');
};

/* -------------------------------------------------------
   Custom Hook: useReadMore
   Encapsulates the read-more state for long answers.
------------------------------------------------------- */
const useReadMore = (initial: boolean = false) => {
  const [readMore, setReadMore] = useState(initial);
  const toggle = () => setReadMore((prev) => !prev);
  return { readMore, toggle };
};

/* -------------------------------------------------------
   Subcomponent: FAQItemComponent
   Renders a single FAQ item with semantic markup (<dt> and <dd>),
   smooth slide/fade animations, a "Read More"/"Show Less" toggle,
   keyword highlighting, and feedback buttons.
------------------------------------------------------- */
interface FAQItemComponentProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
  searchQuery: string;
}
const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
  item,
  index,
  isOpen,
  onToggle,
  searchQuery,
}) => {
  const { readMore, toggle } = useReadMore();
  const isLong = item.answer.length > 150;
  const fullAnswer = highlightKeywords(item.answer, searchQuery);
  const shortAnswer = highlightKeywords(
    item.answer.slice(0, 150) + (isLong ? "..." : ""),
    searchQuery
  );

  // Feedback state for "Was this helpful?"
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  return (
    <div className="border-b border-gray-300">
      {/* FAQ Question */}
      <dt>
        <button
          onClick={() => onToggle(index)}
          role="button"
          className="w-full flex items-center justify-between py-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${index}`}
          aria-label={`${item.question} toggle`}
        >
          <span className="text-xl text-[var(--color-secondary)]">
            {item.question}
          </span>
          <span
            className={`transform transition-transform duration-300 ${
              isOpen
                ? "rotate-45 scale-110 text-[var(--color-accent)]"
                : "rotate-0"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </span>
        </button>
      </dt>
      {/* FAQ Answer */}
      <dd
        id={`faq-answer-${index}`}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p
          className="py-2 pl-4 text-lg"
          dangerouslySetInnerHTML={{
            __html: isLong && !readMore ? shortAnswer : fullAnswer,
          }}
        ></p>
        {isLong && !readMore && (
          <button
            onClick={() => {
              toggle();
              trackEvent("read_more_clicked", { questionIndex: index });
            }}
            className="ml-4 underline text-[var(--color-accent)] transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Read more"
          >
            Read More
          </button>
        )}
        {isLong && readMore && (
          <button
            onClick={() => {
              toggle();
              trackEvent("show_less_clicked", { questionIndex: index });
            }}
            className="ml-4 underline text-[var(--color-accent)] transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            aria-label="Show less"
          >
            Show Less
          </button>
        )}
        {/* Inline CTA for additional engagement */}
        {isLong && (
          <p className="mt-2 pl-4 text-sm">
            <a
              href="/support/ingredients"
              className="underline text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              aria-label="Learn more about our ingredients"
            >
              Learn more about our ingredients
            </a>
          </p>
        )}
        {/* "Was this helpful?" feedback buttons */}
        <div className="mt-2 pl-4 flex items-center space-x-4">
          {feedbackSubmitted ? (
            <span className="text-sm text-[var(--color-accent)]">
              Thank you for your feedback!
            </span>
          ) : (
            <>
              <button
                onClick={() => {
                  setFeedbackSubmitted(true);
                  trackEvent("faq_feedback", {
                    questionIndex: index,
                    feedback: "like",
                  });
                }}
                className="text-sm text-[var(--color-accent)] hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                aria-label="Mark as helpful"
              >
                👍
              </button>
              <button
                onClick={() => {
                  setFeedbackSubmitted(true);
                  trackEvent("faq_feedback", {
                    questionIndex: index,
                    feedback: "dislike",
                  });
                }}
                className="text-sm text-[var(--color-accent)] hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                aria-label="Mark as not helpful"
              >
                👎
              </button>
            </>
          )}
        </div>
      </dd>
    </div>
  );
};

/* -------------------------------------------------------
   FAQSearchBox Component
   Provides search functionality with a clear search button.
------------------------------------------------------- */
interface FAQSearchBoxProps {
  query: string;
  setQuery: (q: string) => void;
}
const FAQSearchBox: React.FC<FAQSearchBoxProps> = ({ query, setQuery }) => (
  <div className="mb-8 flex items-center">
    <input
      type="text"
      value={query}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
      placeholder="Search FAQs..."
      className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      aria-label="Search FAQs"
    />
    {query && (
      <button
        onClick={() => setQuery("")}
        className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        aria-label="Clear search"
      >
        Clear
      </button>
    )}
  </div>
);

/* -------------------------------------------------------
   Main Component: FAQSection
   Combines the FAQ search box, FAQ items, ARIA live announcements,
   and a secondary CTA.
------------------------------------------------------- */
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [query, setQuery] = useState("");

  // Filter FAQs based on the search query.
  const filteredFAQs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggle = (index: number) => {
    const newIndex = openIndex === index ? null : index;
    setOpenIndex(newIndex);
    // Announce the change with the specific question text.
    setAnnouncement(
      newIndex !== null
        ? `${faqData[index].question} opened`
        : `${faqData[index].question} closed`
    );
    trackEvent("faq_toggle", {
      questionIndex: index,
      isOpen: newIndex !== null,
    });
  };

  return (
    <section
      id="faq"
      className="bg-[var(--color-primary)] text-[var(--color-secondary)] py-16"
      role="region"
      aria-label="Frequently Asked Questions"
    >
      {/* ARIA live region for dynamic announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div className="container mx-auto px-4">
        {/* Introductory paragraph explaining the FAQ organization */}
        <p className="mb-4 text-center text-lg">
          Here you'll find answers to our most common questions. Use the search
          box to quickly locate topics, and click on a question to see the
          answer.
        </p>
        <h2 className="text-4xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        {/* Search/Filter Box */}
        <FAQSearchBox query={query} setQuery={setQuery} />
        <dl className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <FAQItemComponent
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={handleToggle}
              searchQuery={query}
            />
          ))}
          {filteredFAQs.length === 0 && (
            <p className="text-center text-lg">No FAQs match your search.</p>
          )}
        </dl>
        {/* Secondary CTA */}
        <div className="mt-12 text-center">
          <HashLink
            smooth
            to="#contact"
            className="inline-block px-8 py-3 bg-[var(--color-accent)] text-white rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]"
            aria-label="Still have questions? Contact us!"
          >
            Still have questions? Contact us!
          </HashLink>
        </div>
      </div>
      {/* JSON‑LD Structured Data for FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
            keywords:
              "Nutcha Bite, FAQ, Iloilo delicacy, matcha, ordering, ingredients, dietary, support",
          }),
        }}
      />
    </section>
  );
};

export default FAQSection;
