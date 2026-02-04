import React, { useState } from "react";
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

  // ONLY ID STATE (AS REQUESTED)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [sigPad, setSigPad] = useState(null);

  // DERIVED VEHICLE (FOR UI PREVIEW ONLY)
  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const initialValues = {
    totalPrice: "",
    paymentMethod: "",
    paymentDue: "",
    pickupTime: "",
    arrivalTime: "",
    notes: "",
  };

  const validationSchema = Yup.object({
    totalPrice: Yup.number().required("Required"),
    paymentMethod: Yup.string().required("Required"),
    paymentDue: Yup.string().required("Required"),
    pickupTime: Yup.string().required("Required"),
    arrivalTime: Yup.string().required("Required"),
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

    // ✅ PAYLOAD WITH VEHICLE ID
    const payload = {
      shipment: shipment._id,
      vehicle: selectedVehicleId, // ✅ SEND VEHICLE ID
      totalPrice: Number(values.totalPrice),
      paymentMethod: values.paymentMethod,
      paymentDue: values.paymentDue,
      pickupTime: values.pickupTime,
      estimatedArrivalTime: values.arrivalTime,
      transportType: selectedVehicle?.transportType || "",
      stallsRequired: Number(selectedVehicle?.numberOfStalls || 1),
      notes: values.notes || "",
      shipperSignature: sigPad.toDataURL("image/png"),
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
        <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[14px] flex flex-col overflow-hidden">
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

          <div className="flex-1 overflow-y-auto p-5 space-y-4 vehicle-scroll">
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
                      <p className="text-gray-500 text-sm">
                        Loading vehicles...
                      </p>
                    ) : (
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
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

                  {/* VEHICLE PREVIEW (NO UI CHANGE) */}
                  {selectedVehicle && (
                    <div className="p-3 border rounded-md bg-gray-50 space-y-1 text-sm">
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

                  {/* FORM FIELDS */}
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
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
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
                        <option value="pickup">On Pickup</option>
                        <option value="delivery">On Delivery</option>
                      </Field>
                    </div>
                  </div>

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

                  <Field
                    as="textarea"
                    name="notes"
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

                  {/* SIGNATURE */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Your Signature
                    </label>

                    <SignatureCanvas
                      ref={(ref) => setSigPad(ref)}
                      penColor="#22c55e"
                      backgroundColor="#000000"
                      canvasProps={{
                        width: 500,
                        height: 150,
                        className: "border rounded-md w-full",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => sigPad.clear()}
                      className="mt-2 text-sm text-system-primary hover:text-[#22c55e]"
                    >
                      Clear Signature
                    </button>
                  </div>

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
