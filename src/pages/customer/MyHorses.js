import React, { useEffect, useState } from "react";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { CiEdit, CiTrash } from "react-icons/ci";
import Toast from "../../components/common/Toast";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";
import ColorPicker from "../../components/common/ColorPicker";

// =====================================================
// CONSTANTS
// =====================================================
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

const emptyHorse = {
  registeredName: "",
  barnName: "",
  colour: "",
  age: "",
  breed: "",
  otherBreed: "",
  sex: "",
  stallType: "",
  notes: "",
};

// =====================================================
// SPINNER OVERLAY
// =====================================================
const Spinner = ({ text }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-md shadow-xl px-10 py-8 flex flex-col items-center gap-4">
      <svg
        className="animate-spin h-10 w-10 text-[#BF9B53]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p className="text-gray-700 font-semibold text-base">{text}</p>
    </div>
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
const MyHorses = () => {
  const {
    myHorses,
    horseLoading,
    horseError,
    getMyHorses,
    createHorse,
    updateHorse,
    deleteHorse,
  } = useCustomerShipments();

  // Local horses list synced from context
  const [horses, setHorses] = useState([]);

  // Form state — holds the horse being added/edited
  const [editingHorse, setEditingHorse] = useState(null);
  const [isNewHorse, setIsNewHorse] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});

  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteHorseId, setDeleteHorseId] = useState(null);

  // =====================================================
  // SYNC context → local state
  // =====================================================
  useEffect(() => {
    setHorses(myHorses);
  }, [myHorses]);

  // =====================================================
  // FETCH ON MOUNT (context caches, so safe to call)
  // =====================================================
  useEffect(() => {
    getMyHorses();
  }, [getMyHorses]);

  // =====================================================
  // FIELD CHANGE
  // =====================================================
  const handleFieldChange = (field, value) => {
    setEditingHorse((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const isValidName = (name) => {
    if (!name || name.trim().length === 0) return false;
    return name.trim().split(/\s+/).length >= 3 || name.trim().length >= 3;
  };

  const validateHorse = (horse) => {
    const newErrors = {};
    if (!horse.registeredName || !isValidName(horse.registeredName))
      newErrors.registeredName = "Minimum 3 characters or 3 words required";
    if (!horse.barnName || !isValidName(horse.barnName))
      newErrors.barnName = "Minimum 3 characters or 3 words required";
    if (!horse.colour) newErrors.colour = "Required";
    if (!horse.age) newErrors.age = "Required";
    if (horse.age && isNaN(horse.age)) newErrors.age = "Must be a number";
    if (!horse.breed) newErrors.breed = "Required";
    if (horse.breed === "Other Breed" && !horse.otherBreed)
      newErrors.otherBreed = "Required";
    if (!horse.sex) newErrors.sex = "Required";
    if (!horse.stallType) newErrors.stallType = "Required";
    if (!horse.notes || horse.notes.trim().length < 10)
      newErrors.notes = "Minimum 10 characters required";
    return newErrors;
  };

  // =====================================================
  // SAVE (CREATE or UPDATE via context)
  // =====================================================
  const handleSaveHorse = async () => {
    const validationErrors = validateHorse(editingHorse);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSaving(true);
    try {
      if (isNewHorse) {
        const result = await createHorse(editingHorse);
        if (result?.success) {
          Toast.success("Horse added successfully");
          closeForm();
        } else {
          Toast.error(result?.message || "Failed to add horse");
        }
      } else {
        const result = await updateHorse(editingHorse._id, editingHorse);
        if (result?.success) {
          Toast.success("Horse updated successfully");
          closeForm();
        } else {
          Toast.error(result?.message || "Failed to update horse");
        }
      }
    } catch (err) {
      Toast.error(err.message || "Failed to save horse");
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // DELETE (via context)
  // =====================================================
  const handleDelete = async () => {
    if (!deleteHorseId) return;
    setIsDeleting(true);
    try {
      const result = await deleteHorse(deleteHorseId);
      if (result?.success) {
        Toast.success("Horse deleted successfully");
      } else {
        Toast.error(result?.message || "Failed to delete horse");
      }
    } catch (err) {
      Toast.error(err.message || "Failed to delete horse");
    } finally {
      setIsDeleting(false);
      setDeleteHorseId(null);
    }
  };

  // =====================================================
  // FORM HELPERS
  // =====================================================
  const startAddHorse = () => {
    setEditingHorse({ ...emptyHorse });
    setIsNewHorse(true);
    setShowForm(true);
    setErrors({});
  };

  // ✅ FIX: stallType ko normalize karo — backend kabhi kabhi defaultStallSize
  // field mein value bhejta hai stallType ki jagah. Dono ko check karo.
  const startEditHorse = (horse) => {
    setEditingHorse({
      ...horse,
      stallType: horse.stallType || horse.defaultStallSize || "",
    });
    setIsNewHorse(false);
    setShowForm(true);
    setErrors({});
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingHorse(null);
    setIsNewHorse(false);
    setErrors({});
  };

  // =====================================================
  // INITIAL LOADING SCREEN
  // =====================================================
  if (horseLoading && horses.length === 0) {
    return <PageLoader text="Loading your horses..." fullScreen={false} />;
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="w-full flex flex-col gap-6 font-montserrat">
      {/* ── Loading Overlays ── */}
      {isSaving && (
        <Spinner text={isNewHorse ? "Adding horse..." : "Updating horse..."} />
      )}
      {isDeleting && <Spinner text="Deleting horse..." />}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 uppercase">
          My Horses
        </h2>
        {!showForm && (
          <Button onClick={startAddHorse} className="bg-[#BF9B53] text-white">
            Horse +
          </Button>
        )}
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && editingHorse && (
        <div className="border border-gray-200 p-4 sm:p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-gray-900">
            {isNewHorse ? "Add New Horse" : "Edit Horse"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registered Name */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Registered Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingHorse.registeredName || ""}
                onChange={(e) =>
                  handleFieldChange("registeredName", e.target.value)
                }
                placeholder="Enter registered name (min. 3 characters or 3 words)"
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.registeredName
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              />
              {errors.registeredName && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.registeredName}
                </p>
              )}
            </div>

            {/* Barn Name */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Barn Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingHorse.barnName || ""}
                onChange={(e) => handleFieldChange("barnName", e.target.value)}
                placeholder="Enter barn name (min. 3 characters or 3 words)"
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.barnName
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              />
              {errors.barnName && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.barnName}
                </p>
              )}
            </div>

            {/* Colour */}
            <ColorPicker
              value={editingHorse.colour || ""}
              onChange={(value) => handleFieldChange("colour", value)}
              error={errors.colour}
              label="Colour"
            />

            {/* Age */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Age (years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={editingHorse.age || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[0-9]*$/.test(val))
                    handleFieldChange("age", val);
                }}
                placeholder="Enter age"
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.age
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.age}
                </p>
              )}
            </div>

            {/* Breed */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Breed <span className="text-red-500">*</span>
              </label>
              <select
                value={editingHorse.breed || ""}
                onChange={(e) => handleFieldChange("breed", e.target.value)}
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.breed
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              >
                <option value="">Select breed</option>
                {breedsList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.breed && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.breed}
                </p>
              )}
            </div>

            {/* Other Breed */}
            {editingHorse.breed === "Other Breed" && (
              <div>
                <label className="block font-semibold text-sm text-gray-600 mb-2">
                  Specify Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingHorse.otherBreed || ""}
                  onChange={(e) =>
                    handleFieldChange("otherBreed", e.target.value)
                  }
                  placeholder="Enter other breed"
                  className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                    errors.otherBreed
                      ? "border-red-500 focus:ring-2 focus:ring-red-300"
                      : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                  }`}
                />
                {errors.otherBreed && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.otherBreed}
                  </p>
                )}
              </div>
            )}

            {/* Sex */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Sex <span className="text-red-500">*</span>
              </label>
              <select
                value={editingHorse.sex || ""}
                onChange={(e) => handleFieldChange("sex", e.target.value)}
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.sex
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              >
                <option value="">Select sex</option>
                {sexes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.sex && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.sex}
                </p>
              )}
            </div>

            {/* ✅ Stall Type — value stallTypes list se match hona chahiye */}
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Stall Type <span className="text-red-500">*</span>
              </label>
              <select
                value={
                  // ✅ Ensure the value exactly matches one of stallTypes options
                  stallTypes.includes(editingHorse.stallType)
                    ? editingHorse.stallType
                    : ""
                }
                onChange={(e) => handleFieldChange("stallType", e.target.value)}
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
                  errors.stallType
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              >
                <option value="">Select stall type</option>
                {stallTypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.stallType && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.stallType}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block font-semibold text-sm text-gray-600 mb-2">
                Notes (General Info) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editingHorse.notes || ""}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                placeholder="Enter notes about the horse (min. 10 characters)"
                rows="4"
                className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all resize-none ${
                  errors.notes
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
                }`}
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.notes}
                </p>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleSaveHorse}
              disabled={isSaving}
              className="flex-1 bg-[#BF9B53] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? isNewHorse
                  ? "Adding..."
                  : "Updating..."
                : isNewHorse
                ? "Add Horse"
                : "Update Horse"}
            </Button>
            <Button
              variant="secondary"
              onClick={closeForm}
              disabled={isSaving}
              className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Horse List ── */}
      {!showForm && (
        <>
          {horseError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-semibold">{horseError}</p>
            </div>
          ) : horses.length === 0 ? (
            <NoData
              title="No Horses Found"
              description="You haven't added any horses yet. Click 'Horse +' to get started!"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {horses.map((horse) => (
                <div
                  key={horse._id}
                  className="relative border border-[#BF9B53]/30 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      {horse.registeredName || "Untitled Horse"}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditHorse(horse)}
                        disabled={isDeleting}
                        className="p-2 text-[#BF9B53] hover:bg-[#BF9B53]/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Edit horse"
                      >
                        <CiEdit size={20} />
                      </button>
                      <button
                        onClick={() => setDeleteHorseId(horse._id)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete horse"
                      >
                        <CiTrash size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="font-semibold text-[#BF9B53]">
                        Barn Name:
                      </span>{" "}
                      <span className="text-gray-700">
                        {horse.barnName || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#BF9B53]">
                        Breed:
                      </span>{" "}
                      <span className="text-gray-700">
                        {horse.breed || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#BF9B53]">
                        Colour:
                      </span>{" "}
                      <span className="text-gray-700">
                        {horse.colour || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#BF9B53]">Age:</span>{" "}
                      <span className="text-gray-700">
                        {horse.age ? `${horse.age} years` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#BF9B53]">Sex:</span>{" "}
                      <span className="text-gray-700">{horse.sex || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#BF9B53]">
                        Stall:
                      </span>{" "}
                      <span className="text-gray-700">
                        {horse.stallType || horse.defaultStallSize || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {horse.notes && (
                    <div className="mt-4 p-3 rounded-lg bg-[#BF9B53]/10 border border-[#BF9B53]/20">
                      <p className="text-sm text-gray-700">
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

      {/* ── Confirm Delete Modal ── */}
      <ConfirmModal
        show={!!deleteHorseId}
        title="Delete Horse"
        message="Are you sure you want to delete this horse? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setDeleteHorseId(null)}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
};

export default MyHorses;
