import React, { useEffect } from "react";
import { useLegal } from "../contexts/common/LegalContext";
import { FileText, Scale } from "lucide-react";
import PageLoader from "../components/common/PageLoader";
import PageBanner from "../components/common/PageBanner";

const TermsPage = () => {
  const { termsConditions, loading, refreshTermsConditions } = useLegal();

  useEffect(() => {
    refreshTermsConditions();
  }, [refreshTermsConditions]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <PageLoader
        text="Loading Terms & Conditions..."
        fullScreen={true}
        size={28}
        color="#BF9B53"
      />
    );
  }

  // =========================
  // NO DATA
  // =========================
  if (!termsConditions || termsConditions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-semibold">
            No Terms & Conditions Found
          </p>
          <p className="text-slate-600 text-sm">
            Please check back later for our terms.
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
        title="Terms & Conditions"
        description="Please read our terms and conditions carefully before using our services."
        Icon={Scale}
        bottomIcon={FileText}
      />

      {/* ─── Content Section ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BF9B53]">
              Legal Notice
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Terms & Conditions
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The terms that govern access to and use of Horseshipt services.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {termsConditions.map((term) => (
              <article key={term._id} className="px-5 py-7 sm:px-8 sm:py-9">
                {termsConditions.length > 1 && (
                  <h3 className="mb-5 text-xl font-semibold text-slate-900">
                    {term.title}
                  </h3>
                )}
                <div
                  className="legal-document-content"
                  dangerouslySetInnerHTML={{ __html: term.content }}
                />
              </article>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex gap-4">
            <Scale className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">
                Agreement & Legal Notice
              </h3>
              <p className="text-sm text-amber-800">
                By using our services, you acknowledge that you have read,
                understood, and agree to be bound by these Terms & Conditions.
                If you do not agree with any part of these terms, please do not
                use our services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
