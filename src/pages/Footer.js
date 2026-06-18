// src/components/Footer.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import footerLogo from "../assets/images/footerLogo.png";
import { FiChevronRight, FiArrowUp } from "react-icons/fi";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNewsletter } from "../contexts/NewsletterContext"; // <-- NEW

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://horse-shipt.vercel.app/api";

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: FaFacebook },
  { key: "twitter", label: "X", icon: FaXTwitter },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { key: "youtube", label: "YouTube", icon: FaYoutube },
];

let socialSettingsCache = {
  data: null,
  timestamp: 0,
};
let socialSettingsPending = null;
const SOCIAL_CACHE_TTL = 5 * 60 * 1000;

const Footer = () => {
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [socialSettings, setSocialSettings] = useState({});

  // Newsletter context
  const { subscribe, loading } = useNewsletter();

  useEffect(() => {
    let mounted = true;

    const fetchSocialSettings = async () => {
      const now = Date.now();

      if (
        socialSettingsCache.data &&
        now - socialSettingsCache.timestamp < SOCIAL_CACHE_TTL
      ) {
        setSocialSettings(socialSettingsCache.data);
        return;
      }

      if (!socialSettingsPending) {
        socialSettingsPending = axios
          .get(`${API_BASE_URL}/settings/social-media`)
          .then((res) => res.data?.data || {})
          .finally(() => {
            socialSettingsPending = null;
          });
      }

      try {
        const data = await socialSettingsPending;
        socialSettingsCache = {
          data,
          timestamp: Date.now(),
        };
        if (mounted) setSocialSettings(data);
      } catch (_error) {
        if (mounted) setSocialSettings({});
      }
    };

    fetchSocialSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    const scrollPageTop = () => {
      const scroller = document.scrollingElement || document.documentElement;

      scroller.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };

    scrollPageTop();
    window.requestAnimationFrame(scrollPageTop);
    window.setTimeout(scrollPageTop, 120);
  };

  // Handle newsletter subscribe
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) {
      setSubscribeMessage("Please enter your email");
      return;
    }

    try {
      const message = await subscribe(subscribeEmail);
      setSubscribeMessage(message || "Thanks for subscribing!");
      setSubscribeEmail("");
    } catch (error) {
      setSubscribeMessage(error || "Something went wrong. Please try again.");
    }

    setTimeout(() => setSubscribeMessage(""), 4000);
  };

  const currentYear = new Date().getFullYear();
  const socialLinks = useMemo(
    () =>
      SOCIAL_PLATFORMS.map((platform) => ({
        ...platform,
        url: (socialSettings?.[platform.key] || "").trim(),
      })).filter((platform) => platform.url),
    [socialSettings]
  );

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 font-montserrat">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-[#BF9B53] hover:bg-[#9d7d42] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 hidden sm:flex items-center justify-center"
        title="Scroll to top"
      >
        <FiArrowUp size={24} />
      </button>

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-2">
                {socialLinks.map(({ key, label, icon: Icon, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#BF9B53] text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/driver/login"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Driver
                </Link>
              </li>
              <li>
                <Link
                  to="/happy-consumers"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-[#BF9B53] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <FiChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Happy Customers
                </Link>
              </li>
              {/* <li>
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
              </li> */}
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
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-60"
              >
                {loading ? "Subscribing..." : "Subscribe"}
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

        {/* Contact, Shipper, Driver Sections */}
        {/* You can keep your existing contact/shipping/driver links here... */}
        {/* Legal Section */}
        <div className="mb-8 pb-8 border-b border-gray-700">
          <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            Legal
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/privacy"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Cookie Policy
            </Link>
            <Link
              to="/disclaimer"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Disclaimer
            </Link>
            <Link
              to="/accessibility"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-[#BF9B53] transition-colors text-sm"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/50 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-center sm:text-left">
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
