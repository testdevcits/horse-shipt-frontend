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
  const [toast, setToast] = useState(null);

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
      setToast({
        message: "Answer must be at least 3 characters",
        type: "warning",
      });
      return;
    }

    if (answer.length > 500) {
      setToast({
        message: "Answer too long (max 500 characters)",
        type: "warning",
      });
      return;
    }

    setSubmittingId(questionId);

    try {
      const res = await answerQuestion(questionId, answer);

      if (res.success) {
        setToast({
          message: "✓ Answer submitted successfully",
          type: "success",
        });

        setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
        fetchQuestions(shipmentId);
      } else {
        setToast({
          message: res.message || "Failed to submit answer",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message: err?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  // ⚡ Safely merge questions into an array
  const allQuestions = Array.isArray(questions)
    ? questions
    : [...(questions?.pending || []), ...(questions?.answered || [])];

  return (
    <div className="space-y-6">
      {/* ===================== HEADER ===================== */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MdOutlineQuestionAnswer className="w-6 h-6 text-[#BF9B53]" />
          <h2 className="text-2xl font-bold text-slate-900">
            Shipment Questions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#BF9B53] text-white rounded-full text-sm font-semibold">
            {allQuestions.length}{" "}
            {allQuestions.length === 1 ? "Question" : "Questions"}
          </div>
          <span className="text-[#BF9B53]">-</span>
          {allQuestions.length > 0 && (
            <span className="text-sm text-slate-500">
              {allQuestions.filter((q) => q.status === "answered").length}{" "}
              answered
            </span>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ===================== LOADING STATE ===================== */}
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
        <div className="space-y-4">
          {allQuestions.map((q, index) => {
            const currentAnswer = answerInputs[q._id]?.trim();
            const isAnswered = q.status === "answered";

            return (
              <div
                key={q._id}
                className="bg-white rounded-md border-2 border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#BF9B53]"
              >
                {/* ---- QUESTION HEADER ---- */}
                <div className="bg-gray-100 px-6 py-5 border-b-2 border-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-semibold text-black uppercase tracking-wider">
                        Question from{" "}
                        {q.shipperId?.name ||
                          q.shipperId?.companyName ||
                          "Shipper"}
                      </p>
                      <p className="text-lg font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ${
                        isAnswered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-amber-700"
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
                </div>

                {/* ---- ANSWER SECTION ---- */}
                <div className="px-6 py-6">
                  {isAnswered ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BiCheckDouble className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-700">
                          Your Answer
                        </p>
                      </div>
                      <div className="bg-gray-50 border-2 border-[#BF9B53] rounded-md p-4">
                        <p className="text-slate-800 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Answered on{" "}
                        {new Date(q.answeredAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Your Answer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={answerInputs[q._id] || ""}
                          onChange={(e) =>
                            handleAnswerChange(q._id, e.target.value)
                          }
                          placeholder="Type your answer here... (min 3 characters, max 500)"
                          className="w-full border-2 border-slate-300 rounded-xl p-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                          rows={3}
                          maxLength={500}
                        />
                      </div>

                      {/* Character Count */}
                      <div className="flex justify-between items-center px-1">
                        <div className="flex-1 mr-3">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                currentAnswer && currentAnswer.length >= 3
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
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
                          className={`text-xs font-semibold whitespace-nowrap ${
                            currentAnswer && currentAnswer.length >= 3
                              ? "text-emerald-600"
                              : "text-slate-500"
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

                      {/* Submit Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleSubmitAnswer(q._id)}
                          disabled={
                            !currentAnswer ||
                            currentAnswer.length < 3 ||
                            submittingId === q._id
                          }
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 group"
                        >
                          {submittingId === q._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FiSend size={18} />
                              Submit Answer
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
