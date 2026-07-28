import React from "react";
import { Link } from "react-router-dom";

const LegalFooter = ({ leftOffset = 0 }) => {
  return (
    <footer
      className="fixed bottom-0 right-0 z-30 border-t border-[#D8C28C] bg-[#F5EAD4] px-4 py-3 shadow-[0_-8px_24px_rgba(115,93,50,0.10)] transition-all duration-300"
      style={{ left: leftOffset }}
    >
      <nav
        className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-sm text-[#735D32] sm:flex-row sm:gap-6"
        aria-label="Legal"
      >
        <Link
          to="/privacy-policy"
          className="font-semibold transition-colors hover:text-[#3F3320]"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-conditions"
          className="font-semibold transition-colors hover:text-[#3F3320]"
        >
          Terms & Conditions
        </Link>
      </nav>
    </footer>
  );
};

export default LegalFooter;
