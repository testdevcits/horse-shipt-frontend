// src/pages/customer/MyHorses.jsx
import React, { useEffect, useState } from "react";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { CiEdit, CiTrash } from "react-icons/ci";
import Toast from "../../components/common/Toast";
import InputField from "../../components/common/InputField";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";

// Constants
const breedsList = [
  "American Sport Pony",
  "American Warmblood",
  "Appendix",
  "Argentinian Warmblood",
  "Belgian Warmblood",
  "Brandenburger",
  "Canadian Sport Horse",
  "Canadian Warmblood",
  "Chincoteague",
  "Cleveland Bay",
  "Connemara",
  "Crossbred",
  "Czech Warmblood",
  "Danish Warmblood",
  "Dutch Warmblood",
  "English TB",
  "French TB",
  "German Riding Pony",
  "German Warmblood",
  "Hanoverian",
  "Holsteiner",
  "Hungarian Warmblood",
  "Irish Draught",
  "Irish Sport Horse",
  "Irish TB",
  "New Forest Pony",
  "Oldenburg",
  "Paint",
  "Pony of the Americas",
  "Quarter Horse",
  "Quarter Pony",
  "RPSI",
  "Selle Francais",
  "Shetland",
  "Swedish Warmblood",
  "TB (Thoroughbred)",
  "TB Cross",
  "Trakehner",
  "Warmblood",
  "Warmblood Cross",
  "Welsh Cob",
  "Welsh Cross",
  "Welsh Pony",
  "Westphalian",
  "Zangersheide",
  "Other Breed",
];
const sexes = ["Stallion", "Gelding", "Mare", "Colt", "Filly"];
const stallTypes = ["Box", "1/2 Box", "Single Stall"];

// Yup Validation
const HorseSchema = Yup.object().shape({
  registeredName: Yup.string().required("Registered Name is required"),
  barnName: Yup.string().required("Barn Name is required"),
  breed: Yup.string().required("Breed is required"),
  otherBreed: Yup.string().when("breed", {
    is: "Other Breed",
    then: Yup.string().required("Please specify other breed"),
  }),
  colour: Yup.string().required("Colour is required"),
  age: Yup.number().required("Age is required").min(0, "Invalid age"),
  sex: Yup.string().required("Sex is required"),
  stallType: Yup.string().required("Stall Type is required"),
  notes: Yup.string().required("Notes are required"),
});

