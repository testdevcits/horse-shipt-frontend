import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { FiEdit3 } from "react-icons/fi";
import { FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const Profile = () => {
  const { profile, updateProfile, loading } = useShipperProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);

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
    }
  }, [profile]);

  const validationSchema = Yup.object({
    mobile: Yup.string()
      .matches(/^\+91[6-9]\d{9}$/, "Invalid mobile number")
      .required("Mobile is required"),
    description: Yup.string().min(5, "Minimum 5 characters"),
  });

  if (!profile) return null;

  return (
    <div className="font-[Montserrat]">
      <div className="max-w-full mx-auto space-y-6">

        {/* PROFILE */}
        <div className="bg-white rounded-md shadow-md border border-[#BF9B53] p-4 sm:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h1 className="text-md sm:text-md font-semibold">My Profile</h1>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                icon={<FiEdit3 />}
                className="w-full sm:w-auto"
              >
                Edit
              </Button>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Description */}
              <div>
                <h2 className="text-gray-500 mb-2">Description</h2>
                <p className="text-[#BF9B53] break-words">
                  {profile.description || "No description"}
                </p>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-sm">Location</label>
                  <p className="text-[#BF9B53] break-words">
                    {profile?.locale?.address || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Email</label>
                  <p className="text-[#BF9B53] break-words">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Phone</label>
                  <p className="text-[#BF9B53] break-words">
                    {profile.mobile||"N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Account Type</label>
                  <p className="text-[#BF9B53] uppercase break-words">
                    {profile.role}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Formik
              initialValues={{
                mobile: profile.mobile?.startsWith("+91")
                  ? profile.mobile
                  : "+91" + (profile.mobile || ""),
                description: profile.description || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                const res = await updateProfile({
                  mobile: values.mobile,
                  description: values.description,
                  locale: selectedLocation,
                });

                if (res.success) setIsEditing(false);
              }}
            >
              {({ values, handleChange }) => (
                <Form className="space-y-4">

                  {/* LOCATION */}
                  <div>
                    <label className="text-sm text-gray-600">Location</label>

                    <Autocomplete
                      onLoad={(auto) => setAutocomplete(auto)}
                      options={{ fields: ["formatted_address", "geometry"] }}
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
                        placeholder="Search location"
                        className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                      />
                    </Autocomplete>

                    <div className="mt-3 rounded-lg overflow-hidden border">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "250px" }}
                        center={mapCenter}
                        zoom={12}
                      >
                        <Marker position={mapCenter} draggable />
                      </GoogleMap>
                    </div>
                  </div>

                  {/* FIELDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* MOBILE */}
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>

                      <div className="flex">
                        <span className="px-3 py-2 bg-gray-200 border border-r-0 rounded-l-lg text-sm font-semibold">
                          +91
                        </span>

                        <input
                          type="tel"
                          name="mobile"
                          value={values.mobile?.replace(/^\+91/, "") || ""}
                          onChange={handleChange}
                          className="w-full border rounded-r-lg px-3 py-2 text-sm"
                        />
                      </div>

                      <ErrorMessage
                        name="mobile"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <input
                        value={profile.email}
                        disabled
                        className="w-full border rounded-lg px-3 py-2  bg-gray-100 text-sm"
                      />
                    </div>

                    {/* ROLE */}
                    <div>
                      <label className="text-sm text-gray-600">Account Type</label>
                      <input
                        value={profile.role}
                        disabled
                        className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 text-sm"
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Description</label>
                      <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                      />
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      Save
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>

        {/* REVIEWS */}
        <div className="bg-white rounded-md shadow-md border border-[#BF9B53] p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-md">My Reviews</h2>

            <Button
              className="rounded-lg w-full  px-4 py-2 border w-full sm:w-auto flex justify-center items-center "
              onClick={() => setShowAllReviews(!showAllReviews)}
              icon={showAllReviews ? <FaChevronUp /> : <FaChevronDown />}
            >
              {showAllReviews}
            </Button>
          </div>

          {showAllReviews && (
            <div className="space-y-4">
              {[{ id: 1, reviewerName: "Alice", rating: 5, comment: "Great service!" }].map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <p>{review.comment}</p>

                  <div className="flex items-center mt-2 flex-wrap gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                    <span className="ml-2">{review.reviewerName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;