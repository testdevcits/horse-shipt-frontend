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
  const [toast, setToast] = useState(null);
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
      setToast({ message: res.message, type: "success" });
      setQuestion("");
      fetchQuestions(shipmentId); // refresh questions after submit
    } else {
      setToast({ message: res.message, type: "error" });
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-xl rounded-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* ===================== HEADER ===================== */}
          <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 px-6 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#BF9B53] rounded-lg">
                <MdOutlineQuestionAnswer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {existingQuestion ? "Question Details" : "Ask a Question"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {existingQuestion
                    ? existingQuestion.status === "answered"
                      ? "Customer has responded"
                      : "Waiting for response"
                    : "Get clarity from the shipper"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              aria-label="Close modal"
            >
              <FiX size={20} className="text-slate-600" />
            </button>
          </div>

          {/* ===================== CONTENT ===================== */}
          <div className="p-4 space-y-4">
            {loading && !existingQuestion && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-[#BF9B53] animate-spin" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Loading questions...
                  </p>
                </div>
              </div>
            )}

            {!loading && existingQuestion ? (
              <>
                {/* ===================== EXISTING QUESTION VIEW ===================== */}
                <div className="space-y-4">
                  {/* Your Question */}
                  <div className="bg-slate-50 rounded-md border-2 border-slate-200 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MdOutlineQuestionAnswer className="w-4 h-4 text-[#BF9B53]" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Your Question
                      </p>
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {existingQuestion.question}
                    </p>
                  </div>

                  {/* Answer or Waiting Status */}
                  {existingQuestion.status === "answered" ? (
                    <div className="bg-emerald-50 rounded-md border-2 border-emerald-200 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <BiCheckDouble className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                          Customer Answer
                        </p>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {existingQuestion.answer}
                      </p>
                      <div className="pt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <FiCheckCircle size={14} />
                        Answered
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-md border-2 border-amber-200 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <MdAccessTime className="w-4 h-4 text-amber-600" />
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                          Status
                        </p>
                      </div>
                      <p className="text-amber-900 font-medium">
                        Waiting for customer response…
                      </p>
                      <div className="pt-2 flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <>
                  {/* ===================== ASK NEW QUESTION VIEW ===================== */}
                  <div className="space-y-2">
                    {/* Info Box */}
                    <div className="bg-[#BF9B53] border border-[#BF9B53] rounded-md p-2">
                      <p className="text-xs text-white font-medium">
                        Ask a specific question about this shipment. The shipper
                        will respond shortly.
                      </p>
                    </div>

                    {/* Textarea */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">
                        Your Question <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your question here... (minimum 10 characters)"
                        className="w-full border-2 border-[#BF9B53] rounded-md p-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#BF9B53] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                        rows={4}
                        maxLength={MAX_LENGTH + 10}
                      />
                    </div>

                    {/* Character Count */}
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              cleaned.length >= MIN_LENGTH
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${(cleaned.length / MAX_LENGTH) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          cleaned.length >= MIN_LENGTH
                            ? "text-emerald-600"
                            : cleaned.length > 0
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        {cleaned.length}/{MAX_LENGTH}
                      </span>
                    </div>

                    {/* Warning/Help Text */}
                    {cleaned.length > 0 && cleaned.length < MIN_LENGTH && (
                      <p className="text-xs text-amber-600 font-medium px-1 flex items-center gap-1">
                        Question must be at least {MIN_LENGTH} characters
                      </p>
                    )}

                    {cleaned.length >= MIN_LENGTH &&
                      cleaned.length <= MAX_LENGTH && (
                        <p className="text-xs text-[#BF9B53] font-medium px-1 flex items-center gap-1">
                          Ready to submit
                        </p>
                      )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting || loading}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-[#BF9B53] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiSend size={18} />
                          Submit Question
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
    </>
  );
};

export default AskQuestionModal;
