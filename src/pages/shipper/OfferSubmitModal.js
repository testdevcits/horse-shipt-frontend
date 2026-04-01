import React, { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import { FiX } from "react-icons/fi";

const OfferSubmitModal = ({ shipment, onClose }) => {
  const { addQuote } = useShipperQuote();

  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [sigPad, setSigPad] = useState(null);

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

      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-7xl max-h-[90vh] rounded-md flex flex-col overflow-hidden shadow-md">
          {/* HEADER */}
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-indigo-50">
            <button
              onClick={onClose}
              className="absolute right-3 sm:right-6 top-3 sm:top-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">
              Submit Shipping Offer
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Complete the form and provide your digital signature
            </p>
          </div>

          {/* DEFAULT FIELDS AT TOP - SMALL TEXT */}
          <div className="px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">
                  Payment Method
                </p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  💳 Card
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Payment Due</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  📦 On Delivery
                </p>
              </div>
            </div>
          </div>

          {/* SCROLLABLE FORM BODY */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 vehicle-scroll">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="flex flex-col gap-5">
                  {/* TOTAL PRICE */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm sm:text-base">
                      Total Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-600 text-lg">
                        $
                      </span>
                      <Field
                        name="totalPrice"
                        type="number"
                        placeholder="Enter total price"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base transition-colors"
                      />
                    </div>
                    {errors.totalPrice && touched.totalPrice && (
                      <ErrorMessage
                        name="totalPrice"
                        component="div"
                        className="text-red-500 text-xs sm:text-sm mt-1.5"
                      />
                    )}
                  </div>

                  {/* TIMING */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-800 text-sm sm:text-base">
                        Pickup Time *
                      </label>
                      <Field
                        name="pickupTime"
                        type="time"
                        className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base transition-colors"
                      />
                      {errors.pickupTime && touched.pickupTime && (
                        <ErrorMessage
                          name="pickupTime"
                          component="div"
                          className="text-red-500 text-xs sm:text-sm mt-1.5"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-800 text-sm sm:text-base">
                        Arrival Time *
                      </label>
                      <Field
                        name="arrivalTime"
                        type="time"
                        className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base transition-colors"
                      />
                      {errors.arrivalTime && touched.arrivalTime && (
                        <ErrorMessage
                          name="arrivalTime"
                          component="div"
                          className="text-red-500 text-xs sm:text-sm mt-1.5"
                        />
                      )}
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm sm:text-base">
                      Notes
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      rows={3}
                      placeholder="Add any special instructions..."
                      className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base resize-none transition-colors"
                    />
                  </div>

                  {/* CANCELLATION WINDOW */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm sm:text-base">
                      Cancellation Window (Days) *
                    </label>
                    <Field
                      name="cancellationWindowDays"
                      type="number"
                      min="0"
                      placeholder="e.g., 2"
                      className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base transition-colors"
                    />
                    {errors.cancellationWindowDays &&
                      touched.cancellationWindowDays && (
                        <ErrorMessage
                          name="cancellationWindowDays"
                          component="div"
                          className="text-red-500 text-xs sm:text-sm mt-1.5"
                        />
                      )}
                  </div>

                  {/* SIGNATURE */}
                  <div className="border-t-2 border-gray-200 pt-5">
                    <label className="block mb-3 font-semibold text-gray-800 text-sm sm:text-base">
                      Digital Signature *
                    </label>

                    <div
                      ref={sigWrapperRef}
                      className="w-full border-3 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 transition-colors"
                    >
                      {canvasWidth > 0 && (
                        <SignatureCanvas
                          ref={(ref) => setSigPad(ref)}
                          penColor="#2563eb"
                          backgroundColor="#ffffff"
                          canvasProps={{
                            width: canvasWidth,
                            height: 150,
                            className: "w-full cursor-crosshair",
                          }}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => sigPad && sigPad.clear()}
                      className="mt-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      ↺ Clear Signature
                    </button>
                  </div>

                  {/* HIDDEN FIELDS */}
                  <Field name="paymentMethod" type="hidden" value="card" />
                  <Field name="paymentDue" type="hidden" value="delivery" />
                </Form>
              )}
            </Formik>
          </div>

          {/* ACTIONS - STICKY FOOTER */}
          <div className="px-4 sm:px-6 py-4 border-t-2 border-gray-200 bg-white flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onClose}
              className="py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              fullWidth
              className="py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              onClick={() => {
                document
                  .querySelector("form")
                  ?.dispatchEvent(new Event("submit", { bubbles: true }));
              }}
            >
              Submit Offer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSubmitModal;
