import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

// ── Responsive hook ────────────────────────────────────────────────────────────
const useIsWide = (breakpoint = 860) => {
  const [wide, setWide] = React.useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : false,
  );
  React.useEffect(() => {
    const handler = () => setWide(window.innerWidth >= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return wide;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SignupSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const isWide = useIsWide(860);

  const checklistItems = [
    "Access to all features",
    "30-day free trial",
    "Personalized onboarding",
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Page wrapper */}
      <section className="min-h-screen bg-header flex items-center justify-center   px-4 py-10 font-montserrat">
        <div
          className={`
   rounded-2xl shadow-[0_4px_40px_rgba(80,60,140,0.10)]
    w-full max-w-[1100px] overflow-hidden flex
    ${isWide ? "flex-row" : "flex-col"}
  `}
        >
          {/* ── LEFT PANEL ── */}
          <div
            className={`
      relative overflow-hidden flex flex-col justify-between
      bg-gradient-to-br from-system-primary via-tabActive to-[#7A6235]
      text-white p-10
      w-full
    `}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative z-10">
              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight leading-tight mb-1 font-montserrat">
                Sign Up
              </h1>
              <p className="text-sm text-white/75 mb-8 leading-relaxed">
                The smartest way to connect shippers &amp; carriers
              </p>

              {/* Checklist */}
              <div className="flex flex-col gap-5">
                {checklistItems.map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 min-w-[32px] rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                      <svg
                        width="13"
                        height="10"
                        viewBox="0 0 13 10"
                        fill="none"
                      >
                        <polyline
                          points="1.5,5 5,8.5 11.5,1.5"
                          stroke="white"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[15px] font-medium text-white/90 leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badge */}
            <div className="relative z-10 mt-10 bg-white/10 border border-white/20 rounded-custom p-4">
              <p className="text-[11px] uppercase tracking-widest text-white/60 mb-1">
                Trusted by
              </p>
              <p className="text-lg font-semibold">2,400+ users nationwide</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupSection;
