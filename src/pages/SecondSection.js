import React, { useState, useRef, useEffect } from "react";
import solutionImg1 from "../assets/images/solution1.png";
import solutionImg2 from "../assets/images/solution2.png";
import featuresImg1 from "../assets/images/featuresImg1.png";
import solutionsContent from "../data/solutionsContent";

const SecondSection = () => {
  const [activeTab, setActiveTab] = useState("solutions");

  const tabs = [
    { id: "solutions", label: "For Horse Owners" },
    { id: "features", label: "For Shippers" },
  ];

  // Refs must be called directly in component body
  const scrollRefSolutions = useRef(null);
  const scrollRefFeatures = useRef(null);
  const thumbRefSolutions = useRef(null);
  const thumbRefFeatures = useRef(null);

  const scrollRefs = {
    solutions: scrollRefSolutions,
    features: scrollRefFeatures,
  };

  const thumbRefs = {
    solutions: thumbRefSolutions,
    features: thumbRefFeatures,
  };

  const [thumbHeights, setThumbHeights] = useState({
    solutions: 0,
    features: 0,
  });

  const [thumbTops, setThumbTops] = useState({
    solutions: 0,
    features: 0,
  });

  // Handle scroll for active tab
  useEffect(() => {
    const scrollEl = scrollRefs[activeTab].current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const height = (clientHeight / scrollHeight) * clientHeight;
      const top = (scrollTop / scrollHeight) * clientHeight;
      setThumbHeights((prev) => ({ ...prev, [activeTab]: height }));
      setThumbTops((prev) => ({ ...prev, [activeTab]: top }));
    };

    scrollEl.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    handleScroll(); // Initial calculation

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const renderContent = (tabId) => {
    const isSolutions = tabId === "solutions";
    const images = isSolutions ? [solutionImg1, solutionImg2] : [featuresImg1];

    return (
      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* Left Images */}
        <div className="hidden md:flex w-full md:w-1/2 flex-row gap-6 justify-center md:justify-start">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={
                isSolutions
                  ? "w-[228.75px] h-[466.25px]"
                  : "w-[550px] h-[462px]"
              }
            >
              <img
                src={img}
                alt={`${tabId} ${idx}`}
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>

        {/* Divider / Scrollbar Track */}
        <div className="hidden md:flex flex-shrink-0 w-1 relative h-[466.25px] bg-gray-300">
          <div
            ref={thumbRefs[tabId]}
            className="absolute left-0 w-full bg-system-primary rounded transition-all duration-150"
            style={{ height: thumbHeights[tabId], top: thumbTops[tabId] }}
          ></div>
        </div>

        {/* Right Side Scrollable Content */}
        <div
          ref={scrollRefs[tabId]}
          className="w-full md:w-1/2 max-h-[466.25px] overflow-y-scroll pl-2 hide-scrollbar"
        >
          {solutionsContent.map((item, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-montserrat font-semibold text-lg text-dark mb-2 px-2 py-1 rounded">
                {item.title}
              </h3>
              <p className="font-montserrat paragraph text-[#667085] mb-4">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 md:py-16 bg-light px-4 md:px-12" id="solutions">
      <div className="max-w-[1280px] mx-auto">
        {/* Active Tab Label */}
        <h6 className="font-montserrat font-semibold text-sm sm:text-base mb-2 md:mb-4 uppercase text-system-primary">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h6>

        {/* Main Heading */}
        <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8 leading-[1.2] font-semibold tracking-tight">
          Tailored Transport Solutions
        </h2>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-300 mb-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-1/2 text-center cursor-pointer pb-3 transition-all duration-300 font-montserrat text-sm sm:text-base md:text-base ${
                activeTab === tab.id
                  ? "border-b-2 border-system-primary font-semibold text-system-primary"
                  : "text-gray-500 font-medium"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {renderContent(activeTab)}
      </div>
    </section>
  );
};

export default SecondSection;
