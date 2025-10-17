import React, { useState, useEffect } from "react";
import heroSec1 from "../assets/images/heroSec1.png";
import heroSec2 from "../assets/images/heroSec2.png";
import handDrawnUnderline from "../assets/images/Hand-drawn underlines.svg";
import SecondSection from "./SecondSection";
import ThirdSection from "./ThirdSection";
import SignupSection from "./SignupSection";

const Home = () => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const leftTimeout = setTimeout(() => setShowLeft(true), 300);
    const rightTimeout = setTimeout(() => setShowRight(true), 800);

    return () => {
      clearTimeout(leftTimeout);
      clearTimeout(rightTimeout);
    };
  }, []);

  return (
    <>
      <section className="bg-header py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center px-4 md:px-12">
          {/* LEFT SIDE */}
          <div
            className={`flex-1 flex flex-col transition-all duration-700 ease-out ${
              showLeft
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-10"
            }`}
          >
            {/* Heading with relative to place underline */}
            <div className="relative">
              <h1
                className="text-gray-900 font-montserrat text-3xl sm:text-4xl md:text-5xl leading-[60px] relative inline-block"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-2%",
                }}
              >
                Hassle-Free Horse Shipping Starts Here
                {/* Underline positioned absolutely relative to heading */}
              </h1>
              <img
                src={handDrawnUnderline}
                alt="Underline"
                className="absolute bottom-[-24px] left-0 sm:left-48 w-[200px] sm:w-[282px] h-auto"
              />
            </div>

            {/* Paragraph */}
            <p className="mt-10 font-montserrat text-gray-500 font-medium ">
              Connecting Horse Owners and Shippers for Seamless Transactions
            </p>

            {/* Sign Up Button */}
            <button className="mt-4 bg-system-primary text-white px-5 py-3 rounded-full font-medium hover:bg-opacity-90 transition w-max">
              Sign Up
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div
            className={`flex-1 relative flex justify-center md:justify-end mt-6 md:mt-0 transition-all duration-700 ease-out ${
              showRight
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ minHeight: "400px" }}
          >
            {/* Hero Image 1: large (desktop only) */}
            <img
              src={heroSec1}
              alt="Hero 1"
              className="hidden md:block absolute  w-[80%] max-w-[576px] h-auto top-0 left-0"
            />

            {/* Hero Image 2: always visible */}
            <img
              src={heroSec2}
              alt="Hero 2"
              className="absolute w-[60%] max-w-[183px] h-auto top-[20%] md:top-[37.5px] left-1/2 md:left-[60%] transform -translate-x-1/2 md:translate-x-0"
            />
          </div>
        </div>
      </section>
      <SecondSection />
      <ThirdSection />
      <SignupSection />
    </>
  );
};

export default Home;
