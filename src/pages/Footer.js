import React, { useState } from "react";
import { Link } from "react-router-dom";
import footerLogo from "../assets/images/footerLogo.png";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiArrowUp,
} from "react-icons/fi";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

/**
 * ============================================================
 * MODERN FOOTER COMPONENT
 * Professional design with multiple sections
 * ============================================================
 */

const Footer = () => {
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  /**
   * ================= HANDLE SCROLL TO TOP =================
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * ================= HANDLE NEWSLETTER SUBSCRIBE =================
   */
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail) {
      setSubscribeMessage("Please enter your email");
      return;
    }
    // TODO: Call API to subscribe
    setSubscribeMessage("Thanks for subscribing!");
    setSubscribeEmail("");
    setTimeout(() => setSubscribeMessage(""), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 font-montserrat">
      {/* ===================== SCROLL TO TOP BUTTON ===================== */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-[#BF9B53] hover:bg-[#9d7d42] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 hidden sm:flex items-center justify-center"
        title="Scroll to top"
      >
        <FiArrowUp size={24} />
      </button>

      {/* ===================== MAIN FOOTER CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ===================== TOP SECTION - LOGO & SUBSCRIBE ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-12 pb-12 border-b border-gray-700">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img
                src={footerLogo}
                alt="Horse Shipt Logo"
                className="h-12 sm:h-14 object-contain"
              />
              <h3 className="text-white font-black text-xl sm:text-2xl">
                Horse Shipt
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Safe, reliable horse transportation connecting shippers and
              drivers across the nation.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-2">
              <a
                href="#facebook"
                className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                title="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="#twitter"
                className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                title="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#instagram"
                className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                title="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#linkedin"
                className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                title="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="#youtube"
                className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                title="YouTube"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              Newsletter
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get updates on horse shipping news and tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#BF9B53] focus:outline-none transition-colors placeholder-gray-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-sm"
              >
                Subscribe
              </button>
              {subscribeMessage && (
                <p
                  className={`text-xs text-center ${
                    subscribeMessage.includes("Thanks")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {subscribeMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ===================== MIDDLE SECTION - CONTACT & LEGAL ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-12 pb-12 border-b border-gray-700">
          {/* Contact Info */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiPhone
                  className="text-[#BF9B53] flex-shrink-0 mt-1"
                  size={18}
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Phone
                  </p>
                  <a
                    href="tel:1234567890"
                    className="text-gray-300 hover:text-[#BF9B53] transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiMail
                  className="text-[#BF9B53] flex-shrink-0 mt-1"
                  size={18}
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Email
                  </p>
                  <a
                    href="mailto:support@horseship.com"
                    className="text-gray-300 hover:text-[#BF9B53] transition-colors break-all"
                  >
                    support@horseship.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin
                  className="text-[#BF9B53] flex-shrink-0 mt-1"
                  size={18}
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Address
                  </p>
                  <p className="text-gray-300">
                    123 Horse Shipt
                    <br />
                    Test, TX 78701
                    <br />
                    United States
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* For Shippers */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              For Shippers
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/shipper/signup"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Sign Up as Shipper
                </Link>
              </li>
              <li>
                <Link
                  to="/shipper/pricing"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/shipper/how-it-works"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/shipper/dashboard"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Drivers */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              For Drivers
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/driver/signup"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Sign Up as Driver
                </Link>
              </li>
              <li>
                <Link
                  to="/driver/login"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group font-semibold"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Driver Login
                </Link>
              </li>
              <li>
                <Link
                  to="/driver/earnings"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Earn Money
                </Link>
              </li>
              <li>
                <Link
                  to="/driver/support"
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ===================== LEGAL SECTION ===================== */}
        <div className="mb-8 pb-8 border-b border-gray-700">
          <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            Legal
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Cookie Policy
            </Link>
            <Link
              to="/disclaimer"
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Disclaimer
            </Link>
            <Link
              to="/accessibility"
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== BOTTOM BAR ===================== */}
      <div className="bg-black/50 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-center sm:text-left">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              <p>
                &copy; {currentYear}{" "}
                <span className="text-[#BF9B53] font-bold">Horse Shipt</span>.
                All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Connecting horse owners with trusted transporters nationwide.
              </p>
            </div>

            {/* Payment Methods & Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Secure</span>
                <span className="text-xs text-gray-500">Verified</span>
                <span className="text-xs text-gray-500">Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
