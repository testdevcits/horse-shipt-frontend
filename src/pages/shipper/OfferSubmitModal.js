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
    paymentMethod: "",
    paymentDue: "",
    pickupTime: "",
    arrivalTime: "",
    notes: "",
    cancellationWindowDays: "",
  };

  const validationSchema = Yup.object({
    totalPrice: Yup.number().required("Required"),
    paymentMethod: Yup.string().required("Required"),
    paymentDue: Yup.string().required("Required"),
    pickupTime: Yup.string().required("Required"),
    arrivalTime: Yup.string().required("Required"),
    cancellationWindowDays: Yup.number()
      .typeError("Must be a number")
      .required("Required")
      .min(0, "Must be 0 or more"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // VEHICLE VALIDATION REMOVED

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

      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
        <div className="bg-white w-full max-w-[95%] xl:max-w-[1400px] max-h-[90vh] rounded-[14px] flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="relative p-5 border-b">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500"
            >
              <FiX size={22} />
            </button>
            <h2 className="text-lg font-semibold">Submit an Offer</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill out your information and sign digitally to send the offer.
            </p>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4">
                  {/* TOTAL PRICE */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Total Price
                    </label>
                    <Field
                      name="totalPrice"
                      type="number"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage
                      name="totalPrice"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* PAYMENT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Payment Method
                      </label>
                      <Field
                        as="select"
                        name="paymentMethod"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="card">Card</option>
                      </Field>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Payment Due
                      </label>
                      <Field
                        as="select"
                        name="paymentDue"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="delivery">On Delivery</option>
                      </Field>
                    </div>
                  </div>

                  {/* TIME */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      name="pickupTime"
                      type="time"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <Field
                      name="arrivalTime"
                      type="time"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  {/* NOTES */}
                  <Field
                    as="textarea"
                    name="notes"
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

                  {/* CANCELLATION */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Cancellation Window (Days)
                    </label>

                    <Field
                      name="cancellationWindowDays"
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />

                    <ErrorMessage
                      name="cancellationWindowDays"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* SIGNATURE */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Your Signature
                    </label>

                    <div
                      ref={sigWrapperRef}
                      className="w-full border rounded-md overflow-hidden"
                    >
                      {canvasWidth > 0 && (
                        <SignatureCanvas
                          ref={(ref) => setSigPad(ref)}
                          penColor="#22c55e"
                          backgroundColor="#ffffff"
                          canvasProps={{
                            width: canvasWidth,
                            height: 150,
                            className: "w-full",
                          }}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => sigPad.clear()}
                      className="mt-2 text-sm text-system-primary hover:text-[#22c55e]"
                    >
                      Clear Signature
                    </button>
                  </div>

                  {/* ACTIONS */}
                  <div className="p-4 border-t flex gap-3">
                    <Button variant="secondary" fullWidth onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      Submit Offer
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSubmitModal;
