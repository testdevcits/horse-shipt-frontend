import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

// ── Responsive hook ────────────────────────────────────────────────────────────
const useIsWide = (breakpoint = 860) => {
  const [wide, setWide] = React.useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : false
  );
  React.useEffect(() => {
    const handler = () => setWide(window.innerWidth >= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return wide;
};

// ── Radio Card ─────────────────────────────────────────────────────────────────
const RadioCard = ({
  name,
  label,
  value,
  selectedValue,
  onChange,
  className = "",
}) => {
  const selected = selectedValue === value;
  return (
    <div
      onClick={() => onChange({ target: { name, value } })}
      className={`
        flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer
        transition-all duration-200 select-none font-montserrat
        ${
          selected
            ? "border-system-primary bg-yellow-50 shadow-[0_0_0_3px_rgba(191,155,83,0.15)]"
            : "border-gray-200 bg-light hover:border-yellow-300 hover:bg-yellow-50/50"
        }
        ${className}
      `}
    >
      {/* Radio dot */}
      <div
        className={`
          w-[18px] min-w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center
          transition-colors duration-200
          ${selected ? "border-system-primary" : "border-gray-300 bg-white"}
        `}
      >
        {selected && (
          <div className="w-[9px] h-[9px] rounded-full bg-system-primary" />
        )}
      </div>
      <span className="text-sm font-medium text-dark leading-snug">
        {label}
      </span>
    </div>
  );
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

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      userType: "",
      competitorUsed: "",
      experience: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      userType: Yup.string().required("Please select a user type"),
      competitorUsed: Yup.string().required("Please answer this question"),
      experience: Yup.string().required("Experience is required"),
    }),
    onSubmit: (values) => {
      const trimmed = Object.fromEntries(
        Object.entries(values).map(([k, v]) =>
          typeof v === "string" ? [k, v.trim()] : [k, v]
        )
      );
      console.log("Form Submitted:", trimmed);
      setSubmitted(true);
    },
  });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Page wrapper */}
      <section className="min-h-screen bg-header flex items-center justify-center px-4 py-10 font-montserrat">
        <div
          className={`
            bg-white rounded-2xl shadow-[0_4px_40px_rgba(80,60,140,0.10)]
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
              ${isWide ? "w-[340px] min-w-[340px]" : "w-full"}
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

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 p-8 md:p-10">
            {submitted ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-system-primary to-tabActive flex items-center justify-center">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <polyline
                      points="5,15 12,22 25,8"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-dark font-montserrat">
                  You're all set!
                </h2>
                <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed">
                  Thanks for signing up. Check your inbox for a welcome email
                  and next steps.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-[28px] font-bold text-dark font-montserrat mb-1 leading-tight">
                  Create your account
                </h2>
                <p className="text-sm text-gray-400 mb-7 font-montserrat">
                  Join thousands of shippers and carriers already on the
                  platform
                </p>

                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="flex flex-col gap-5">
                    {/* Name & Email row */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Name */}
                      <div className="flex flex-col flex-1 gap-1.5">
                        <label
                          htmlFor="name"
                          className="text-xs font-semibold text-systemText tracking-wide"
                        >
                          Full name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Jane Smith"
                          className={`
                            border rounded-xl px-4 py-3 text-sm text-dark bg-light
                            outline-none transition-all duration-200 w-full font-montserrat
                            focus:border-system-primary focus:shadow-[0_0_0_3px_rgba(191,155,83,0.15)]
                            ${
                              formik.touched.name && formik.errors.name
                                ? "border-danger"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        />
                        {formik.touched.name && formik.errors.name && (
                          <span className="text-danger text-[11px] mt-0.5">
                            {formik.errors.name}
                          </span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col flex-1 gap-1.5">
                        <label
                          htmlFor="email"
                          className="text-xs font-semibold text-systemText tracking-wide"
                        >
                          Email address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="jane@example.com"
                          className={`
                            border rounded-xl px-4 py-3 text-sm text-dark bg-light
                            outline-none transition-all duration-200 w-full font-montserrat
                            focus:border-system-primary focus:shadow-[0_0_0_3px_rgba(191,155,83,0.15)]
                            ${
                              formik.touched.email && formik.errors.email
                                ? "border-danger"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <span className="text-danger text-[11px] mt-0.5">
                            {formik.errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100" />

                    {/* User Type */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-systemText tracking-wide">
                        What best describes you?
                      </p>
                      <RadioCard
                        name="userType"
                        label="I have horses I need shipped"
                        value="shipper"
                        selectedValue={formik.values.userType}
                        onChange={formik.handleChange}
                      />
                      <RadioCard
                        name="userType"
                        label="I have empty truck space I want to fill with horses"
                        value="carrier"
                        selectedValue={formik.values.userType}
                        onChange={formik.handleChange}
                      />
                      {formik.touched.userType && formik.errors.userType && (
                        <span className="text-danger text-[11px]">
                          {formik.errors.userType}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100" />

                    {/* Competitor */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-systemText tracking-wide">
                        Have you used competitor platforms before?
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <RadioCard
                          name="competitorUsed"
                          label="Yes"
                          value="yes"
                          selectedValue={formik.values.competitorUsed}
                          onChange={formik.handleChange}
                          className="flex-1 min-w-[120px]"
                        />
                        <RadioCard
                          name="competitorUsed"
                          label="No"
                          value="no"
                          selectedValue={formik.values.competitorUsed}
                          onChange={formik.handleChange}
                          className="flex-1 min-w-[120px]"
                        />
                      </div>
                      {formik.touched.competitorUsed &&
                        formik.errors.competitorUsed && (
                          <span className="text-danger text-[11px]">
                            {formik.errors.competitorUsed}
                          </span>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="experience"
                        className="text-xs font-semibold text-systemText tracking-wide"
                      >
                        Share your experience with those platforms
                      </label>
                      <textarea
                        id="experience"
                        name="experience"
                        value={formik.values.experience}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Tell us what worked, what didn't..."
                        className={`
                          border rounded-xl px-4 py-3 text-sm text-dark bg-light
                          outline-none transition-all duration-200 resize-none h-[100px]
                          leading-relaxed font-montserrat
                          focus:border-system-primary focus:shadow-[0_0_0_3px_rgba(191,155,83,0.15)]
                          ${
                            formik.touched.experience &&
                            formik.errors.experience
                              ? "border-danger"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      />
                      {formik.touched.experience &&
                        formik.errors.experience && (
                          <span className="text-danger text-[11px]">
                            {formik.errors.experience}
                          </span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="
                        w-full py-3.5 rounded-full font-semibold text-base text-white
                        bg-system-primary hover:bg-tabActive
                        transition-colors duration-200 font-montserrat tracking-wide
                        active:scale-[0.99]
                      "
                    >
                      Create My Account →
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupSection;
