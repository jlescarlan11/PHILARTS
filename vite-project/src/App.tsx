import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./component/NavBar";
import HeroSection from "./component/HeroSection";
import ProductShowcase from "./component/ProductShowcase";
import AboutSection from "./component/AboutSection";
import TestimonialsSection from "./component/TestimonialsSection";
import FAQSection from "./component/FAQSection";
import Cart from "./component/Cart";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <section id="hero" className="-mt-[var(--nav-height)]">
                  <HeroSection />
                </section>
                <section id="about">
                  <AboutSection />
                </section>
                <section id="menu">
                  <ProductShowcase />
                </section>
                <section id="testimonials">
                  <TestimonialsSection />
                </section>
                <section id="faq">
                  <FAQSection />
                </section>
              </div>
            }
          />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
