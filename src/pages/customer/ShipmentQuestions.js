import React, { useEffect, useState } from "react";
import { useCustomerQuestions } from "../../contexts/customerContext/CustomerQuestionContext";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";

const ShipmentQuestions = ({ shipmentId }) => {
  const { questions, fetchQuestions, answerQuestion, loading } =
    useCustomerQuestions();

  const [answerInputs, setAnswerInputs] = useState({});
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

    try {
      const res = await answerQuestion(questionId, answer);

      if (res.success) {
        setToast({ message: "Answer submitted successfully", type: "success" });

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
    }
  };

  // ⚡ Safely merge questions into an array
  const allQuestions = Array.isArray(questions)
    ? questions
    : [...(questions?.pending || []), ...(questions?.answered || [])];

  return (
    <div>
      {/* HEADER */}
      <h2 className="font-montserrat font-medium text-[18px] leading-[20px] text-[#333333] mb-4">
        Total questions: {allQuestions.length}
      </h2>

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {loading ? (
        <PageLoader text="Loading questions..." />
      ) : allQuestions.length === 0 ? (
        <NoData
          title="No Questions Yet"
          description="Shippers haven't asked any questions for this shipment yet."
          showGoBack={false}
          showReload={false}
        />
      ) : (
        <div className="space-y-4">
          {allQuestions.map((q, index) => {
            const currentAnswer = answerInputs[q._id]?.trim();

            return (
              <div
                key={q._id}
                className="p-4 space-y-3 bg-white rounded-md shadow-sm"
              >
                {/* SHIPPER NAME */}
                <p className="font-montserrat font-medium text-sm leading-5 text-[#735D32]">
                  {q.shipperId?.name ||
                    q.shipperId?.companyName ||
                    "Unknown Shipper"}
                </p>

                {/* QUESTION */}
                <p className="font-montserrat font-medium text-[16px] leading-[24px] text-[#333333]">
                  {q.question}
                </p>

                {/* ANSWERED STATE */}
                {q.status === "answered" ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-700 font-medium mb-1">
                      Your Answer
                    </p>
                    <p className="text-gray-800">{q.answer}</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={answerInputs[q._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(q._id, e.target.value)
                      }
                      placeholder="Answer question"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      rows={3}
                      maxLength={500}
                    />

                    <div className="flex justify-end mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitAnswer(q._id)}
                        disabled={loading || !currentAnswer}
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </>
                )}

                {index !== allQuestions.length - 1 && (
                  <div className="border-t border-gray-300 mt-4"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipmentQuestions;
