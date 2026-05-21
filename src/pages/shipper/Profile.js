import React, { useState, useEffect } from "react";
import { FiArrowRight, FiEdit3, FiX, FiCheck } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const countryCodes = [
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
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

const Profile = () => {
  const { profile, updateProfile, loading } = useShipperProfile();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [countryCode, setCountryCode] = useState("+1");

  const [selectedLocation, setSelectedLocation] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });

  const [mapCenter, setMapCenter] = useState({
    lat: 22.9734,
    lng: 78.6569,
  });

  useEffect(() => {
    if (profile) {
      const lat = profile?.locale?.latitude || 22.9734;
      const lng = profile?.locale?.longitude || 78.6569;

      setMapCenter({ lat, lng });
      setSelectedLocation({
        address: profile?.locale?.address || "",
        latitude: lat,
        longitude: lng,
      });

      if (profile.mobile) {
        setCountryCode(splitPhoneNumber(profile.mobile).countryCode);
      }
    }
  }, [profile]);

  const validationSchema = Yup.object({
    mobile: Yup.string()
      .test("valid-phone", "Invalid phone number", (value) => {
        const digits = normalizePhoneDigits(value);
        return digits.length >= 7 && digits.length <= 15;
      })
      .required("Phone number is required"),
    description: Yup.string()
      .min(5, "Minimum 5 characters")
      .max(500, "Maximum 500 characters"),
  });

  const reviews = (profile?.reviews || []).map((review) => ({
    id: review._id || review.id,
    reviewerName: review.customerName || review.reviewerName || "Customer",
    rating: Number(review.rating || 0),
    comment: review.reviewText || review.comment || "",
    date: review.createdAt || review.date,
  }));

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (!profile) return null;

  return (
    <div
      className="w-full min-h-screen"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Main Container */}
      <div className="w-full">
        <div className="space-y-4">
          {/* ===== PROFILE CARD ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#BF9B53] to-[#D4AF77] px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    My Profile
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm font-medium mt-0.5">
                    {profile.role === "shipper"
                      ? "Shipper Account"
                      : "Transporter Account"}
                  </p>
                </div>

                {!isEditing && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#BF9B53] px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <FiEdit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center gap-2 bg-[#4C3E21] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#3a2f19] transition-all active:scale-95"
                    >
                      Update Location
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 lg:p-6">
              {!isEditing ? (
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Description
                    </label>
                    <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {profile.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Info Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Location */}
                    <div className="bg-gray-50 border border-[#BF9B53] p-3 rounded-sm">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#BF9B53]  uppercase mb-1">
                            Location
                          </p>
                          <p className="text-gray-800 text-sm break-words font-medium">
                            {profile?.locale?.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 border border-[#BF9B53] p-3 rounded-sm">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#BF9B53]  uppercase mb-1">
                            Email
                          </p>
                          <p className="text-gray-800 text-sm break-all font-medium">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-gray-50 border border-[#BF9B53] p-3 rounded-sm">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#BF9B53]  uppercase mb-1">
                            Phone
                          </p>
                          <p className="text-gray-800 text-sm break-all font-mono font-bold">
                            {profile.mobile || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="bg-gray-50 border border-[#BF9B53] p-3 rounded-sm">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#BF9B53]  uppercase mb-1">
                            Account
                          </p>
                          <p className="text-gray-800 text-sm font-semibold uppercase">
                            {profile.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Formik
                  initialValues={{
                    mobile: profile.mobile
                      ? splitPhoneNumber(profile.mobile).nationalNumber
                      : "",
                    description: profile.description || "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {
                    const fullMobile = countryCode + normalizePhoneDigits(values.mobile);
                    const res = await updateProfile({
                      mobile: fullMobile,
                      description: values.description,
                      locale: selectedLocation,
                    });

                    if (res.success) {
                      setIsEditing(false);
                    }
                  }}
                >
                  {({ values, handleChange, setFieldValue, errors, touched }) => (
                    <Form className="space-y-4">
                      {/* Location Editor */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                          Update Location
                        </label>

                        <Autocomplete
                          onLoad={(auto) => setAutocomplete(auto)}
                          options={{
                            fields: ["formatted_address", "geometry"],
                          }}
                          onPlaceChanged={() => {
                            if (!autocomplete) return;

                            const place = autocomplete.getPlace();
                            if (!place || !place.geometry) return;

                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();

                            setMapCenter({ lat, lng });
                            setSelectedLocation({
                              address: place.formatted_address || "",
                              latitude: lat,
                              longitude: lng,
                            });
                          }}
                        >
                          <input
                            value={selectedLocation.address}
                            onChange={(e) =>
                              setSelectedLocation((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            placeholder="Search location..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53] focus:ring-opacity-50 focus:border-transparent transition-all"
                          />
                        </Autocomplete>

                        <div className="mt-3 rounded-lg overflow-hidden border-2 border-gray-300">
                          <GoogleMap
                            mapContainerStyle={{
                              width: "100%",
                              height: "250px",
                            }}
                            center={mapCenter}
                            zoom={12}
                          >
                            <Marker position={mapCenter} draggable />
                          </GoogleMap>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        {/* Phone with Country Code */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                            Phone Number
                          </label>

                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#BF9B53] focus:ring-opacity-50 transition-all flex-shrink-0"
                            >
                              {countryCodes.map((c) => (
                                <option key={`${c.country}-${c.code}`} value={c.code}>
                                  {c.flag} {c.country} ({c.code})
                                </option>
                              ))}
                            </select>

                            <input
                              type="tel"
                              name="mobile"
                              value={values.mobile}
                              onChange={(e) => {
                                const nextValue = e.target.value;
                                if (/^[0-9\s().-]*$/.test(nextValue)) {
                                  setFieldValue("mobile", nextValue);
                                }
                              }}
                              placeholder={
                                countryCode === "+1"
                                  ? "555 123 4567"
                                  : countryCode === "+91"
                                  ? "10 digits"
                                  : "Phone"
                              }
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53] focus:ring-opacity-50 focus:border-transparent transition-all"
                            />
                          </div>

                          {errors.mobile && touched.mobile && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              {errors.mobile}
                            </p>
                          )}
                        </div>

                        {/* Email & Role Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                              Email
                            </label>
                            <input
                              value={profile.email}
                              disabled
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                              Account Type
                            </label>
                            <input
                              value={profile.role?.toUpperCase()}
                              disabled
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            placeholder="Add a description..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53] focus:ring-opacity-50 focus:border-transparent transition-all resize-none"
                          />
                          {errors.description && touched.description && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              {errors.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {values.description.length}/500
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-95 text-sm"
                        >
                          <FiX size={16} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BF9B53] to-[#D4AF77] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 active:scale-95 text-sm"
                        >
                          <FiCheck size={16} />
                          {loading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </div>

          {/* ===== REVIEWS SECTION ===== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Reviews Header */}
            <div className="bg-gradient-to-r from-[#BF9B53] to-[#D4AF77] px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    Reviews & Ratings
                  </h2>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 text-white/85 mt-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.round(averageRating) }).map(
                          (_, i) => (
                            <FaStar key={i} size={14} className="text-white" />
                          )
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {averageRating}
                      </span>
                      <span className="text-xs sm:text-sm">
                        ({reviews.length})
                      </span>
                    </div>
                  )}
                </div>
                {reviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/shipper/reviews")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#BF9B53] shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                    title="View all reviews"
                    aria-label="View all reviews"
                  >
                    <FiArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Reviews Content */}
            <div className="p-4 sm:p-5 lg:p-6">
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg hover:shadow-md transition-all hover:border-[#BF9B53]/30"
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            {review.reviewerName}
                          </h3>
                          {review.date && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(review.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <FaStar
                              key={i}
                              size={14}
                              className="text-yellow-400"
                            />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map(
                            (_, i) => (
                              <FaStar
                                key={i + review.rating}
                                size={14}
                                className="text-gray-300"
                              />
                            )
                          )}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaStar size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-700 text-sm sm:text-base font-semibold">
                    No reviews yet
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Complete your first shipment to receive reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
