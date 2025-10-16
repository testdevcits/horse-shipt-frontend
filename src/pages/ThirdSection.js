import React, { useState } from "react";
import thirdSecBanner from "../assets/images/thirdSecBanner.jpg";
import thirdSecImg from "../assets/images/thirdSecImg.jpg"; // replace with your image path
import { FaPlay } from "react-icons/fa";
import checkIcon from "../assets/images/Icon.png";
const ThirdSection = () => {
  const [selected, setSelected] = useState(null);

  // Array for paragraphs
  const checklistItems = [
    "High-quality logistics services",
    "Reliable shipment tracking",
    "24/7 customer support",
  ];

  return (
    <>
      <section className="relative w-full">
        {/* Banner Background */}
        <div
          className="w-full"
          style={{
            backgroundImage: `url(${thirdSecBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "383px",
            position: "relative",
          }}
        >
          {/* Overlay with blur */}
          <div
            className="w-full h-full flex flex-col justify-center items-center text-center px-4 md:px-12"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(3px)",
              gap: "24px",
              padding: "1rem",
            }}
          >
            {/* Banner Heading */}
            <h2
              className="font-montserrat font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4"
              style={{
                lineHeight: "1.2",
                letterSpacing: "-1%",
              }}
            >
              Start your Journey
            </h2>

            {/* Banner Paragraph */}
            <p
              className="font-montserrat text-white mb-6 max-w-2xl text-center"
              style={{
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "28px",
                letterSpacing: "0%",
              }}
            >
              Whether you're a horse owner in search of seamless shipping
              solutions tailored to your equine companion's needs or a shipper
              seeking exciting opportunities, HorseShipt has you covered.
            </p>

            {/* Signup Button */}
            <button className="bg-system-primary text-white px-5 py-3 rounded-full font-medium hover:bg-opacity-90 transition w-max">
              Sign Up
            </button>
          </div>
        </div>

        {/* Text Section */}
        <div className="w-full flex flex-col items-center text-center mt-12 p-12 md:px-[217px] gap-5">
          <h6 className="font-montserrat font-semibold text-sm sm:text-base md:text-base uppercase text-system-primary">
            Features
          </h6>
          <h3
            className="font-montserrat font-semibold text-xl md:text-2xl lg:text-3xl text-gray-900"
            style={{
              lineHeight: "30px",
              letterSpacing: "0%",
            }}
          >
            How Horse Shipt Works
          </h3>
          <p
            className="font-montserrat text-base md:text-lg text-gray-600"
            style={{
              lineHeight: "28px",
              letterSpacing: "0%",
              maxWidth: "846px",
            }}
          >
            Curious about how HorseShipt works? Watch our quick video to
            discover the simplicity behind stress-free horse shipping.
          </p>
        </div>

        {/* Video/Image Section */}
        <div className="flex justify-center mt-6 px-4 md:px-[217px] w-full mb-16">
          <div className="relative w-full md:w-[846px] h-[480px] rounded-lg overflow-hidden bg-gray-200">
            {/* Image / Video Placeholder */}
            <img
              src={thirdSecImg}
              alt="Center Section"
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Play Button */}
            <button className="absolute inset-0 flex items-center justify-center text-white text-4xl md:text-5xl opacity-90 hover:opacity-100 transition">
              <FaPlay />
            </button>

            {/* Video Progress Bar */}
            <div className="absolute bottom-4 left-4 right-4 h-2 bg-gray-300 rounded-full">
              <div className="h-full bg-system-primary rounded-full w-1/3"></div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="w-full bg-[#F2EBDD] py-4 md:py-8 px-4 md:px-12 flex flex-col items-center"
        style={{
          minHeight: "776px",
          gap: "80px",
          padding: "1rem",
        }}
      >
        {/* Container for content */}
        <div className="max-w-[1440px] w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-20">
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center items-start text-left">
            <h2
              className="font-montserrat font-semibold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4"
              style={{
                lineHeight: "1.2",
                letterSpacing: "0%",
              }}
            >
              Sign Up
            </h2>
            <div
              className="w-full md:w-[521px] h-auto p-4 rounded-[16px] border flex flex-col gap-5"
              style={{
                opacity: 1,
                border: "1px solid #BF9B53", // System-Primary color
              }}
            >
              {checklistItems.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setSelected(index)}
                >
                  {/* Checkbox */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "14px",

                      backgroundColor: "white",
                      transition: "0.3s",
                    }}
                  >
                    {selected === index && (
                      <svg
                        width="14"
                        height="12"
                        viewBox="0 0 14 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: "absolute",
                          top: "8.3px",
                          left: "7.4px",
                        }}
                      >
                        <path
                          d="M1 6L5 10L13 2"
                          stroke="#BF9B53" // Check color
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <p
                    className="text-[#333333] font-montserrat"
                    style={{
                      fontWeight: 400,
                      fontStyle: "normal",
                      fontSize: "18px",
                      lineHeight: "28px",
                      letterSpacing: "0%",
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content / Example Image */}
          <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
            <div
              className="w-full md:w-[600px] h-[400px] bg-gray-200 rounded-lg"
              style={{
                minHeight: "400px",
              }}
            ></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ThirdSection;
