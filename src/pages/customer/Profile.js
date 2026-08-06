import React, { useEffect, useState, useRef } from "react";
import { HiPencil, HiCheck, HiX } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/customerContext/ProfileContext";
import CustomerReviews from "./CustomerReviews";
import Toast from "../../components/common/Toast";
import defaultProfileImage from "../../assets/images/profileImage.png";
import { validateImageUpload } from "../../utils/uploadValidation";
import { useFormik } from "formik";
import * as Yup from "yup";

const countryCodes = [
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

const normalizePhoneDigits = (value = "") => String(value).replace(/\D/g, "");

const splitPhoneNumber = (phone = "") => {
  const matchedCountry = countryCodes.find((c) => phone.startsWith(c.code));

  if (!matchedCountry) {
    return {
      countryCode: "+1",
      nationalNumber: normalizePhoneDigits(phone),
    };
  }

  return {
    countryCode: matchedCountry.code,
    nationalNumber: normalizePhoneDigits(phone.slice(matchedCountry.code.length)),
  };
};

const CustomerProfile = () => {
  const { user } = useAuth();
  const {
    profile,
    profileImage,
    updateProfileImage,
    updateProfileDetails,
    loading,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [countryCode, setCountryCode] = useState("+1");
  const profileInputRef = useRef(null);

  useEffect(() => {
    if (profile?.phone) {
      setCountryCode(splitPhoneNumber(profile.phone).countryCode);
    }
  }, [profile?.phone]);

  // ===============================
  // Formik Setup
  // ===============================
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone ? splitPhoneNumber(profile.phone).nationalNumber : "",
    },

    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      phone: Yup.string()
        .test("valid-phone", "Enter valid phone number", (value) => {
          const digits = normalizePhoneDigits(value);
          return digits.length >= 7 && digits.length <= 15;
        })
        .required("Phone is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          phone: `${countryCode}${normalizePhoneDigits(values.phone)}`,
        };

        await updateProfileDetails(payload);

        Toast.success("Profile updated successfully!");
        setIsEditing(false);
      } catch (err) {
        Toast.error(err.message || "Failed to update profile details");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ===============================
  // Profile Image Upload
  // ===============================
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageUpload(file);
    if (validationError) {
      Toast.error(validationError);
      e.target.value = "";
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      await updateProfileImage(file);

      Toast.success("Profile image updated successfully!");

      setImagePreview(null);
    } catch (err) {
      Toast.error(
        err.response?.data?.message || "Failed to update profile image"
      );
      setImagePreview(null);
    } finally {
      e.target.value = "";
    }
  };

  const currentImage =
    imagePreview ||
    (typeof profileImage === "string"
      ? profileImage
      : profileImage?.url || user?.photo || defaultProfileImage);

  return (
    <div className="min-h-screen py-4 font-montserrat">
      <div className="space-y-4 animate-fade-in">
        {/* ===============================
            HERO SECTION - Profile Header
        =============================== */}
        <div className="relative">
          {/* Background Decorative Elements */}
          <div className="absolute -top-20 -right-20  bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] rounded-full blur-3xl opacity-10 pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20  bg-gradient-to-tr from-[#8B7043] to-[#BF9B53] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

          <div className="relative bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30 p-4 sm:p-6 shadow-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Profile Image Section */}
              <div className="relative flex-shrink-0">
                {/* Image Container */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden border-3 border-[#BF9B53] shadow-lg ring-2 ring-[#BF9B53]/20">
                  <img
                    src={currentImage}
                    alt="Profile"
                    className={`h-full object-cover transition-all duration-300 ${
                      loading ? "opacity-50 blur-sm" : "opacity-100"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = defaultProfileImage;
                    }}
                  />

                  {/* Loading Overlay */}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                      <div className="w-6 h-6 border-3 border-[#BF9B53]/30 border-t-[#BF9B53] rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  disabled={loading}
                  onClick={() => profileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-gradient-to-br from-[#BF9B53] to-[#9D7E3E] text-white p-2  shadow-lg hover:shadow-xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-3 border-white"
                  title="Change Profile Picture"
                >
                  <HiPencil size={14} />
                </button>

                <input
                  type="file"
                  ref={profileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileChange}
                />
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#BF9B53] leading-tight">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : user?.name || "User Profile"}
                </h1>
                <p className="text-xs sm:text-sm text-[#8B7043] font-semibold mt-1">
                  {profile?.email || user?.email || "No email"}
                </p>

                {/* Online Status */}
                <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-500 font-semibold">
                    Active
                  </span>
                </div>

                {/* Action Button */}
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BF9B53] to-[#D4AF85] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:-translate-y-1 transition-all mt-2 border border-[#8B7043]/20"
                  >
                    <HiPencil size={14} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 font-bold text-xs sm:text-sm rounded-lg hover:bg-gray-400 transition-all mt-2"
                  >
                    <HiX size={14} />
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===============================
            EDIT PROFILE SECTION
        =============================== */}
        {isEditing && (
          <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30  p-4 shadow-lg animate-slide-in">
            <h2 className="text-lg font-bold text-[#BF9B53] mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] flex items-center justify-center">
                <HiPencil className="text-white text-sm" />
              </div>
              Edit Information
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-[#8B7043] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`px-3 py-2 text-sm border-2 rounded-lg font-semibold transition-all focus:outline-none ${
                      formik.touched.firstName && formik.errors.firstName
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-[#BF9B53]/30 focus:border-[#BF9B53] focus:bg-[#BF9B53]/5"
                    }`}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-600 text-xs mt-1 font-semibold">
                      ⚠️ {formik.errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-[#8B7043] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`px-3 py-2 text-sm border-2 rounded-lg font-semibold transition-all focus:outline-none ${
                      formik.touched.lastName && formik.errors.lastName
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-[#BF9B53]/30 focus:border-[#BF9B53] focus:bg-[#BF9B53]/5"
                    }`}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-600 text-xs mt-1 font-semibold">
                      ⚠️ {formik.errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#8B7043] mb-1">
                  Phone Number
                </label>

                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2 bg-white border-2 border-[#BF9B53]/30 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#BF9B53] transition-all"
                  >
                    {countryCodes.map((c) => (
                      <option key={`${c.country}-${c.code}`} value={c.code}>
                        {c.flag} {c.country} ({c.code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    placeholder={countryCode === "+1" ? "555 123 4567" : "0000000000"}
                    value={formik.values.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9\s().-]*$/.test(value)) {
                        formik.setFieldValue("phone", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`px-3 py-2 text-sm border-2 rounded-lg font-semibold transition-all focus:outline-none w-full ${
                      formik.touched.phone && formik.errors.phone
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-[#BF9B53]/30 focus:border-[#BF9B53] focus:bg-[#BF9B53]/5"
                    }`}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">
                    ⚠️ {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#BF9B53] to-[#D4AF85] text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#8B7043]/20"
                >
                  <HiCheck size={16} />
                  {formik.isSubmitting ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    formik.resetForm();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-400 transition-all"
                >
                  <HiX size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===============================
            PROFILE DETAILS CARD
        =============================== */}
        {!isEditing && (
          <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30  p-4 shadow-lg">
            <h2 className="text-lg font-bold text-[#BF9B53] mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] flex items-center justify-center">
                <HiCheck className="text-white text-sm" />
              </div>
              Profile Details
            </h2>

            <div className="space-y-2">
              {/* Full Name */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#BF9B53]/10 to-[#D4AF85]/10  border border-[#BF9B53]/20 hover:border-[#BF9B53]/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-[#8B7043]">FULL NAME</p>
                  <p className="text-sm font-bold text-[#BF9B53] mt-1">
                    {profile?.firstName || profile?.lastName
                      ? `${profile?.firstName || ""} ${profile?.lastName || ""}`
                      : "Not set"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#BF9B53]/10 to-[#D4AF85]/10  border border-[#BF9B53]/20 hover:border-[#BF9B53]/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-[#8B7043]">EMAIL</p>
                  <p className="text-sm font-bold text-[#BF9B53] mt-1">
                    {profile?.email || user?.email || "Not set"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#BF9B53]/10 to-[#D4AF85]/10  border border-[#BF9B53]/20 hover:border-[#BF9B53]/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-[#8B7043]">PHONE</p>
                  <p className="text-sm font-bold text-[#BF9B53] mt-1">
                    {profile?.phone || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===============================
            STATS CARDS - Key Metrics
        =============================== */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="group bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BF9B53]/20 to-[#D4AF85]/20 rounded-lg flex items-center justify-center mb-2">
                <FaShoppingCart className="text-[#BF9B53] text-lg" />
              </div>
              <div className="text-3xl font-bold text-[#BF9B53]">10</div>
              <div className="text-xs text-[#8B7043] font-bold mt-1">
                Shipments
              </div>
              <div className="text-xs text-[#A88A47] mt-1 text-center">
                Completed
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BF9B53]/20 to-[#D4AF85]/20 rounded-lg flex items-center justify-center mb-2">
                <FaStar className="text-[#BF9B53] text-lg" />
              </div>
              <div className="flex items-center gap-1">
                <div className="text-3xl font-bold text-[#BF9B53]">5.0</div>
                <FaStar className="text-[#BF9B53] text-sm" />
              </div>
              <div className="text-xs text-[#8B7043] font-bold mt-1">
                Rating
              </div>
              <div className="text-xs text-[#A88A47] mt-1 text-center">
                10 reviews
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BF9B53]/20 to-[#D4AF85]/20 rounded-lg flex items-center justify-center mb-2">
                <FaTrophy className="text-[#BF9B53] text-lg" />
              </div>
              <div className="text-3xl font-bold text-[#BF9B53]">Gold</div>
              <div className="text-xs text-[#8B7043] font-bold mt-1">
                Member Tier
              </div>
              <div className="text-xs text-[#A88A47] mt-1 text-center">
                Premium
              </div>
            </div>
          </div>
        </div> */}

        {/* ===============================
            CUSTOMER REVIEWS SECTION
        =============================== */}
        <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border-2 border-[#BF9B53]/30  p-4 shadow-lg">
          <h2 className="text-lg font-bold text-[#BF9B53] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#BF9B53] to-[#D4AF85] flex items-center justify-center">
              <FaStar className="text-white text-sm" />
            </div>
            Customer Reviews
          </h2>
          <CustomerReviews />
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        input::placeholder {
          color: #8B7043;
          opacity: 0.6;
        }

        input:focus {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default CustomerProfile;
