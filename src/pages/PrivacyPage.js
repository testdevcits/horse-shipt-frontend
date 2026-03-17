import React from "react";
import { useLegal } from "../contexts/common/LegalContext";

const PrivacyPage = () => {
  const { privacyPolicies, loading } = useLegal(); // make sure this is the "data" array

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading Privacy Policies...</p>
      </div>
    );
  }

  // =========================
  // NO DATA
  // =========================
  if (!privacyPolicies || privacyPolicies.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-lg font-medium">
          No Privacy Policies Found
        </p>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-montserrat animate-slide-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        {privacyPolicies.map((policy, idx) => (
          <div
            key={policy._id || idx}
            className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-md"
          >
            {/* OPTIONAL IMAGE (if you have an image URL in the policy) */}
            {policy.image && (
              <div className="mb-4 text-center">
                <img
                  src={policy.image}
                  alt={policy.title}
                  className="mx-auto rounded-md max-h-64 object-contain"
                />
              </div>
            )}

            {/* TITLE */}
            <h2 className="text-2xl md:text-2xl font-bold mb-4 text-start">
              {policy.title || `Policy ${idx + 1}`}
            </h2>

            {/* CONTENT */}
            <div
              className="prose max-w-none prose-headings:font-semibold prose-p:leading-relaxed text-gray-700 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPage;
