import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiMapPin,
  FiRefreshCw,
  FiStar,
  FiX,
} from "react-icons/fi";
import { MdEmail, MdSend } from "react-icons/md";
import { useCustomerMatching } from "../../contexts/customerContext/CustomerMatchingContext";
import PageLoader from "../../components/common/PageLoader";

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const getProfileData = (profile) => profile?.data || profile;

// ─── Invite Modal ────────────────────────────────────────────────────────────
const InviteModal = ({
  profile,
  shipmentId,
  onClose,
  sendInvitation,
  inviteLoading,
}) => {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    try {
      await sendInvitation({ shipmentId, shipperId: profile._id, message });
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to send invitation. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <FiX size={18} />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 text-2xl mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Invitation Sent!
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Your invitation has been sent to{" "}
              <span className="font-semibold text-gray-700">
                {profile.name || "this shipper"}
              </span>
              . They will be notified shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 rounded-md bg-[#BF9B53] text-white text-sm font-semibold hover:bg-[#a8863e] transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src={profile.profileImage || "/default-avatar.png"}
                alt={profile.name || "Shipper"}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#BF9B53]">
                  Send Invitation
                </p>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {profile.name || "Shipper"}
                </h3>
                <p className="text-xs text-gray-500">
                  {profile.companyName || "Horse transport shipper"}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-5" />

            {/* Message */}
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Message{" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the shipper, e.g. route details, timing expectations, or any special requirements..."
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53] transition"
            />

            {error && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSend}
                disabled={inviteLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#BF9B53] text-white text-sm font-semibold hover:bg-[#a8863e] disabled:opacity-60 transition"
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
                ) : (
                  <>
                    <MdSend size={14} />
                    Send Invitation
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={inviteLoading}
                className="px-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FindShippers = ({ shipmentId: shipmentIdProp, shipment }) => {
  const navigate = useNavigate();
  const { shipmentId: shipmentIdParam, id: routeId } = useParams();
  const shipmentId = shipmentIdProp || shipmentIdParam || routeId;

  const {
    matchingShippers,
    loading: matchingLoading,
    inviteLoading,
    fetchMatchingShippers,
    sendInvitation,
  } = useCustomerMatching();

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null); // profile to invite

  useEffect(() => {
    if (!shipmentId) return;
    fetchMatchingShippers(shipmentId);
  }, [shipmentId, fetchMatchingShippers]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!matchingShippers.length) {
        setProfiles([]);
        return;
      }
      try {
        setProfilesLoading(true);
        const results = await Promise.allSettled(
          matchingShippers.map((shipperId) =>
            axios.get(`${API_BASE_URL}/customer/shipper-profile/${shipperId}`)
          )
        );
        const nextProfiles = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => getProfileData(r.value.data))
          .filter(Boolean);
        setProfiles(nextProfiles);
      } catch {
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, [matchingShippers]);

  const handleReload = async () => {
    if (!shipmentId) return;
    await fetchMatchingShippers(shipmentId);
  };

  if (!shipmentId) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        Shipment not found for shipper matching.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 font-montserrat">
        {/* Header */}
        <div className="bg-white border border-[#BF9B53] rounded-lg p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#BF9B53]">
                Find Shipper
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Matching shippers for this shipment
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                We are checking pickup and delivery coverage areas to find
                shippers that may fit this route. Click{" "}
                <span className="font-semibold text-gray-800">
                  Invite Shipper
                </span>{" "}
                to send them a direct invitation.
              </p>
            </div>
            <button
              onClick={handleReload}
              disabled={matchingLoading || profilesLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 shrink-0"
            >
              <FiRefreshCw size={15} />
              Refresh Matches
            </button>
          </div>

          {shipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Pickup
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {shipment.pickupLocation || "Not available"}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Delivery
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {shipment.deliveryLocation || "Not available"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {(matchingLoading || profilesLoading) && (
          <div className="py-8">
            <PageLoader
              text="Finding matching shippers..."
              fullScreen={false}
            />
          </div>
        )}

        {/* Empty */}
        {!matchingLoading && !profilesLoading && profiles.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#BF9B53]/10 text-[#BF9B53] flex items-center justify-center">
              <FiMapPin size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              No matching shippers found
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
              There are no preferred-area matches for this shipment yet. You can
              refresh later after more shippers add coverage areas.
            </p>
          </div>
        )}

        {/* Shipper cards */}
        {!matchingLoading && !profilesLoading && profiles.length > 0 && (
          <>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">
                {profiles.length}
              </span>{" "}
              shipper
              {profiles.length !== 1 ? "s" : ""} matched for this shipment
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-[#BF9B53]/40 transition"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={profile.profileImage || "/default-avatar.png"}
                      alt={profile.name || "Shipper"}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {profile.name || "Shipper"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {profile.companyName || "Horse transport shipper"}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-[#F2EBDD] border border-[#BF9B53] px-2.5 py-1 text-xs font-semibold text-[#8A6E2F] shrink-0">
                          <FiStar size={12} />
                          {profile.rating || 0}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <FiMapPin className="text-[#BF9B53] shrink-0" />
                          <span>{profile.region || "Region not added"}</span>
                        </p>
                        <p className="flex items-center gap-2 break-all">
                          <MdEmail className="text-[#BF9B53] shrink-0" />
                          <span>{profile.email || "Email not available"}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Completed
                          </p>
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            {profile.completedShipments || 0}
                          </p>
                        </div>
                        <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Reviews
                          </p>
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            {profile.totalReviews || 0}
                          </p>
                        </div>
                      </div>

                      {/* ── Action buttons ── */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() =>
                            navigate(`/customer/shipper-profile/${profile._id}`)
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#BF9B53] text-white text-sm font-semibold hover:bg-[#a8863e] transition"
                        >
                          View Profile
                          <FiArrowRight size={14} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/customer/reviews/${profile._id}`)
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          View Reviews
                        </button>

                        {/* ── NEW: Invite button ── */}
                        <button
                          onClick={() => setInviteTarget(profile)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition"
                        >
                          <MdSend size={14} />
                          Invite Shipper
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {inviteTarget && (
        <InviteModal
          profile={inviteTarget}
          shipmentId={shipmentId}
          onClose={() => setInviteTarget(null)}
          sendInvitation={sendInvitation}
          inviteLoading={inviteLoading}
        />
      )}
    </>
  );
};

export default FindShippers;
