import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./component/NavBar";
import HeroSection from "./component/HeroSection";
import ProductShowcase from "./component/ProductShowcase";
import AboutSection from "./component/AboutSection";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main className="">
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
              </div>
            }
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
