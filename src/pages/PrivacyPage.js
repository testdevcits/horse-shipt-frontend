import React, { useEffect } from "react";
import { useLegal } from "../contexts/common/LegalContext";
import { Lock, Shield } from "lucide-react";
import PageLoader from "../components/common/PageLoader";
import PageBanner from "../components/common/PageBanner";

const PrivacyPage = () => {
  const { privacyPolicies, loading, refreshPrivacyPolicies } = useLegal();

  useEffect(() => {
    refreshPrivacyPolicies();
  }, [refreshPrivacyPolicies]);

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
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BF9B53]">
              Legal Notice
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Privacy Policy
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Details about how Horseshipt collects, uses, protects, and shares
              personal information.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {privacyPolicies.map((policy) => (
              <article key={policy._id} className="px-5 py-7 sm:px-8 sm:py-9">
                {privacyPolicies.length > 1 && (
                  <h3 className="mb-5 text-xl font-semibold text-slate-900">
                    {policy.title}
                  </h3>
                )}
                <div
                  className="legal-document-content"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
              </article>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 border border-[#BF9B53] bg-[#BF9B53]/10 p-6 sm:p-8">
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
