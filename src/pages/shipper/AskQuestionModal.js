import React, { useEffect, useState } from "react";
import { useShipperQuestions } from "../../contexts/shipperContext/ShipperQuestionContext";
import Toast from "../../components/common/Toast";
import { FiX, FiSend, FiCheckCircle, FiLoader } from "react-icons/fi";
import { MdOutlineQuestionAnswer, MdAccessTime } from "react-icons/md";
import { BiCheckDouble } from "react-icons/bi";

const MAX_LENGTH = 500;
const MIN_LENGTH = 10;

// sanitize user input to prevent XSS
const sanitizeInput = (text) =>
  text
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const AskQuestionModal = ({ shipmentId, onClose }) => {
  const {
    questions = { answered: [], pending: [] },
    fetchQuestions,
    askQuestion,
    loading,
  } = useShipperQuestions();

  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 fetch questions when modal opens
  useEffect(() => {
    if (shipmentId) {
      fetchQuestions(shipmentId);
    }
  }, [shipmentId, fetchQuestions]);

  // 🔹 merge answered and pending to pick the first question
  const existingQuestion =
    [...(questions.answered || []), ...(questions.pending || [])][0] || null;

  const cleaned = sanitizeInput(question);

  // button enabled only if question length >= MIN_LENGTH
  const canSubmit =
    cleaned.length >= MIN_LENGTH && cleaned.length <= MAX_LENGTH;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const res = await askQuestion(shipmentId, cleaned);

    if (res.success) {
      Toast.success(res.message, 3000);
      setQuestion("");
      fetchQuestions(shipmentId); // refresh questions after submit
    } else {
      Toast.error(res.message, 3000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white w-full max-w-2xl rounded-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#BF9B53] rounded-lg shadow-md">
              <MdOutlineQuestionAnswer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {existingQuestion ? "Question Details" : "Ask a Question"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {existingQuestion
                  ? existingQuestion.status === "answered"
                    ? "Customer has responded to your inquiry"
                    : "Waiting for shipper to respond"
                  : "Get clarity about this shipment"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-200 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* ===================== CONTENT ===================== */}
        <div className="p-6 space-y-6">
          {loading && !existingQuestion && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                  <FiLoader className="w-8 h-8 text-[#BF9B53] animate-spin" />
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Loading questions...
                </p>
              </div>
            </div>
          )}

          {!loading && existingQuestion ? (
            <>
              {/* ===================== EXISTING QUESTION VIEW ===================== */}
              <div className="space-y-5">
                {/* Your Question */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 p-5 space-y-3 hover:border-[#BF9B53]/50 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#BF9B53]/10 rounded-lg">
                      <MdOutlineQuestionAnswer className="w-5 h-5 text-[#BF9B53]" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your Question
                    </p>
                  </div>
                  <p className="text-slate-900 font-semibold leading-relaxed text-base">
                    "{existingQuestion.question}"
                  </p>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600">
                      Asked on{" "}
                      {new Date(
                        existingQuestion.createdAt
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(existingQuestion.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Answer or Waiting Status */}
                {existingQuestion.status === "answered" ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-300 p-5 space-y-3 hover:border-emerald-400 transition-colors duration-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <BiCheckDouble className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                          Customer Response
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        <FiCheckCircle size={14} />
                        Answered
                      </span>
                    </div>
                    <p className="text-slate-900 leading-relaxed text-base font-medium">
                      "{existingQuestion.answer}"
                    </p>
                    <div className="pt-3 border-t border-emerald-200">
                      <p className="text-xs text-emerald-700 font-semibold">
                        Answered on{" "}
                        {new Date(
                          existingQuestion.answeredAt
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          existingQuestion.answeredAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-300 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <MdAccessTime className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Status
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-amber-900 font-semibold text-base">
                        Waiting for shipper response...
                      </p>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 font-medium">
                        Typically responds within 24 hours
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            !loading && (
              <>
                {/* ===================== ASK NEW QUESTION VIEW ===================== */}
                <div className="space-y-4">
                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-[#BF9B53]/10 to-orange-100/10 border-l-4 border-[#BF9B53] rounded-lg p-2">
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                      Ask a specific question about this shipment. The shipper
                      will review and respond as soon as possible.
                    </p>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-900">
                      Your Question <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your question here... (minimum 10 characters)"
                        className="w-full border-2 border-slate-300 rounded-lg p-4 text-sm font-medium text-slate-900 placeholder-slate-500 focus:border-[#BF9B53] focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/20 transition-all duration-200 resize-none bg-white"
                        rows={5}
                        maxLength={MAX_LENGTH + 10}
                      />
                      <div className="absolute bottom-3 right-3 text-xs font-semibold text-slate-500">
                        {cleaned.length}/{MAX_LENGTH}
                      </div>
                    </div>
                  </div>

                  {/* Character Count Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            cleaned.length >= MIN_LENGTH
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                              : cleaned.length > 0
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-slate-300"
                          }`}
                          style={{
                            width: `${(cleaned.length / MAX_LENGTH) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Messages */}
                    {cleaned.length === 0 && (
                      <p className="text-xs text-slate-600 font-medium px-1">
                        Start typing your question...
                      </p>
                    )}

                    {cleaned.length > 0 && cleaned.length < MIN_LENGTH && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        <p className="text-xs text-amber-700 font-semibold">
                          Need at least {MIN_LENGTH - cleaned.length} more
                          character
                          {MIN_LENGTH - cleaned.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}

                    {cleaned.length >= MIN_LENGTH &&
                      cleaned.length <= MAX_LENGTH && (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <p className="text-xs text-emerald-700 font-semibold">
                            ✓ Ready to submit
                          </p>
                        </div>
                      )}

                    {cleaned.length > MAX_LENGTH && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <p className="text-xs text-red-700 font-semibold">
                          Question is too long
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tips Box */}
<<<<<<< HEAD
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Tips for better questions:
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
=======
                  <div className="bg-gradient-to-r from-[#BF9B53]/10 to-orange-100/10 border-l-4 border-[#BF9B53] rounded-lg p-2">
                    <ul className="text-xs text-gray-800 space-y-1">
>>>>>>> main
                      <li>• Be specific about what you need to know</li>
                      <li>• Include relevant shipment details if needed</li>
                      <li>• Ask one question at a time</li>
                    </ul>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting || loading}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm ${
                      !canSubmit || isSubmitting || loading
                        ? "bg-slate-300 cursor-not-allowed"
                        : "border text-gray-800 hover:bg-[#BF9B53]  text-gray-800 active:scale-95"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend size={20} />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AskQuestionModal;
