import React, { useEffect, useState } from "react";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { CiEdit, CiTrash } from "react-icons/ci";
import Toast from "../../components/common/Toast";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
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

const MyHorses = () => {
  const { horseLoading, horseError, getMyHorses, createHorse } =
    useCustomerShipments();

  const [horses, setHorses] = useState([]);
  const [editingHorseIndex, setEditingHorseIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteHorseId, setDeleteHorseId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchHorses = async () => {
      const list = await getMyHorses();
      if (list) setHorses(list);
    };
    fetchHorses();
  }, [getMyHorses]);

  const handleHorseChange = (idx, field, value) => {
    setHorses((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const validateHorse = (horse) => {
    const newErrors = {};
    if (!horse.registeredName) newErrors.registeredName = "Required";
    if (!horse.barnName) newErrors.barnName = "Required";
    if (!horse.colour) newErrors.colour = "Required";
    if (!horse.age) newErrors.age = "Required";
    if (!horse.breed) newErrors.breed = "Required";
    if (horse.breed === "Other Breed" && !horse.otherBreed)
      newErrors.otherBreed = "Required";
    if (!horse.sex) newErrors.sex = "Required";
    if (!horse.stallType) newErrors.stallType = "Required";
    if (!horse.notes) newErrors.notes = "Required";
    return newErrors;
  };

  const handleSaveHorse = async () => {
    if (editingHorseIndex === null) return;

    const horse = horses[editingHorseIndex];
    const validationErrors = validateHorse(horse);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Toast.error("Please fill all required fields");
      return;
    }

    try {
      let res;
      if (horse._id) {
        // Update existing horse
        res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/customer/horses/${horse._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(horse),
          }
        );
      } else {
        // Create new horse
        res = await createHorse(horse);
      }

      const data = res?.json ? await res.json() : res;

      if (data.success || res?.data?.horse) {
        const horseData = data.horse || res?.data?.horse;
        setHorses((prev) =>
          horse._id
            ? prev.map((h) => (h._id === horse._id ? horseData : h))
            : [horseData, ...prev]
        );
        Toast.success(horse._id ? "Horse updated" : "Horse created");
        setShowForm(false);
        setEditingHorseIndex(null);
        setErrors({});
      } else {
        Toast.error(data.message || "Action failed");
      }
    } catch (err) {
      Toast.error(err.message || "Action failed");
    }
  };

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
        Toast.success("Horse deleted successfully");
      } else {
        Toast.error(data.message || "Failed to delete horse");
      }
    } catch (err) {
      Toast.error(err.message || "Action failed");
    } finally {
      setDeleteHorseId(null);
    }
  };

  const startAddHorse = () => {
    setHorses((prev) => [...prev, {}]);
    setEditingHorseIndex(horses.length);
    setShowForm(true);
  };

  const startEditHorse = (idx) => {
    setEditingHorseIndex(idx);
    setShowForm(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-systemText uppercase">
          My Horses
        </h2>
        {!showForm && (
          <Button
            onClick={startAddHorse}
            className="bg-system-primary text-white"
          >
            Horse +
          </Button>
        )}
      </div>

      {/* Horse Form */}
      {showForm && editingHorseIndex !== null && (
        <div className="border p-4 sm:p-6 rounded-md shadow-sm bg-white">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
            {horses[editingHorseIndex]?._id ? "Edit Horse" : "Add New Horse"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={horses[editingHorseIndex]?.registeredName || ""}
              onChange={(e) =>
                handleHorseChange(
                  editingHorseIndex,
                  "registeredName",
                  e.target.value
                )
              }
              placeholder="Registered Name"
              className={`w-full border-2 rounded-lg px-4 py-2 ${
                errors.registeredName ? "border-red-500" : "border-gray-300"
              }`}
            />
            <input
              type="text"
              value={horses[editingHorseIndex]?.barnName || ""}
              onChange={(e) =>
                handleHorseChange(editingHorseIndex, "barnName", e.target.value)
              }
              placeholder="Barn Name"
              className={`w-full border-2 rounded-lg px-4 py-2 ${
                errors.barnName ? "border-red-500" : "border-gray-300"
              }`}
            />
            <input
              type="text"
              value={horses[editingHorseIndex]?.colour || ""}
              onChange={(e) =>
                handleHorseChange(editingHorseIndex, "colour", e.target.value)
              }
              placeholder="Colour"
              className={`w-full border-2 rounded-lg px-4 py-2 ${
                errors.colour ? "border-red-500" : "border-gray-300"
              }`}
            />

            <input
              type="text"
              value={horses[editingHorseIndex]?.age || ""}
              onChange={(e) => {
                // allow only digits
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                handleHorseChange(editingHorseIndex, "age", onlyNumbers);
              }}
              placeholder="Age"
              className={`w-full border-2 rounded-lg px-4 py-2 ${
                errors.age ? "border-red-500" : "border-gray-300"
              }`}
            />

            <Select
              value={horses[editingHorseIndex]?.breed || ""}
              onChange={(e) =>
                handleHorseChange(editingHorseIndex, "breed", e.target.value)
              }
              options={breedsList.map((b) => ({ value: b, label: b }))}
            />
            {horses[editingHorseIndex]?.breed === "Other Breed" && (
              <input
                type="text"
                value={horses[editingHorseIndex]?.otherBreed || ""}
                onChange={(e) =>
                  handleHorseChange(
                    editingHorseIndex,
                    "otherBreed",
                    e.target.value
                  )
                }
                placeholder="Other Breed"
                className={`w-full border-2 rounded-lg px-4 py-2 ${
                  errors.otherBreed ? "border-red-500" : "border-gray-300"
                }`}
              />
            )}

            <Select
              value={horses[editingHorseIndex]?.sex || ""}
              onChange={(e) =>
                handleHorseChange(editingHorseIndex, "sex", e.target.value)
              }
              options={sexes.map((s) => ({ value: s, label: s }))}
            />

            <Select
              value={horses[editingHorseIndex]?.stallType || ""}
              onChange={(e) =>
                handleHorseChange(
                  editingHorseIndex,
                  "stallType",
                  e.target.value
                )
              }
              options={stallTypes.map((s) => ({ value: s, label: s }))}
            />

            <textarea
              value={horses[editingHorseIndex]?.notes || ""}
              onChange={(e) =>
                handleHorseChange(editingHorseIndex, "notes", e.target.value)
              }
              placeholder="Notes"
              className={`col-span-1 md:col-span-2 w-full border-2 rounded-lg px-4 py-2 ${
                errors.notes ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleSaveHorse} className="w-full sm:w-auto">
              Save Horse
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingHorseIndex(null);
                setErrors({});
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Horse List */}
      {!showForm && (
        <>
          {horseLoading ? (
            <PageLoader text="" fullScreen={false} />
          ) : horseError ? (
            <p className="text-red-500 text-center">{horseError}</p>
          ) : horses.length === 0 ? (
            <NoData
              title="No Horses Found"
              description="You haven't added any horses yet. Click 'Horse +' to get started!"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {horses.map((horse, idx) => (
                <div
                  key={horse._id || idx}
                  className="relative border border-[#BF9B53]/40 rounded-md p-5 bg-white shadow-sm hover:shadow-lg transition duration-300 flex flex-col"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                      {horse.registeredName}
                    </h3>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="custom"
                        icon={<CiEdit size={20} />}
                        onClick={() => startEditHorse(idx)}
                        rounded
                        textColor="#BF9B53"
                      />

                      <Button
                        variant="custom"
                        icon={<CiTrash size={20} />}
                        onClick={() => setDeleteHorseId(horse._id)}
                        rounded
                        textColor="#B91C1C"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                    <p>
                      <span className="font-semibold text-[#BF9B53]">
                        Barn Name:
                      </span>{" "}
                      {horse.barnName}
                    </p>
                    <p>
                      <span className="font-semibold text-[#BF9B53]">
                        Breed:
                      </span>{" "}
                      {horse.breed}
                    </p>
                    <p>
                      <span className="font-semibold text-[#BF9B53]">
                        Colour:
                      </span>{" "}
                      {horse.colour}
                    </p>
                    <p>
                      <span className="font-semibold text-[#BF9B53]">Age:</span>{" "}
                      {horse.age}
                    </p>
                    <p>
                      <span className="font-semibold text-[#BF9B53]">Sex:</span>{" "}
                      {horse.sex}
                    </p>
                    <p>
                      <span className="font-semibold text-[#BF9B53]">
                        Stall:
                      </span>{" "}
                      {horse.stallType || horse.defaultStallSize}
                    </p>
                  </div>

                  {horse.notes && (
                    <div className="mt-4 p-3 rounded-md bg-[#BF9B53]/10 border border-[#BF9B53]/20">
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold text-[#BF9B53]">
                          Notes:
                        </span>{" "}
                        {horse.notes}
                      </p>
                    </div>
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
    </div>
  );
};

export default MyHorses;
