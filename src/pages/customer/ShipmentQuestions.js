import React, { useEffect, useState } from "react";
import { useCustomerQuestions } from "../../contexts/customerContext/CustomerQuestionContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";
import {
  MdOutlineQuestionAnswer,
  MdCheckCircle,
  MdAccessTime,
} from "react-icons/md";
import { BiCheckDouble } from "react-icons/bi";
import { FiSend } from "react-icons/fi";

const ShipmentQuestions = ({ shipmentId }) => {
  const { questions, fetchQuestions, answerQuestion, loading } =
    useCustomerQuestions();

  const [answerInputs, setAnswerInputs] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (shipmentId) {
      fetchQuestions(shipmentId);
    }
  }, [shipmentId, fetchQuestions]);

  const handleAnswerChange = (id, value) => {
    setAnswerInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmitAnswer = async (questionId) => {
    const answer = answerInputs[questionId]?.trim();

    if (!answer || answer.length < 3) {
      Toast.warning("Answer must be at least 3 characters", 3000);
      return;
    }

    if (answer.length > 500) {
      Toast.warning("Answer too long (max 500 characters)", 3000);
      return;
    }

    setSubmittingId(questionId);

    try {
      const res = await answerQuestion(questionId, answer);

      if (res.success) {
        Toast.success("✓ Answer submitted successfully", 3000);

        // Clear the input
        setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));

        // Refresh questions
        await fetchQuestions(shipmentId);
      } else {
        Toast.error(res.message || "Failed to submit answer", 3000);
      }
    } catch (err) {
      console.error("Answer submission error:", err);
      Toast.error(err?.message || "Something went wrong", 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  // ⚡ Safely merge questions into an array
  const allQuestions = Array.isArray(questions)
    ? questions
    : [...(questions?.pending || []), ...(questions?.answered || [])];

  return (
    <div className="w-full space-y-4 sm:space-y-6 font-montserrat">
      {/* ═══════════════ HEADER ═══════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-[#BF9B53]/20 rounded-lg">
            <MdOutlineQuestionAnswer className="w-5 sm:w-6 h-5 sm:h-6 text-[#BF9B53]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Questions
          </h2>
        </div>

        {!loading && allQuestions.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3 py-1.5 bg-[#BF9B53] text-white rounded-full text-xs sm:text-sm font-semibold">
              {allQuestions.length}{" "}
              {allQuestions.length === 1 ? "Question" : "Questions"}
            </div>
            <span className="text-[#BF9B53] hidden sm:inline">-</span>
            <span className="text-xs sm:text-sm text-slate-600">
              {allQuestions.filter((q) => q.status === "answered").length}{" "}
              answered
            </span>
          </div>
        )}
      </div>

      {/* ═══════════════ LOADING STATE ════════════════════════════════════ */}
      {loading ? (
        <div className="py-12">
          <PageLoader text="Loading questions..." size={24} color="#BF9B53" />
        </div>
      ) : allQuestions.length === 0 ? (
        <div className="py-8">
          <NoData
            title="No Questions Yet"
            description="Shippers haven't asked any questions for this shipment yet."
            showGoBack={false}
            showReload={false}
          />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {allQuestions.map((q) => {
            const currentAnswer = answerInputs[q._id]?.trim() || "";
            const isAnswered = q.status === "answered";

            return (
              <div
                key={q._id}
                className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#BF9B53]"
              >
                {/* ──── QUESTION HEADER ──────────────────────────────────── */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-slate-200">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        From{" "}
                        {q.shipperId?.name ||
                          q.shipperId?.companyName ||
                          "Shipper"}
                      </p>
                      <div
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 whitespace-nowrap ${
                          isAnswered
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isAnswered ? (
                          <>
                            <MdCheckCircle size={14} />
                            Answered
                          </>
                        ) : (
                          <>
                            <MdAccessTime size={14} />
                            Pending
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* ──── ANSWER SECTION ───────────────────────────────────── */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                  {isAnswered ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2">
                        <BiCheckDouble className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold text-emerald-700">
                          Your Answer
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-[#BF9B53] rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Answered on{" "}
                        {new Date(q.answeredAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Answer Input */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                          Your Answer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={answerInputs[q._id] || ""}
                          onChange={(e) =>
                            handleAnswerChange(q._id, e.target.value)
                          }
                          placeholder="Type your answer here... (min 3 characters, max 500)"
                          className="w-full border-2 border-slate-300 rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                          rows={3}
                          maxLength={500}
                        />
                      </div>

                      {/* Character Count Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <div className="flex-1 mr-3">
                            <div className="h-1.5 bg-slate-300 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  currentAnswer && currentAnswer.length >= 3
                                    ? "bg-emerald-500"
                                    : currentAnswer
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                }`}
                                style={{
                                  width: `${
                                    currentAnswer
                                      ? Math.min(
                                          (currentAnswer.length / 500) * 100,
                                          100
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold whitespace-nowrap ml-2 ${
                              currentAnswer && currentAnswer.length >= 3
                                ? "text-emerald-600"
                                : "text-slate-600"
                            }`}
                          >
                            {currentAnswer?.length || 0}/500
                          </span>
                        </div>

                        {/* Help Text */}
                        {currentAnswer && currentAnswer.length < 3 && (
                          <p className="text-xs text-amber-600 font-medium px-1">
                            Answer must be at least 3 characters
                          </p>
                        )}

                        {currentAnswer && currentAnswer.length >= 3 && (
                          <p className="text-xs text-emerald-600 font-medium px-1">
                            ✓ Ready to submit
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleSubmitAnswer(q._id)}
                          disabled={
                            !currentAnswer ||
                            currentAnswer.length < 3 ||
                            submittingId === q._id
                          }
                          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-700 hover:bg-[#BF9B53] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm"
                        >
                          {submittingId === q._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <FiSend size={16} />
                              <span>Submit Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipmentQuestions;
