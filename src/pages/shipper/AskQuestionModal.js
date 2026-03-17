import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { useShipperQuestions } from "../../contexts/shipperContext/ShipperQuestionContext";
import Toast from "../../components/common/Toast";

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

    const res = await askQuestion(shipmentId, cleaned);

    if (res.success) {
      setToast({ message: res.message, type: "success" });
      setQuestion("");
      fetchQuestions(shipmentId); // refresh questions after submit
    } else {
      setToast({ message: res.message, type: "error" });
    }
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

      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[95%] max-w-md rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Shipment Question</h2>

          {loading && !existingQuestion && (
            <p className="text-sm text-gray-500">Loading question...</p>
          )}

          {existingQuestion ? (
            <>
              <div>
                <p className="text-sm font-medium text-[#735D32] mb-1">
                  Your Question
                </p>
                <p className="text-gray-800">{existingQuestion.question}</p>
              </div>

              {existingQuestion.status === "answered" ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Customer Answer
                  </p>
                  <p className="text-gray-800">{existingQuestion.answer}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Waiting for customer response…
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* ================= ASK NEW QUESTION ================= */}
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="w-full border border-gray-300 rounded-md p-3 text-sm"
                rows={4}
                maxLength={MAX_LENGTH + 10}
              />

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {cleaned.length}/{MAX_LENGTH}
                </span>
              </div>

              {/* warning if below MIN_LENGTH */}
              {cleaned.length > 0 && cleaned.length < MIN_LENGTH && (
                <p className="text-xs text-yellow-500">
                  Question must be at least {MIN_LENGTH} characters to submit.
                </p>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading} // disabled if < 10 chars
                >
                  {loading ? "Submitting..." : "Submit Question"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AskQuestionModal;
