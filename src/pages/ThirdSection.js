import React, { useState } from "react";
import thirdSecBanner from "../assets/images/thirdSecBanner.jpg";
import thirdSecImg from "../assets/images/thirdSecImg.jpg"; // replace with your image path
import { FaPlay } from "react-icons/fa";
import { CgPlayPause } from "react-icons/cg";
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
          <div className="flex justify-center mt-6 px-4 md:px-[217px] w-full mb-16">
            <div
              className="relative w-full md:w-[846px] rounded-lg overflow-hidden bg-gray-200"
              style={{ paddingBottom: "56.8%" }}
            >
              {/* Image / Video */}
              <img
                src={thirdSecImg}
                alt="Center Section"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              />

              {/* Play Button */}
              <button className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-12 md:h-12 border-2 border-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition">
                  <FaPlay className="text-white text-2xl md:text-xl" />
                </div>
              </button>

              {/* Video Control Row */}
              <div className="absolute bottom-4 left-2 right-4 flex items-center gap-4">
                {/* Play/Pause Icon */}
                <CgPlayPause className="text-[#FFFFFF] text-3xl md:text-2xl flex-shrink-0" />

                {/* Progress Bar */}
                <div className="relative flex-1">
                  {/* Full Track / Background */}
                  <div
                    className="rounded-full"
                    style={{
                      height: "8px",
                      backgroundColor: "#FFFFFF",
                      opacity: 0.5,
                      borderRadius: "4px",
                    }}
                  ></div>

                  {/* Second segment */}
                  <div
                    className="rounded-full absolute"
                    style={{
                      width: "450px",
                      height: "8px",
                      backgroundColor: "gray",
                      opacity: 0.5, // Changed to 50% opacity
                      borderRadius: "4px",
                      top: "0px",
                      left: "0px",
                    }}
                  ></div>

                  {/* Third segment */}
                  <div
                    className="rounded-full absolute"
                    style={{
                      width: "200px",
                      height: "8px",
                      backgroundColor: "#FFFFFF",
                      opacity: 1,
                      borderRadius: "4px",
                      top: "0px",
                      left: "0px",
                    }}
                  ></div>
                </div>
              </div>
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

            {/* Checkbox Container */}
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
                  className="flex items-center gap-3 cursor-default"
                >
                  {/* Checkbox always selected */}
                  <div
                    className="flex items-center justify-center relative"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "14px",
                      border: "1px solid #BF9B53",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <img
                      src={checkIcon}
                      alt="Check"
                      className="absolute w-[14px] h-[12px]"
                      style={{
                        top: "8px",
                        left: "7px",
                      }}
                    />
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
              className="md:p-1 flex flex-col w-full md:w-[679px] h-auto"
              style={{
                gap: "32px",
                opacity: 1,
              }}
            >
              {/* Name & Email Row */}
              <div className="flex flex-col md:flex-row gap-2">
                {/* Name */}
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="name"
                    className="text-gray-700 font-montserrat mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="email"
                    className="text-gray-700 font-montserrat font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </div>

              {/* User Type Selection */}
              <div className="flex flex-col gap-2">
                <p className="text-gray-700 font-montserrat font-medium">
                  Select the user type that best fits you:
                </p>
                <div className="flex flex-col gap-4">
                  <label className="flex gap-4 flex-1">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border border-gray-400 rounded-full"
                    />
                    <span className="text-gray-800 font-montserrat text-base">
                      I have horses I need to get shipped
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border border-gray-400 rounded-sm"
                    />
                    <span className="text-gray-800 font-montserrat text-base">
                      I have empty space in my truck I want to fill with horses
                    </span>
                  </label>
                </div>
              </div>

              {/* Platform Experience Question */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="platformExperience"
                  className="text-gray-700 font-montserrat font-medium"
                >
                  Please share the names of those platforms and provide insights
                  into your experience — did you find them useful?
                </label>
                <input
                  type="text"
                  id="platformExperience"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  placeholder="Write your experience here..."
                />
              </div>

              {/* Submit Button */}
              <button className="bg-system-primary text-white px-5 py-3 rounded-full font-medium hover:bg-opacity-90 transition w-max mt-4">
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ThirdSection;
