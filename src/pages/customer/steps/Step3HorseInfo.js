// /pages/customer/steps/Step3HorseInfo.jsx
// COMPLETE WORKING FILE - Copy and use directly
// INCLUDES EDIT HIGHLIGHTING FUNCTIONALITY

import React, { useEffect, useState } from "react";
import Select from "../../../components/common/Select";
import Toast from "../../../components/common/Toast";
import ColorPicker from "../../../components/common/ColorPicker";

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

const defaultHorse = {
  registeredName: "",
  barnName: "",
  breed: "",
  otherBreed: "",
  colour: "",
  age: "",
  sex: "",
  stallType: "",
  notes: "",
  selectedHorseId: "new",
};

const Step3HorseInfo = ({
  numberOfHorses,
  setNumberOfHorses,
  horses,
  setHorses,
  handleHorseChange,
  myHorses,
  getMyHorses,
  createHorse,
  editingHorseIdx,
  setEditingHorseIdx,
  errors,
}) => {
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [unsavedHorseIdxs, setUnsavedHorseIdxs] = useState([]);

  useEffect(() => {
    if (editingHorseIdx !== null) {
      const horseElement = document.getElementById(`horse-${editingHorseIdx}`);
      if (horseElement) {
        // Smooth scroll to horse
        horseElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Add visual ring highlight
        horseElement.classList.add(
          "ring-4",
          "ring-[#BF9B53]",
          "transition-all",
          "duration-300"
        );

        // Auto-clear highlight after 3 seconds
        const timer = setTimeout(() => {
          horseElement.classList.remove("ring-4", "ring-[#BF9B53]");
          setEditingHorseIdx(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [editingHorseIdx, setEditingHorseIdx]);

  // Load my horses on mount
  useEffect(() => {
    if (typeof getMyHorses === "function") {
      getMyHorses();
    }
  }, [getMyHorses]);

  // Populate from backend
  useEffect(() => {
    if (Array.isArray(myHorses) && myHorses.length) {
      const populatedHorses = myHorses.map((h) => ({
        ...defaultHorse,
        ...h,
        selectedHorseId: h._id,
        stallType: h.stallType || h.defaultStallSize || "",
      }));
      setHorses(populatedHorses);
      setNumberOfHorses(populatedHorses.length);
    } else if (!horses || horses.length === 0) {
      setHorses([defaultHorse]);
      setNumberOfHorses(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myHorses]);

  // Validate horse
  const validateHorse = (horse) => {
    return (
      horse.registeredName &&
      horse.barnName &&
      horse.breed &&
      (horse.breed !== "Other Breed" || horse.otherBreed) &&
      horse.sex &&
      horse.age &&
      horse.stallType &&
      horse.colour
    );
  };

  // Save single horse
  // ===== Step3HorseInfo.jsx =====
  const handleSaveHorse = async (idx) => {
    const horse = horses[idx];

    if (!validateHorse(horse)) {
      Toast.error(`Please fill all details for Horse ${idx + 1}`);
      return false;
    }

    try {
      setSaving(true);

      // Prepare formData if there is a file, else send JSON object
      let formData;
      const hasFile = Object.values(horse).some((val) => val instanceof File);

      if (hasFile) {
        formData = new FormData();
        Object.entries(horse).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      } else {
        formData = { ...horse }; // send plain object for JSON
      }

      const {
        success,
        horse: savedHorse,
        message,
      } = await createHorse(formData);

      if (!success || !savedHorse?._id) {
        Toast.error(message || "Failed to save horse");
        return false;
      }

      // Update local horse data
      handleHorseChange(idx, "selectedHorseId", savedHorse._id);
      Object.keys(defaultHorse).forEach((k) => {
        if (savedHorse[k] !== undefined) {
          handleHorseChange(idx, k, savedHorse[k]);
        }
      });

      // Update unsavedHorseIdxs safely
      setUnsavedHorseIdxs((prev) => {
        const updated = prev.filter((i) => i !== idx);
        if (updated.length === 0) setModalOpen(false);
        return updated;
      });

      Toast.success(`Horse ${idx + 1} saved successfully!`);
      return true;
    } catch (err) {
      console.error(err);
      Toast.error(err?.message || "Failed to save horse");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save selected horses
  const handleSaveSelectedHorses = () => {
    const unsaved = horses
      .map((h, i) =>
        !h.selectedHorseId || h.selectedHorseId === "new" ? i : null
      )
      .filter((i) => i !== null);

    if (unsaved.length === 0) {
      Toast.info("All selected horses are already saved.");
      return;
    }

    setUnsavedHorseIdxs(unsaved);
    setModalOpen(true);
  };

  const handleModalSave = async (idx) => {
    await handleSaveHorse(idx);
  };

  return (
    <div className="flex flex-col w-full gap-6 px-2 md:px-4 font-montserrat">
      {/* ===== NUMBER OF HORSES ===== */}
      <div className="w-full max-w-full">
        <label className="block text-gray-600 font-semibold mb-2">
          Number of Horses <span className="text-red-500">*</span>
        </label>
        <Select
          value={numberOfHorses}
          onChange={(e) => setNumberOfHorses(Number(e.target.value))}
          options={[...Array(10).keys()].map((i) => ({
            value: i + 1,
            label: String(i + 1),
          }))}
          className="w-full"
        />
      </div>

      {/* ===== HORSE FORMS ===== */}
      {horses.slice(0, numberOfHorses).map((horse, idx) => (
        <div
          key={idx}
          id={`horse-${idx}`}
          className="bg-white p-6 rounded-md space-y-4 shadow-md border border-gray-200 transition-all duration-300"
        >
          <p className="font-bold text-lg text-[#BF9B53]">
            Horse {idx + 1}: {horse.registeredName || "Unnamed"}
          </p>

          {/* Select from My Horses */}
          <Select
            label="Select from My Horses"
            value={horse.selectedHorseId || "new"}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === "new") {
                Object.keys(defaultHorse).forEach((k) =>
                  handleHorseChange(idx, k, defaultHorse[k])
                );
                return;
              }
              const selectedHorse = myHorses?.find((h) => h._id === selectedId);
              if (!selectedHorse) return;
              Object.keys(defaultHorse).forEach((k) =>
                handleHorseChange(idx, k, selectedHorse[k] || "")
              );
              handleHorseChange(idx, "selectedHorseId", selectedHorse._id);
            }}
            options={[
              { value: "new", label: "New Horse" },
              ...(myHorses?.map((h) => ({
                value: h._id,
                label: `${h.registeredName} (${h.barnName})`,
              })) || []),
            ]}
          />

          {/* Registered & Barn Name */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Registered Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse.registeredName || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "registeredName", e.target.value)
                }
                className={`w-full border-2 rounded-lg px-4 py-2 ${
                  errors?.[`registeredName${idx}`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter registered name"
              />
              {errors?.[`registeredName${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`registeredName${idx}`]}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Barn Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse.barnName || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "barnName", e.target.value)
                }
                className={`w-full border-2 rounded-lg px-4 py-2 ${
                  errors?.[`barnName${idx}`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter barn name"
              />
              {errors?.[`barnName${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`barnName${idx}`]}
                </p>
              )}
            </div>
          </div>

          {/* Breed */}
          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <Select
              value={horse.breed || ""}
              onChange={(e) => handleHorseChange(idx, "breed", e.target.value)}
              options={breedsList.map((b) => ({ value: b, label: b }))}
            />
            {errors?.[`breed${idx}`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`breed${idx}`]}
              </p>
            )}
          </div>

          {/* Other Breed */}
          {horse.breed === "Other Breed" && (
            <div>
              <label className="block font-semibold text-gray-600 mb-2">
                Enter Other Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse.otherBreed || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "otherBreed", e.target.value)
                }
                className={`w-full border-2 rounded-lg px-4 py-2 ${
                  errors?.[`otherBreed${idx}`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Specify breed"
              />
              {errors?.[`otherBreed${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`otherBreed${idx}`]}
                </p>
              )}
            </div>
          )}

          {/* Colour & Age */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* COLOR PICKER */}
            <ColorPicker
              value={horse.colour}
              onChange={(val) => handleHorseChange(idx, "colour", val)}
              label="Colour"
              error={errors?.[`colour${idx}`]}
            />

            {/* AGE INPUT (unchanged) */}
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Age <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={horse.age || ""}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  handleHorseChange(idx, "age", onlyNumbers);
                }}
                className={`w-full border-2 rounded-lg px-4 py-2 ${
                  errors?.[`age${idx}`] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 5"
              />

              {errors?.[`age${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`age${idx}`]}
                </p>
              )}
            </div>
          </div>

          {/* Sex & Stall Type */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Sex <span className="text-red-500">*</span>
              </label>
              <Select
                value={horse.sex || ""}
                onChange={(e) => handleHorseChange(idx, "sex", e.target.value)}
                options={sexes.map((s) => ({ value: s, label: s }))}
              />
              {errors?.[`sex${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`sex${idx}`]}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Requested Stall Size <span className="text-red-500">*</span>
              </label>
              <Select
                value={horse.stallType || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "stallType", e.target.value)
                }
                options={stallTypes.map((s) => ({ value: s, label: s }))}
              />
              {errors?.[`stallType${idx}`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`stallType${idx}`]}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Additional Notes
            </label>
            <textarea
              value={horse.notes || ""}
              onChange={(e) => handleHorseChange(idx, "notes", e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder="Any additional information about this horse..."
            />
          </div>
        </div>
      ))}

      {/* ===== SAVE BUTTON ===== */}
      <button
        onClick={handleSaveSelectedHorses}
        disabled={saving}
        className="w-full py-3 bg-[#BF9B53] text-white font-bold rounded-md hover:bg-[#a7863e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {saving ? "Saving..." : "Save Horses"}
      </button>

      {/* ===== MODAL ===== */}
      {modalOpen && unsavedHorseIdxs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-black hover:text-gray-700 text-2xl font-bold z-10"
            >
              ×
            </button>

            <h2 className="text-lg font-bold text-gray-800">
              Save Unsaved Horses
            </h2>

            {unsavedHorseIdxs.map((idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border-2 border-gray-200 rounded-lg"
              >
                <span className="font-semibold">
                  Horse {idx + 1}: {horses[idx].registeredName || "Unnamed"}
                </span>
                <button
                  onClick={() => handleModalSave(idx)}
                  className="px-4 py-2 bg-[#BF9B53] text-white rounded-lg hover:bg-[#a7863e] font-semibold"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3HorseInfo;
