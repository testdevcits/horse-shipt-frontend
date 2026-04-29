import React from "react";
import thirdSecBanner from "../assets/images/thirdSecBanner.jpg";
import thirdSecImg from "../assets/images/thirdSecImg.jpg"; // replace with your image path
import { FaPlay } from "react-icons/fa";
import { CgPlayPause } from "react-icons/cg";
import { Link } from "react-router-dom";

const ThirdSection = () => {
  return (
    <>
      <section className="relative w-full " id="features">
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
            <Link to="/signup">
              <button className="mt-2 md:mt-2 font-montserrat bg-system-primary text-white px-5 py-3 rounded-full font-medium hover:bg-opacity-60 transition w-max ">
                Sign Up
              </button>
            </Link>
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
    </>
  );
};

export default ThirdSection;
