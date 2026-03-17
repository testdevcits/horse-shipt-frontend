import React from "react";
import { useLegal } from "../contexts/common/LegalContext";

const TermsPage = () => {
  const { termsConditions, loading } = useLegal(); // updated to array

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading Terms & Conditions...</p>
      </div>
    );
  }

  // =========================
  // NO DATA
  // =========================
  if (!termsConditions || termsConditions.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-lg font-medium">
          No Terms & Conditions Found
        </p>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen px-4 py-10 bg-white font-montserrat animate-slide-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        {termsConditions.map((term, idx) => (
          <div
            key={term._id || idx}
            className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-md"
          >
            {/* OPTIONAL IMAGE (if your term has an image field) */}
            {term.image && (
              <div className="mb-4 text-center">
                <img
                  src={term.image}
                  alt={term.title}
                  className="mx-auto rounded-md max-h-64 object-contain"
                />
              </div>
            )}

            {/* TITLE */}
            <h2 className="text-2xl md:text-2xl font-bold mb-4 text-start">
              {term.title || `Term ${idx + 1}`}
            </h2>

            {/* CONTENT */}
            <div
              className="prose max-w-none prose-headings:font-semibold prose-p:leading-relaxed text-gray-700 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: term.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsPage;
