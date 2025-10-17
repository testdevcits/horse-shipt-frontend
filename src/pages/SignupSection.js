import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import checkIcon from "../assets/images/Icon.png";
import CustomRadio from "../components/common/CustomCheckbox";

const SignupSection = () => {
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
      // Trim all string values before sending
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, val]) =>
          typeof val === "string" ? [key, val.trim()] : [key, val]
        )
      );

      console.log("✅ Form Submitted:", trimmedValues);
      alert("Form submitted successfully!");
      // Send trimmedValues to your API here
    },
  });

  return (
    <section className="w-full bg-header flex justify-center px-4 sm:px-6 md:px-10 py-10 md:py-16">
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center lg:items-start gap-10 md:gap-14">
        {/* LEFT CONTENT */}
        <div className="flex-1 w-full flex flex-col items-start text-left">
          <h2 className="font-montserrat font-semibold text-[26px] sm:text-[32px] md:text-[40px] lg:text-[48px] text-dark leading-tight mb-6">
            Sign Up
          </h2>

          <div className="w-full bg-white border border-system-primary rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col gap-5">
            {checklistItems.map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-7 h-7 border border-system-primary rounded-full bg-white">
                  <img
                    src={checkIcon}
                    alt="check"
                    className="w-[14px] h-[12px] absolute"
                  />
                </div>
                <p className="text-[#333333] font-montserrat text-[15px] sm:text-[17px] md:text-[18px] leading-[26px]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT (FORM) */}
        <div className="flex-1 w-full">
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
            {/* Name & Email */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="name"
                  className="text-dark font-montserrat mb-2 text-sm sm:text-base"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="border border-gray-300 rounded-md p-3 text-sm sm:text-base focus:outline-none focus:border-system-primary transition"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col flex-1">
                <label
                  htmlFor="email"
                  className="text-dark font-montserrat mb-2 text-sm sm:text-base"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="border border-gray-300 rounded-md p-3 text-sm sm:text-base focus:outline-none focus:border-system-primary transition"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* User Type */}
            <div className="flex flex-col gap-3">
              <p className="text-dark font-montserrat font-medium text-sm sm:text-base">
                Select the user type that best fits you:
              </p>

              <CustomRadio
                name="userType"
                label="I have horses I need to get shipped"
                value="shipper"
                selectedValue={formik.values.userType}
                onChange={formik.handleChange}
              />

              <CustomRadio
                name="userType"
                label="I have empty space in my truck I want to fill with horses"
                value="carrier"
                selectedValue={formik.values.userType}
                onChange={formik.handleChange}
              />
              {formik.touched.userType && formik.errors.userType && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.userType}
                </p>
              )}
            </div>

            {/* Competitor Question */}
            <div className="flex flex-col gap-3">
              <p className="text-dark font-montserrat font-medium text-sm sm:text-base">
                Have you previously utilized any competitor websites?
              </p>

              <CustomRadio
                name="competitorUsed"
                label="Yes"
                value="yes"
                selectedValue={formik.values.competitorUsed}
                onChange={formik.handleChange}
              />
              <CustomRadio
                name="competitorUsed"
                label="No"
                value="no"
                selectedValue={formik.values.competitorUsed}
                onChange={formik.handleChange}
              />

              {formik.touched.competitorUsed &&
                formik.errors.competitorUsed && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.competitorUsed}
                  </p>
                )}
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="experience"
                className="text-dark font-montserrat font-medium text-sm sm:text-base"
              >
                Please share the names of those platforms and your experience —
                did you find them useful?
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Your experience..."
                className="border border-gray-300 h-[112px] rounded-md p-3 text-sm sm:text-base focus:outline-none focus:border-system-primary transition resize-none"
              />
              {formik.touched.experience && formik.errors.experience && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.experience}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-system-primary w-full text-white px-5 py-3 sm:py-4 rounded-full font-montserrat font-medium text-sm sm:text-base hover:opacity-90 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