const MyHorses = () => {
  const { horseLoading, horseError, getMyHorses, createHorse } =
    useCustomerShipments();
  const [horses, setHorses] = useState([]);
  const [editingHorse, setEditingHorse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteHorseId, setDeleteHorseId] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    type: "info",
    show: false,
  });

  useEffect(() => {
    const fetchHorses = async () => {
      const list = await getMyHorses();
      if (list) setHorses(list);
    };
    fetchHorses();
  }, [getMyHorses]);

  const handleDelete = async () => {
    if (!deleteHorseId) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/customer/horses/${deleteHorseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setHorses((prev) => prev.filter((h) => h._id !== deleteHorseId));
        setToast({
          message: "Horse deleted successfully",
          type: "success",
          show: true,
        });
      } else {
        setToast({
          message: data.message || "Failed to delete horse",
          type: "error",
          show: true,
        });
      }
    } catch (err) {
      setToast({
        message: err.message || "Action failed",
        type: "error",
        show: true,
      });
    } finally {
      setDeleteHorseId(null);
    }
  };

  return (
    <div className="">
      {/* Heading + Add Button Row */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-[16px] font-semibold text-systemText leading-[24px] uppercase">
          My Horses
        </h2>
        {!showForm && (
          <Button
            className="flex items-center justify-center gap-2 bg-[#bf9b53] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition w-full sm:w-auto font-bold"
            onClick={() => {
              setShowForm(true);
              setEditingHorse(null);
            }}
          >
            Horse +
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Formik
          initialValues={{
            registeredName: editingHorse?.registeredName || "",
            barnName: editingHorse?.barnName || "",
            breed: editingHorse?.breed || "",
            otherBreed: editingHorse?.otherBreed || "",
            colour: editingHorse?.colour || "",
            age: editingHorse?.age || "",
            sex: editingHorse?.sex || "",
            stallType:
              editingHorse?.stallType || editingHorse?.defaultStallSize || "",
            notes: editingHorse?.notes || "",
          }}
          enableReinitialize
          validationSchema={HorseSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              let res;
              if (editingHorse) {
                res = await fetch(
                  `${process.env.REACT_APP_API_BASE_URL}/customer/horses/${editingHorse._id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(values),
                  }
                );
              } else {
                res = await createHorse(values);
              }

              const data = res?.json ? await res.json() : res;
              if (data.success || res?.data?.horse) {
                const horseData = data.horse || res?.data?.horse;
                setHorses((prev) =>
                  editingHorse
                    ? prev.map((h) =>
                        h._id === editingHorse._id ? horseData : h
                      )
                    : [horseData, ...prev]
                );
                setToast({
                  message: editingHorse
                    ? "Horse updated successfully"
                    : "Horse created successfully",
                  type: "success",
                  show: true,
                });
                resetForm();
                setEditingHorse(null);
                setShowForm(false);
              } else {
                setToast({
                  message: data.message || "Action failed",
                  type: "error",
                  show: true,
                });
              }
            } catch (err) {
              setToast({
                message: err.message || "Action failed",
                type: "error",
                show: true,
              });
            }
          }}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <Form
              onSubmit={handleSubmit}
              className="mb-6 border p-4 rounded-xl shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4">
                {editingHorse ? "Edit Horse" : "Add New Horse"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Registered Name"
                  name="registeredName"
                  value={values.registeredName}
                  onChange={handleChange}
                  error={touched.registeredName && errors.registeredName}
                />
                <InputField
                  label="Barn Name"
                  name="barnName"
                  value={values.barnName}
                  onChange={handleChange}
                  error={touched.barnName && errors.barnName}
                />
                <InputField
                  label="Colour"
                  name="colour"
                  value={values.colour}
                  onChange={handleChange}
                  error={touched.colour && errors.colour}
                />
                <InputField
                  label="Age"
                  type="number"
                  name="age"
                  value={values.age}
                  onChange={handleChange}
                  error={touched.age && errors.age}
                />

                <Select
                  label="Breed"
                  name="breed"
                  value={values.breed}
                  onChange={handleChange}
                  options={breedsList.map((b) => ({ value: b, label: b }))}
                  error={touched.breed && errors.breed}
                />
                {values.breed === "Other Breed" && (
                  <InputField
                    label="Other Breed"
                    name="otherBreed"
                    value={values.otherBreed}
                    onChange={handleChange}
                    error={touched.otherBreed && errors.otherBreed}
                  />
                )}
                <Select
                  label="Sex"
                  name="sex"
                  value={values.sex}
                  onChange={handleChange}
                  options={sexes.map((s) => ({ value: s, label: s }))}
                  error={touched.sex && errors.sex}
                />
                <Select
                  label="Stall Size"
                  name="stallType"
                  value={values.stallType}
                  onChange={handleChange}
                  options={stallTypes.map((s) => ({ value: s, label: s }))}
                  error={touched.stallType && errors.stallType}
                />

                <InputField
                  label="Notes"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  error={touched.notes && errors.notes}
                  className="col-span-1 md:col-span-2"
                />
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <Button type="submit">
                  {editingHorse ? "Update Horse" : "Save Horse"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHorse(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {/* Horse List */}
      {!showForm && (
        <>
          {horseLoading ? (
            <PageLoader text="" fullScreen={false} />
          ) : horseError ? (
            <p className="text-red-500">{horseError}</p>
          ) : horses.length === 0 ? (
            <NoData
              title="No Horses Found"
              description="You haven't added any horses yet. Click 'Horse +' to get started!"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {horses.map((horse) => (
                <div
                  key={horse._id}
                  className="border rounded-2xl p-5 shadow-md bg-white hover:shadow-lg transition flex flex-col"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {horse.registeredName}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="custom"
                        icon={<CiEdit />}
                        onClick={() => {
                          setEditingHorse(horse);
                          setShowForm(true);
                        }}
                      />
                      <Button
                        variant="custom"
                        icon={<CiTrash />}
                        onClick={() => setDeleteHorseId(horse._id)}
                        bgColor="#EF4444"
                        textColor="#fff"
                      />
                    </div>
                  </div>

                  {/* Horse Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm">
                    <p>
                      <span className="font-semibold">Barn Name:</span>{" "}
                      {horse.barnName}
                    </p>
                    <p>
                      <span className="font-semibold">Breed:</span>{" "}
                      {horse.breed}
                    </p>
                    <p>
                      <span className="font-semibold">Colour:</span>{" "}
                      {horse.colour}
                    </p>
                    <p>
                      <span className="font-semibold">Age:</span> {horse.age}
                    </p>
                    <p>
                      <span className="font-semibold">Sex:</span> {horse.sex}
                    </p>
                    <p>
                      <span className="font-semibold">Stall:</span>{" "}
                      {horse.stallType || horse.defaultStallSize}
                    </p>
                  </div>

                  {/* Notes */}
                  {horse.notes && (
                    <p className="mt-3 text-gray-600 text-sm">
                      <span className="font-semibold">Notes:</span>{" "}
                      {horse.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={!!deleteHorseId}
        title="Delete Horse"
        message="Are you sure you want to delete this horse? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteHorseId(null)}
        confirmText="Delete"
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default MyHorses;
