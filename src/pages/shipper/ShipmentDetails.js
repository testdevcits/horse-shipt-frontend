import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useVehicle } from "../../contexts/VehicleContext"; // Ensure this matches your provider
import Button from "../../components/common/Button";
import { ChatIcon } from "../../components/common/ColoredIcons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ShipmentDetails = ({ shipmentId: defaultId }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const { shipments, getAvailableShipments, loading } = useShipperShipment();
  const { addQuote } = useShipperQuote();

  // Safe destructuring from context
  const vehicleContext = useVehicle() || {};
  const vehicles = vehicleContext.vehicles || [];
  const vehiclesLoading = vehicleContext.loading || false;

  const [shipment, setShipment] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const idToUse = paramId || defaultId;

  // Fetch shipments if not loaded
  useEffect(() => {
    if (!shipments.length) getAvailableShipments();
  }, [shipments, getAvailableShipments]);

  // Find shipment by ID
  useEffect(() => {
    if (!idToUse || !shipments.length) return;
    const foundShipment = shipments.find((s) => s._id === idToUse);
    setShipment(foundShipment || null);
  }, [idToUse, shipments]);

  const initialValues = {
    totalPrice: "",
    paymentMethod: "",
    paymentDue: "",
    pickupTime: "",
    arrivalTime: "",
    transportType: "",
    stallsRequired: "",
    notes: "",
  };

  const validationSchema = Yup.object({
    totalPrice: Yup.number().required("Required"),
    paymentMethod: Yup.string().required("Required"),
    paymentDue: Yup.string().required("Required"),
    pickupTime: Yup.string().required("Required"),
    arrivalTime: Yup.string().required("Required"),
    transportType: Yup.string().required("Required"),
    stallsRequired: Yup.number().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!shipment) return;

    const payload = {
      shipment: shipment._id, // backend expects "shipment"
      totalPrice: Number(values.totalPrice),
      paymentMethod: values.paymentMethod,
      paymentDue: values.paymentDue,
      pickupTime: values.pickupTime,

      // IMPORTANT FIX
      estimatedArrivalTime: values.arrivalTime,

      transportType: values.transportType,
      stallsRequired: Number(values.stallsRequired),
      notes: values.notes || "",
    };

    console.log("ADD QUOTE PAYLOAD ", payload);

    const res = await addQuote(payload);

    if (res?.success) {
      resetForm();
      setIsOfferOpen(false);
      setSelectedVehicle(null);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-6 font-montserrat text-sm text-gray-600">
        Loading shipment...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 font-montserrat text-sm text-gray-600">
        Shipment not found
      </div>
    );
  }

  return (
    <div className="font-montserrat flex flex-col gap-6 relative text-sm leading-5 font-normal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <h1 className="text-[30px] leading-[38px] font-[Montserrat] font-semibold">
          Shipping Title – ID {shipment._id.slice(0, 8)}
        </h1>
        <div className="text-gray-600 md:text-right font-[Montserrat] font-medium text-[18px] leading-[28px]">
          <p>Listed on {new Date(shipment.createdAt).toLocaleDateString()}</p>
          <p>
            by{" "}
            <span className="text-black font-[Montserrat] font-medium text-[18px] leading-[28px]">
              {shipment.customer?.name || "Unknown User"}
            </span>
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-gray-300 rounded-[14px] min-h-[414px]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
          {/* Image */}
          <div className="order-1 md:order-2 w-full md:w-[60%]">
            <img
              src={shipment.horses[0]?.photo?.url}
              alt="shipment"
              className="w-full h-[220px] sm:h-[280px] md:h-[382px] object-cover rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="order-2 md:order-1 w-full md:w-[40%] flex flex-col gap-5 font-[Montserrat]">
            {/* Pickup Info */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-[18px] leading-[28px]">
                Pickup Info
              </h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-[18px] leading-[28px]">
                <SlLocationPin /> {shipment.pickupLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-[18px] leading-[28px]">
                <LuCalendarDays />{" "}
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </p>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-[18px] leading-[28px]">
                Delivery Info
              </h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-[18px] leading-[28px]">
                <SlLocationPin /> {shipment.deliveryLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-[18px] leading-[28px]">
                <LuCalendarDays />{" "}
                {new Date(shipment.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsOfferOpen(true)}
              >
                Submit an Offer
              </Button>

              <Button
                variant="secondary"
                fullWidth
                icon={<ChatIcon color="gray-500" />}
                onClick={() => navigate(`/shipper/chat`)}
              >
                Send Buyer a Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPMENT DETAILS */}
      <div className="border border-gray-300 rounded-[14px] p-4">
        <div
          onClick={() => setOpenDetails(!openDetails)}
          className="flex items-center justify-between h-[44px] p-[14px] bg-[#F2EBDD] rounded-[8px] cursor-pointer"
        >
          <h2 className="text-[16px] font-medium text-[#333333]">
            Shipment Details
          </h2>
          {openDetails ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {openDetails && (
          <div className="p-4 space-y-6">
            <div className="flex gap-6">
              <div className="w-1/4 text-gray-800 font-normal">
                GENERAL DETAILS
              </div>
              <div className="w-3/4 flex flex-col gap-1 text-gray-700">
                <span>Total Horses: {shipment.horses.length}</span>
                <span>Total Weight: 2000 pounds</span>
              </div>
            </div>

            <div className="border-t border-gray-300 my-4" />

            {shipment.horses.map((horse, index) => (
              <div key={horse._id} className="flex gap-6">
                <div className="w-1/4 font-normal text-gray-800">
                  HORSE {index + 1}
                </div>
                <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 font-normal">
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Registered Name:</p>
                    <p>{horse.registeredName}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Barn Name:</p>
                    <p>{horse.barnName}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Breed:</p>
                    <p>{horse.breed}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Colour:</p>
                    <p>{horse.colour}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Age:</p>
                    <p>{horse.age}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Sex:</p>
                    <p>{horse.sex}</p>
                  </div>
                  <div className="sm:col-span-2 gap-2">
                    <p className="text-gray-500 text-sm">General Info:</p>
                    <p>{horse.generalInfo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUBMIT OFFER MODAL */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[14px] flex flex-col overflow-hidden">
            <div className="relative p-5 border-b">
              <button
                onClick={() => setIsOfferOpen(false)}
                className="absolute right-4 top-4 text-gray-500"
              >
                <FiX size={22} />
              </button>
              <h2 className="text-lg font-semibold">Submit an Offer</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill out your information to send this buyer an offer.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Formik
                initialValues={{
                  ...initialValues,
                  transportType: selectedVehicle?.transportType || "",
                  stallsRequired: selectedVehicle?.numberOfStalls || "",
                }}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, setFieldValue }) => (
                  <Form className="flex flex-col gap-4">
                    {/* Vehicle Selection */}
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
                          onChange={(e) => {
                            const vehicle = vehicles.find(
                              (v) => v._id === e.target.value
                            );
                            setSelectedVehicle(vehicle || null);
                            setFieldValue(
                              "transportType",
                              vehicle?.transportType || ""
                            );
                            setFieldValue(
                              "stallsRequired",
                              vehicle?.numberOfStalls || ""
                            );
                          }}
                          value={selectedVehicle?._id || ""}
                        >
                          <option value="">Select a Vehicle</option>
                          {vehicles.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.transportType} - {v.vehicleType}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Vehicle Details Preview */}
                    {selectedVehicle && (
                      <div className="p-3 border rounded-md bg-gray-50 space-y-1">
                        <p>
                          <strong>Trailer Type:</strong>{" "}
                          {selectedVehicle.trailerType}
                        </p>
                        <p>
                          <strong>Stall Size:</strong>{" "}
                          {selectedVehicle.stallSize}
                        </p>
                      </div>
                    )}

                    {/* Other Form Fields */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Total Price
                      </label>
                      <Field
                        name="totalPrice"
                        type="number"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                        placeholder="$"
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
                          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                        >
                          <option value="">Select</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="bank">Bank Transfer</option>
                        </Field>
                        <ErrorMessage
                          name="paymentMethod"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Payment Due
                        </label>
                        <Field
                          as="select"
                          name="paymentDue"
                          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                        >
                          <option value="">Select</option>
                          <option value="pickup">On Pickup</option>
                          <option value="delivery">On Delivery</option>
                        </Field>
                        <ErrorMessage
                          name="paymentDue"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Pickup Time
                        </label>
                        <Field
                          name="pickupTime"
                          type="time"
                          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                        />
                        <ErrorMessage
                          name="pickupTime"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Est. Arrival Time
                        </label>
                        <Field
                          name="arrivalTime"
                          type="time"
                          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                        />
                        <ErrorMessage
                          name="arrivalTime"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Transport Type
                        </label>
                        <Field
                          name="transportType"
                          type="text"
                          readOnly
                          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Stalls Required
                        </label>
                        <Field
                          name="stallsRequired"
                          type="number"
                          readOnly
                          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Notes
                      </label>
                      <Field
                        as="textarea"
                        name="notes"
                        rows={3}
                        placeholder="Notes"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
                      />
                    </div>

                    <div className="p-4 border-t flex gap-3">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setIsOfferOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetails;
