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
  Clock,
  FileText,
  PenTool,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const OfferSubmitModal = ({ shipment, onClose }) => {
  const { addQuote } = useShipperQuote();
  const { needsOnboarding } = useShipperPayments();
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [sigPad, setSigPad] = useState(null);
  const [isSignatureDirty, setIsSignatureDirty] = useState(false);

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
    pickupTime: "",
    arrivalTime: "",
    notes: "",
    cancellationWindowDays: "",
  };

  const validationSchema = Yup.object({
    totalPrice: Yup.number().required("Required"),
    pickupTime: Yup.string().required("Required"),
    arrivalTime: Yup.string().required("Required"),
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

    const payload = {
      shipment: shipment._id,
      totalPrice: Number(values.totalPrice),
      paymentMethod: values.paymentMethod,
      paymentDue: values.paymentDue,
      pickupTime: values.pickupTime,
      estimatedArrivalTime: values.arrivalTime,
      notes: values.notes || "",
      shipperSignature: sigPad.toDataURL("image/png"),
      cancellationWindowDays: values.cancellationWindowDays
        ? Number(values.cancellationWindowDays)
        : null,
    };

    const res = await addQuote(payload);

    if (res?.success) {
      showToast("Quote submitted successfully", "success");
      resetForm();
      sigPad.clear();
      setIsSignatureDirty(false);
      onClose();
    }

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
        <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-md flex flex-col overflow-hidden shadow-2xl border border-slate-200">
          {/* ============ HEADER ============ */}
          <div className="relative px-4 sm:px-4 py-4 sm:py-4 border-b border-slate-200 bg-gradient-to-r from-gray-50  to-gray-50">
            <button
              onClick={onClose}
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

              {needsOnboarding && (
                <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-4">
                  <div>
                    <p className="text-xs sm:text-sm">
                      You need to complete account verification before
                      submitting an offer, as a verified account is required to
                      receive payments.
                    </p>
                  </div>
                </div>
              )}
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
              {({ isSubmitting, errors, touched, values }) => (
                <Form className="space-y-6 sm:space-y-8">
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

                  {/* ---- TIMING SECTION ---- */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-[#BF9B53] rounded-sm">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Timing
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                      <div>
                        <label className="block mb-2 font-semibold text-slate-900 text-sm sm:text-base">
                          Pickup Time <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="pickupTime"
                          type="time"
                          className="w-full px-4 py-3 sm:py-3.5 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base transition-all duration-200"
                        />
                        {errors.pickupTime && touched.pickupTime && (
                          <div className="flex items-center gap-2 mt-2 text-red-500 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <ErrorMessage name="pickupTime" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-slate-900 text-sm sm:text-base">
                          Arrival Time <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="arrivalTime"
                          type="time"
                          className="w-full px-4 py-3 sm:py-3.5 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base transition-all duration-200"
                        />
                        {errors.arrivalTime && touched.arrivalTime && (
                          <div className="flex items-center gap-2 mt-2 text-red-500 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <ErrorMessage name="arrivalTime" />
                          </div>
                        )}
                      </div>
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
          <div className="px-4 sm:px-8 py-4 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex gap-3 sm:gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              className="py-3 sm:py-3.5 font-semibold text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              fullWidth
              disabled={needsOnboarding}
              className={`py-3 sm:py-3.5 font-semibold text-sm sm:text-base 
                     ${needsOnboarding ? "opacity-50 cursor-not-allowed" : ""}
                      `}
              onClick={() => {
                if (needsOnboarding) {
                  showToast(
                    "Please verify your Stripe account first to receive payments",
                    "error"
                  );
                  return;
                }

                document
                  .querySelector("form")
                  ?.dispatchEvent(new Event("submit", { bubbles: true }));
              }}
            >
              {needsOnboarding ? "Verify Account to Continue" : "Submit Offer"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSubmitModal;
