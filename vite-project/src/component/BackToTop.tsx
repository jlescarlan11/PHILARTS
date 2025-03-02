// import { FC, useState, useEffect } from "react";

// const BackToTop: FC = () => {
//   const [isVisible, setIsVisible] = useState(false);

//   const toggleVisibility = () => {
//     setIsVisible(window.pageYOffset > 300);
//   };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   useEffect(() => {
//     window.addEventListener("scroll", toggleVisibility);
//     return () => window.removeEventListener("scroll", toggleVisibility);
//   }, []);

//   return (
//     <button
//       onClick={scrollToTop}
//       className={`
//         fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white
//         hover:bg-blue-700 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
//         ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
//       `}
//       aria-label="Back to top"
//     >
//       ↑
//     </button>
//   );
// };

// export default BackToTop;
