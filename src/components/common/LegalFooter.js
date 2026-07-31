import React from "react";
import { Link } from "react-router-dom";

const LegalFooter = ({ leftOffset = 0 }) => {
  return (
    <footer
      className="fixed bottom-0 right-0 z-30 border-t border-[#D8C28C] bg-[#F5EAD4] px-3 py-2 shadow-[0_-8px_24px_rgba(115,93,50,0.10)] transition-all duration-300 sm:px-4 sm:py-3"
      style={{ left: leftOffset }}
    >
      <nav
        className="mx-auto flex min-h-[28px] max-w-7xl flex-row flex-nowrap items-center justify-center gap-3 text-center text-[11px] leading-tight text-[#735D32] sm:min-h-[32px] sm:gap-6 sm:text-sm"
        aria-label="Legal"
      >
        <Link
          to="/privacy-policy"
          className="whitespace-nowrap font-semibold transition-colors hover:text-[#3F3320]"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-conditions"
          className="whitespace-nowrap font-semibold transition-colors hover:text-[#3F3320]"
        >
          Terms & Conditions
        </Link>
      </nav>
    </footer>
  );
};

export default LegalFooter;
