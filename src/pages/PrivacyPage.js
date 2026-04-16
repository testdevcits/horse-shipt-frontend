import React, { useState } from "react";
import { useLegal } from "../contexts/common/LegalContext";
import { ChevronDown, ChevronUp, Lock, Shield } from "lucide-react";
import PageLoader from "../components/common/PageLoader";
import PageBanner from "../components/common/PageBanner";

const PrivacyPage = () => {
  const { privacyPolicies, loading } = useLegal();
  const [expandedId, setExpandedId] = useState(null);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <PageLoader
        text="Loading Privacy Policies..."
        fullScreen={true}
        size={28}
        color="#BF9B53"
      />
    );
  }

  // =========================
  // NO DATA
  // =========================
  if (!privacyPolicies || privacyPolicies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-semibold">
            No Privacy Policies Found
          </p>
          <p className="text-slate-600 text-sm">
            Please check back later for our policies.
          </p>
        </div>
      </div>
    );
  }

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen font-montserrat animate-slide-fade-in bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ─── Banner Section ─────────────────────────────────────────────── */}
      <PageBanner
        title="Privacy Policies"
        description="Your privacy and data security are our top priorities."
        Icon={Lock}
        bottomIcon={Shield}
      />

      {/* ─── Content Section ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-3">
          {privacyPolicies.map((policy) => {
            const isExpanded = expandedId === policy._id;

            return (
              <div
                key={policy._id}
                className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpanded(policy._id)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors duration-200 group"
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-lg flex-shrink-0 transition-all duration-200 ${
                        isExpanded
                          ? "bg-[#BF9B53]/20 border border-[#BF9B53]/30"
                          : "bg-slate-100 border border-slate-200 group-hover:bg-slate-200"
                      }`}
                    >
                      <Lock
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isExpanded ? "text-[#BF9B53]" : "text-slate-600"
                        }`}
                      />
                    </div>

                    <div className="text-left min-w-0 flex-1">
                      <h3
                        className={`text-lg font-semibold transition-colors duration-200 line-clamp-2 ${
                          isExpanded
                            ? "text-[#BF9B53]"
                            : "text-slate-900 group-hover:text-[#BF9B53]"
                        }`}
                      >
                        {policy.title}
                      </h3>
                      {!isExpanded && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                          {policy.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 100)}
                          ...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Toggle Icon */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                      isExpanded
                        ? "bg-[#BF9B53]/20 border border-[#BF9B53]/30"
                        : "bg-slate-100 border border-slate-200 group-hover:bg-slate-200"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp
                        className={`w-5 h-5 text-[#BF9B53] transition-transform duration-200`}
                      />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-6 sm:py-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Optional Image */}
                    {policy.image && (
                      <div className="mb-6 -mx-6 -mt-6">
                        <img
                          src={policy.image}
                          alt={policy.title}
                          className="w-full h-48 object-cover rounded-b-lg"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-4">
                      <div
                        className="prose prose-sm sm:prose max-w-none
                          prose-headings:font-semibold prose-headings:text-slate-900
                          prose-p:text-slate-700 prose-p:leading-relaxed
                          prose-li:text-slate-700 prose-li:marker:text-[#BF9B53]
                          prose-strong:text-slate-900 prose-strong:font-semibold
                          prose-a:text-[#BF9B53] prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: policy.content }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 sm:p-8 bg-[#BF9B53]/10 rounded-md border border-[#BF9B53]">
          <div className="flex gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Your Privacy Matters
              </h3>
              <p className="text-sm text-gray-800">
                We are committed to protecting your personal information and
                respecting your privacy. If you have any questions about our
                privacy practices, please don't hesitate to contact us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
