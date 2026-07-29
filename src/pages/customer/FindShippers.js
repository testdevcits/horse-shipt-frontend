import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FiMapPin, FiRefreshCw, FiStar, FiCheck } from "react-icons/fi";
import { MdEmail, MdSend } from "react-icons/md";
import { useCustomerMatching } from "../../contexts/customerContext/CustomerMatchingContext";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";
import { API_BASE_URL } from "../../config/api";

const getProfileData = (profile) => profile?.data || profile;

// ─── Main Component ───────────────────────────────────────────────────────
const FindShippers = ({ shipmentId: shipmentIdProp, shipment }) => {
  const navigate = useNavigate();
  const { shipmentId: shipmentIdParam, id: routeId } = useParams();
  const shipmentId = shipmentIdProp || shipmentIdParam || routeId;
  const { token } = useAuth();

  // Use context methods
  const {
    matchingShippers,
    invitedShippers,
    loading: matchingLoading,
    inviteLoading,
    fetchMatchingShippers,
    sendInvitation,
  } = useCustomerMatching();

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  // Fetch matching shippers on mount
  useEffect(() => {
    if (!shipmentId) {
      Toast.error("Shipment ID is missing");
      return;
    }

    if (!token) {
      Toast.error("Authentication token is missing. Please login again.");
      return;
    }

    fetchMatchingShippers(shipmentId);
  }, [shipmentId, token, fetchMatchingShippers]);

  // Load shipper profiles
  useEffect(() => {
    const loadProfiles = async () => {
      if (!matchingShippers.length) {
        setProfiles([]);
        return;
      }

      try {
        setProfilesLoading(true);

        const results = await Promise.allSettled(
          matchingShippers.map((id) =>
            axios.get(`${API_BASE_URL}/customer/shipper-profile/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const nextProfiles = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => getProfileData(r.value.data))
          .filter(Boolean);

        setProfiles(nextProfiles);
      } catch (err) {
        Toast.error("Failed to load shipper profiles");
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, [matchingShippers, token]);

  // Handle quote request using context
  const handleSendInvitation = async (profile) => {
    const profileId = profile._id || profile.id;

    if (!shipmentId) {
      Toast.error("Shipment ID is missing");
      return;
    }

    if (!profileId) {
      Toast.error("Shipper ID is missing");
      return;
    }

    if (!token) {
      Toast.error("Authentication token is missing. Please login again.");
      return;
    }

    try {
      await sendInvitation({
        shipmentId,
        shipperId: profileId,
        message: "",
      });

      Toast.success(`Quote request sent to ${profile.name}!`);

      setTimeout(() => {
        fetchMatchingShippers(shipmentId);
      }, 1000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send quote request. Please try again.";
      Toast.error(errorMsg);
    }
  };

  const isInvited = (profileId) => {
    const id = profileId || "";
    return invitedShippers.includes(id?.toString());
  };

  if (!shipmentId) {
    return (
      <div className="bg-white border border-gray-200 rounded p-4 text-center text-gray-500">
        <p className="font-semibold">❌ Shipment not found</p>
        <p className="text-xs mt-2">Shipment ID is missing</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-300 rounded p-6 text-center">
        <p className="font-semibold text-red-900">❌ Authentication Required</p>
        <p className="text-sm text-red-700 mt-2">
          Please login again to continue
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-montserrat">
      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-system-primary">
              Find Shipper
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Matching shippers for this shipment
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              We are checking pickup and delivery coverage areas to find
              shippers that may fit this route. Click{" "}
              <span className="font-semibold text-gray-800">
                Request a Quote
              </span>{" "}
              to ask a shipper to review the shipment and send pricing.
            </p>
          </div>
          <button
            onClick={() => fetchMatchingShippers(shipmentId)}
            disabled={matchingLoading || profilesLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 shrink-0 transition"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {shipment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Pickup
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {shipment.pickupLocation || "Not available"}
              </p>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Delivery
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {shipment.deliveryLocation || "Not available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {(matchingLoading || profilesLoading) && (
        <div className="py-8">
          <PageLoader text="Finding matching shippers..." fullScreen={false} />
        </div>
      )}

      {/* ── Empty ── */}
      {!matchingLoading &&
        !profilesLoading &&
        profiles.length === 0 &&
        matchingShippers.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-system-primary/10 text-system-primary flex items-center justify-center">
              <FiMapPin size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              No matching shippers found
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">
              There are no preferred-area matches for this shipment yet.
            </p>
          </div>
        )}

      {/* ── Shipper cards ── */}
      {!matchingLoading && !profilesLoading && profiles.length > 0 && (
        <>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">
              {profiles.length}
            </span>{" "}
            shipper{profiles.length !== 1 ? "s" : ""} matched
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {profiles.map((profile) => {
              const profileId = profile._id || profile.id;
              const alreadyInvited = isInvited(profileId);

              return (
                <div
                  key={profileId}
                  className="bg-white border border-gray-200 rounded p-4 hover:border-gray-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <img
                      src={profile.profileImage || "/default-avatar.png"}
                      alt={profile.name || "Shipper"}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {profile.name || "Shipper"}
                          </h3>
                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {profile.companyName || "Horse transport shipper"}
                          </p>
                        </div>

                        {/* Rating Badge */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-800 shrink-0">
                          <FiStar size={12} />
                          {profile.rating || 0}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5 mt-2.5 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <FiMapPin
                            className="text-system-primary shrink-0"
                            size={14}
                          />
                          <span>{profile.region || "Region not added"}</span>
                        </p>
                        <p className="flex items-center gap-2 break-all">
                          <MdEmail
                            className="text-system-primary shrink-0"
                            size={14}
                          />
                          <span className="text-xs">
                            {profile.email || "Email not available"}
                          </span>
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2.5 mt-3">
                        <div className="rounded bg-gray-50 border border-gray-200 px-2.5 py-2">
                          <p className="text-xs text-gray-600 font-semibold">
                            COMPLETED
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            {profile.completedShipments || 0}
                          </p>
                        </div>
                        <div className="rounded bg-gray-50 border border-gray-200 px-2.5 py-2">
                          <p className="text-xs text-gray-600 font-semibold">
                            REVIEWS
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            {profile.totalReviews || 0}
                          </p>
                        </div>
                      </div>

                      {/* Quote request button */}
                      <button
                        onClick={() => handleSendInvitation(profile)}
                        disabled={
                          alreadyInvited ||
                          inviteLoading ||
                          !token ||
                          !shipmentId
                        }
                        className={`w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition ${
                          alreadyInvited
                            ? "bg-green-50 border border-green-200 text-green-700 cursor-default"
                            : "bg-system-primary text-white hover:opacity-90 disabled:opacity-60"
                        }`}
                      >
                        {inviteLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                            Sending...
                          </>
                        ) : alreadyInvited ? (
                          <>
                            <FiCheck size={16} />
                            Quote Requested
                          </>
                        ) : (
                          <>
                            <MdSend size={16} />
                            Request a Quote
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FindShippers;
