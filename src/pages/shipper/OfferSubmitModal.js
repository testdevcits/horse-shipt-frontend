import React, { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import { FiX } from "react-icons/fi";
import {
  DollarSign,
  FileText,
  PenTool,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

const OFFER_FORM_ID = "shipper-offer-submit-form";

const OfferSubmitModal = ({ shipment, onClose, onSuccess }) => {
  const { addQuote, loading } = useShipperQuote();
  const { needsOnboarding } = useShipperPayments();
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [sigPad, setSigPad] = useState(null);
  const [isSignatureDirty, setIsSignatureDirty] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [contractFile, setContractFile] = useState(null);

  const sigWrapperRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (sigWrapperRef.current) {
        setCanvasWidth(sigWrapperRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  const initialValues = {
    totalPrice: "",
    paymentMethod: "card",
    paymentDue: "delivery",
    notes: "",
    cancellationWindowDays: "",
  };

  const validationSchema = Yup.object({
    totalPrice: Yup.number().required("Required"),
    cancellationWindowDays: Yup.number()
      .typeError("Must be a number")
      .required("Required")
      .min(0, "Must be 0 or more"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (needsOnboarding) {
      showToast(
        "Please complete Stripe onboarding before submitting offer",
        "error"
      );
      setSubmitting(false);
      return;
    }
    if (!sigPad || sigPad.isEmpty()) {
      showToast("Please provide your digital signature", "error");
      setSubmitting(false);
      return;
    }

    const submitStart = Date.now();
    setIsSubmittingOffer(true);

    const payload = new FormData();
    payload.append("shipment", shipment._id);
    payload.append("totalPrice", Number(values.totalPrice));
    payload.append("paymentMethod", values.paymentMethod);
    payload.append("paymentDue", values.paymentDue);
    payload.append("notes", values.notes || "");
    payload.append("shipperSignature", sigPad.toDataURL("image/png"));
    payload.append(
      "cancellationWindowDays",
      values.cancellationWindowDays ? Number(values.cancellationWindowDays) : ""
    );

    if (contractFile) {
      payload.append("contractFile", contractFile);
    }

    const res = await addQuote(payload);
    const elapsed = Date.now() - submitStart;
    const remainingDelay = Math.max(0, 700 - elapsed);

    if (remainingDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingDelay));
    }

    if (res?.success) {
      resetForm();
      sigPad.clear();
      setContractFile(null);
      setIsSignatureDirty(false);
      setIsSubmittingOffer(false);
      onClose?.();
      onSuccess?.(res);
      setSubmitting(false);
      return;
    }

    setIsSubmittingOffer(false);
    setSubmitting(false);
  };

  return (
    <>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
          {isSubmittingOffer && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <LoaderCircle className="w-9 h-9 animate-spin text-[#BF9B53]" />
              <p className="text-sm font-semibold text-slate-700">
                Sending your offer...
              </p>
            </div>
          )}
          {/* ============ HEADER ============ */}
          <div className="relative px-4 sm:px-4 py-4 sm:py-4 border-b border-slate-200 bg-gradient-to-r from-gray-50  to-gray-50">
            <button
              onClick={onClose}
              disabled={isSubmittingOffer || loading}
              className="absolute right-4 sm:right-8 top-4 sm:top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-all duration-200"
            >
              <FiX size={20} />
            </button>
            <div className="pr-10 space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BF9B53] rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Submit Shipping Offer
                </h2>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Complete the form below and sign to confirm your offer
              </p>
            </div>
          </div>

          {/* ============ QUICK INFO BAR ============ */}
          <div className="px-4 sm:px-8 py-4 bg-gray-200 border-b border-[#BF9B53]">
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BF9B53] rounded-md">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                    Payment Method
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                    Credit Card
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BF9B53] rounded-sm">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                    Payment Due
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                    On Delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============ SCROLLABLE FORM BODY ============ */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-4 py-6 sm:py-4 vehicle-scroll">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form
                  id={OFFER_FORM_ID}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* ---- PRICING SECTION ---- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-[#BF9B53] rounded-sm">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Pricing
                      </h3>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-slate-900 text-sm sm:text-base">
                        Total Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-500 text-lg font-semibold">
                          $
                        </span>
                        <Field
                          name="totalPrice"
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-3 sm:py-3.5 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base transition-all duration-200 font-semibold"
                        />
                      </div>
                      {errors.totalPrice && touched.totalPrice && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <ErrorMessage name="totalPrice" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ---- CANCELLATION SECTION ---- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-[#BF9B53] rounded-sm">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Cancellation Policy
                      </h3>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-slate-900 text-sm sm:text-base">
                        Cancellation Window (Days){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="cancellationWindowDays"
                        type="number"
                        min="0"
                        placeholder="e.g., 2"
                        className="w-full px-4 py-3 sm:py-3.5 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base transition-all duration-200"
                      />
                      {errors.cancellationWindowDays &&
                        touched.cancellationWindowDays && (
                          <div className="flex items-center gap-2 mt-2 text-red-500 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <ErrorMessage name="cancellationWindowDays" />
                          </div>
                        )}
                      <p className="text-xs text-slate-500 mt-2 ml-1">
                        Number of days customer can cancel this shipment
                      </p>
                    </div>
                  </div>

                  {/* ---- NOTES SECTION ---- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-[#BF9B53] rounded-sm">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Additional Notes
                      </h3>
                    </div>
                    <Field
                      as="textarea"
                      name="notes"
                      rows={3}
                      placeholder="Add any special instructions or notes..."
                      className="w-full px-4 py-3 sm:py-3.5 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base resize-none transition-all duration-200"
                    />
                  </div>

                  {/* ---- CONTRACT UPLOAD SECTION ---- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-[#BF9B53] rounded-sm">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Shipper Contract
                      </h3>
                    </div>
                    <label className="block border-2 border-dashed border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors p-4">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) {
                            setContractFile(null);
                            return;
                          }

                          if (file.size > 10 * 1024 * 1024) {
                            showToast("Contract file must be under 10MB", "error");
                            event.target.value = "";
                            return;
                          }

                          setContractFile(file);
                        }}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {contractFile
                              ? contractFile.name
                              : "Attach shipper contract"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Optional PDF or image. Customers can review it before
                            accepting the quote.
                          </p>
                        </div>
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-[#BF9B53] text-[#BF9B53] text-xs font-bold">
                          Choose File
                        </span>
                      </div>
                    </label>
                    {contractFile && (
                      <button
                        type="button"
                        onClick={() => setContractFile(null)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove contract
                      </button>
                    )}
                  </div>

                  {/* ---- SIGNATURE SECTION ---- */}
                  <div className="border-t-2 border-slate-200 pt-6 sm:pt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-[#BF9B53] rounded-sm">
                        <PenTool className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Digital Signature
                      </h3>
                      <span className="text-red-500 font-bold">*</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mb-4 ml-1">
                      Sign below to confirm your shipping offer
                    </p>

                    <div
                      ref={sigWrapperRef}
                      className="w-full border-3 border-dashed border-slate-400 rounded-md overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 hover:border-blue-500 transition-all duration-300 shadow-inner"
                    >
                      {canvasWidth > 0 && (
                        <SignatureCanvas
                          ref={(ref) => {
                            setSigPad(ref);
                          }}
                          penColor="#000000"
                          backgroundColor="transparent"
                          canvasProps={{
                            width: canvasWidth,
                            height: 180,
                            className: "w-full cursor-crosshair block",
                          }}
                          onEnd={() => setIsSignatureDirty(true)}
                          velocityFilterWeight={0.7}
                          minWidth={1.5}
                          maxWidth={2.5}
                          throttle={16}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (sigPad) {
                            sigPad.clear();
                            setIsSignatureDirty(false);
                          }
                        }}
                        className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        ↺ Clear Signature
                      </button>
                      {isSignatureDirty && (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            Signature captured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HIDDEN FIELDS */}
                  <Field name="paymentMethod" type="hidden" value="card" />
                  <Field name="paymentDue" type="hidden" value="delivery" />
                </Form>
              )}
            </Formik>
          </div>

          {/* ============ STICKY FOOTER ============ */}
          <div className="px-4 sm:px-8 py-4 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex flex-col gap-4">
            {needsOnboarding && (
              <div className="w-full bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-700">
                  You need to complete account verification before submitting an
                  offer, as a verified account is required to receive payments.
                </p>
              </div>
            )}

            <div className="flex gap-3 sm:gap-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={isSubmittingOffer || loading}
                className="py-3 sm:py-3.5 font-semibold text-sm sm:text-base"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                form={OFFER_FORM_ID}
                fullWidth
                disabled={needsOnboarding || loading || isSubmittingOffer}
                className={`py-3 sm:py-3.5 font-semibold text-sm sm:text-base 
        ${
          needsOnboarding || loading || isSubmittingOffer
            ? "opacity-50 cursor-not-allowed"
            : ""
        }
      `}
                onClick={() => {
                  if (needsOnboarding) {
                    showToast(
                      "Please verify your Stripe account first to receive payments",
                      "error"
                    );
                  }
                }}
              >
                {loading || isSubmittingOffer ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Sending Offer...
                  </span>
                ) : (
                  "Submit Offer"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSubmitModal;
