import React from "react";
import footerLogo from "../assets/images/footerLogo.png"; // replace with your logo path

const Footer = () => {
  return (
    <footer
      className="w-full bg-white py-2"
      style={{
        height: "135px",
      }}
    >
      {/* Outer Container */}
      <div className="w-full flex justify-center">
        {/* Inner Container */}
        <div className="w-full max-w-[1280px] border-t-2 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img
              src={footerLogo}
              alt="Logo"
              className="h-32 md:h-24 object-contain"
            />
          </div>

          {/* Right: Copyright */}
          <div className="text-gray-700  text-center md:text-right">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
