import React, { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import { FiX } from "react-icons/fi";

const OfferSubmitModal = ({
  shipment,
  onClose,
  vehicles: propVehicles = [],
}) => {
  const { addQuote } = useShipperQuote();

  // SAFE CONTEXT FALLBACK
  const vehicleContext = useVehicle() || {
    vehicles: propVehicles,
    loading: false,
  };
  const { vehicles, loading: vehiclesLoading } = vehicleContext;

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [sigPad, setSigPad] = useState(null);

  const sigWrapperRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);

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
      .required("Required")
      .min(0, "Must be 0 or more"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!selectedVehicleId) {
      showToast("Please select a vehicle", "error");
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
      vehicle: selectedVehicleId,
      totalPrice: Number(values.totalPrice),
      paymentMethod: values.paymentMethod,
      paymentDue: values.paymentDue,
      pickupTime: values.pickupTime,
      estimatedArrivalTime: values.arrivalTime,
      transportType: selectedVehicle?.transportType || "",
      stallsRequired: Number(selectedVehicle?.numberOfStalls || 1),
      notes: values.notes || "",
      shipperSignature: sigPad.toDataURL("image/png"),

      cancellationWindowDays: Number(values.cancellationWindowDays),
    };

    const res = await addQuote(payload);

    if (res?.success) {
      showToast("Quote submitted successfully", "success");
      resetForm();
      setSelectedVehicleId("");
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
                  {/* VEHICLE SELECTION */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Select Vehicle
                    </label>
                    {vehiclesLoading ? (
                      <p className="text-sm text-gray-500">
                        Loading vehicles...
                      </p>
                    ) : (
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                      >
                        <option value="">Select a Vehicle</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.transportType} - {v.vehicleNumber}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* VEHICLE PREVIEW */}
                  {selectedVehicle && (
                    <div className="p-3 border rounded-md bg-gray-50 text-sm">
                      <p>
                        <strong>Transport Type:</strong>{" "}
                        {selectedVehicle.transportType}
                      </p>
                      <p>
                        <strong>Number of Stalls:</strong>{" "}
                        {selectedVehicle.numberOfStalls}
                      </p>
                      <p>
                        <strong>Vehicle Number:</strong>{" "}
                        {selectedVehicle.vehicleNumber}
                      </p>
                    </div>
                  )}

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
                        {/* <option value="cash">Cash</option> */}
                        <option value="card">Card</option>
                        {/* <option value="bank">Bank Transfer</option> */}
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
                        {/* <option value="pickup">On Pickup</option> */}
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
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Cancellation Window (Days)
                    </label>

                    <Field
                      name="cancellationWindowDays"
                      type="number"
                      placeholder="e.g. 2"
                      min="0"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />

                    <ErrorMessage
                      name="cancellationWindowDays"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      Customers can cancel within this period after booking.
                      After that, cancellation will be disabled.
                    </p>
                  </div>
                  {/* RESPONSIVE SIGNATURE */}
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
