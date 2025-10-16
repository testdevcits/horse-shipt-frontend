import React, { useState, useRef, useEffect } from "react";
import solutionImg1 from "../assets/images/solution1.png";
import solutionImg2 from "../assets/images/solution2.png";
import solutionsContent from "../data/solutionsContent";
import featuresImg1 from "../assets/images/featuresImg1.png";
const SecondSection = () => {
  const [activeTab, setActiveTab] = useState("solutions");
  const scrollRef = useRef(null);
  const thumbRef = useRef(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  const tabs = [
    { id: "solutions", label: "Solutions" },
    { id: "features", label: "Features" },
  ];

  // Update custom thumb height & position
  useEffect(() => {
    const content = scrollRef.current;
    if (!content) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = content;
      const thumbHeightCalc = (clientHeight / scrollHeight) * clientHeight;
      setThumbHeight(thumbHeightCalc);
      setThumbTop((scrollTop / scrollHeight) * clientHeight);
    };

    handleScroll();
    content.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      content.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollRef.current, solutionsContent]);

  return (
    <section className="py-12 md:py-16 bg-light px-4 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        {/* Active Tab Label */}
        <h6 className="font-montserrat font-semibold text-sm sm:text-base md:text-base mb-2 md:mb-4 uppercase text-system-primary">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h6>

        {/* Main Heading */}
        <h2
          className="font-montserrat text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8 leading-[1.2]"
          style={{
            fontWeight: 600,
            fontStyle: "SemiBold",
            letterSpacing: "-2%",
          }}
        >
          Tailored Transport Solutions
        </h2>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-300 mb-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-1/2 text-center cursor-pointer pb-3 transition-all duration-300 font-montserrat ${
                activeTab === tab.id
                  ? "border-b-2 border-system-primary font-semibold text-system-primary"
                  : "text-gray-500 font-medium"
              } text-sm sm:text-base md:text-base`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "solutions" && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-6 relative">
            {/* Left Images */}
            <div className="hidden md:flex w-full md:w-1/2 flex-row gap-[44px] justify-center md:justify-start">
              <div className="w-[228.75px] h-[466.25px]">
                <img
                  src={solutionImg1}
                  alt="Solution 1"
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <div className="w-[228.75px] h-[466.25px]">
                <img
                  src={solutionImg2}
                  alt="Solution 2"
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
            </div>

            {/* Divider / Scrollbar Track */}
            <div className="hidden md:flex flex-shrink-0 w-1 relative h-[466.25px] bg-gray-300">
              <div
                ref={thumbRef}
                className="absolute left-0 w-full bg-system-primary rounded transition-all duration-150"
                style={{ height: thumbHeight, top: thumbTop }}
              ></div>
            </div>

            {/* Right Side Scrollable Content */}
            <div
              ref={scrollRef}
              className="w-full md:w-1/2 max-h-[466.25px] overflow-y-scroll pl-2 hide-scrollbar"
            >
              {solutionsContent.map((item, index) => (
                <div key={index} className="mb-6">
                  <h3
                    className="font-montserrat mb-2"
                    style={{
                      fontWeight: 600,
                      fontStyle: "SemiBold",
                      fontSize: "20px",
                      lineHeight: "30px",
                      letterSpacing: "0%",
                      color: "#333333", // Optional: text color to contrast with dark background
                      padding: "4px 8px", // optional padding for better look
                      borderRadius: "4px", // optional rounding
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="font-montserrat mb-4"
                    style={{
                      fontWeight: 400,
                      fontStyle: "normal",
                      fontSize: "18px",
                      lineHeight: "28px",
                      letterSpacing: "0%",
                      color: "#667085",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-6 relative">
            {/* Left Images */}
            <div className="hidden md:flex w-full md:w-1/2 flex-row gap-[40px] justify-center md:justify-start">
              <div className="w-[550px] h-[462px]">
                <img
                  src={featuresImg1}
                  alt="Feature 1"
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
            </div>

            {/* Divider / Scrollbar Track */}
            <div className="hidden md:flex flex-shrink-0 w-1 relative h-[466.25px] bg-gray-300">
              <div
                ref={thumbRef}
                className="absolute left-0 w-full bg-system-primary rounded transition-all duration-150"
                style={{ height: thumbHeight, top: thumbTop }}
              ></div>
            </div>

            {/* Right Side Scrollable Content */}
            <div
              ref={scrollRef}
              className="w-full md:w-1/2 max-h-[466.25px] overflow-y-scroll pl-2 hide-scrollbar"
            >
              {solutionsContent.map((item, index) => (
                <div key={index} className="mb-6">
                  <h3
                    className="font-montserrat mb-2"
                    style={{
                      fontWeight: 600,
                      fontStyle: "SemiBold",
                      fontSize: "20px",
                      lineHeight: "30px",
                      letterSpacing: "0%",
                      color: "#333333", // Optional: text color to contrast with dark background
                      padding: "4px 8px", // optional padding for better look
                      borderRadius: "4px", // optional rounding
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="font-montserrat mb-4"
                    style={{
                      fontWeight: 400,
                      fontStyle: "normal",
                      fontSize: "18px",
                      lineHeight: "28px",
                      letterSpacing: "0%",
                      color: "#667085",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>
        {`
          /* Hide native scrollbar */
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}
      </style>
    </section>
  );
};

export default SecondSection;
