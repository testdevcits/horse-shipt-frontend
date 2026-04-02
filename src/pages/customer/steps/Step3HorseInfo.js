import React, { useEffect, useState } from "react";
import Select from "../../../components/common/Select";
import Toast from "../../../components/common/Toast";

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

// Default horse template
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
}) => {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unsavedHorseIdxs, setUnsavedHorseIdxs] = useState([]);

  // Load My Horses on mount
  useEffect(() => {
    if (typeof getMyHorses === "function") getMyHorses();
  }, [getMyHorses]);

  // Populate horses array when myHorses changes
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

  // Validate horse before saving
  const validateHorse = (horse) =>
    horse.registeredName &&
    horse.barnName &&
    horse.breed &&
    (horse.breed !== "Other Breed" || horse.otherBreed) &&
    horse.sex &&
    horse.age &&
    horse.stallType &&
    horse.colour;

  // Save a single horse
  const handleSaveHorse = async (idx) => {
    const horse = horses[idx];

    if (!validateHorse(horse)) {
      setToast({
        message: `Please fill all details for Horse ${idx + 1}`,
        type: "error",
      });
      return false;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      Object.entries(horse).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });

      const response = await createHorse(formData);

      const savedHorse = response?.data?.horse || response?.data?.horses?.[0];

      if (savedHorse?._id) {
        // Update the horse in the local form immediately
        handleHorseChange(idx, "selectedHorseId", savedHorse._id);
        Object.keys(defaultHorse).forEach((k) => {
          if (savedHorse[k] !== undefined) {
            handleHorseChange(idx, k, savedHorse[k]);
          }
        });

        setToast({
          message: `Horse ${idx + 1} saved successfully!`,
          type: "success",
        });

        // Remove from unsaved list if in modal
        setUnsavedHorseIdxs((prev) => prev.filter((i) => i !== idx));
        if (unsavedHorseIdxs.length <= 1) setModalOpen(false); // Close modal if last

        return true;
      }

      setToast({ message: "Failed to save horse", type: "error" });
      return false;
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save horse",
        type: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save selected horses (modal)
  const handleSaveSelectedHorses = () => {
    const unsaved = horses
      .map((h, i) =>
        !h.selectedHorseId || h.selectedHorseId === "new" ? i : null
      )
      .filter((i) => i !== null);

    if (unsaved.length === 0) {
      setToast({
        message: "All selected horses are already saved.",
        type: "info",
      });
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
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Number of Horses */}
      <div className="w-full max-w-full">
        <label className="block text-gray-600 font-medium mb-1">
          Number of Horses
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

      {/* Horse Forms */}
      {horses.slice(0, numberOfHorses).map((horse, idx) => (
        <div
          key={idx}
          className="bg-light p-4 rounded-xl space-y-4 shadow-sm border border-gray-200"
        >
          <p className="font-semibold text-systemText">
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
              const selectedHorse = myHorses.find((h) => h._id === selectedId);
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
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Registered Name
              </label>
              <input
                type="text"
                value={horse.registeredName || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "registeredName", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Barn Name
              </label>
              <input
                type="text"
                value={horse.barnName || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "barnName", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Breed */}
          <Select
            label="Breed"
            value={horse.breed || ""}
            onChange={(e) => handleHorseChange(idx, "breed", e.target.value)}
            options={breedsList.map((b) => ({ value: b, label: b }))}
          />
          {horse.breed === "Other Breed" && (
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Enter Other Breed
              </label>
              <input
                type="text"
                value={horse.otherBreed || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "otherBreed", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          )}

          {/* Colour & Age */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Colour
              </label>
              <input
                type="text"
                value={horse.colour || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "colour", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Age
              </label>
              <input
                type="text"
                value={horse.age || ""}
                onChange={(e) => handleHorseChange(idx, "age", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Sex & Stall */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Sex
              </label>
              <Select
                value={horse.sex || ""}
                onChange={(e) => handleHorseChange(idx, "sex", e.target.value)}
                options={sexes.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-600 mb-1">
                Requested Stall Size
              </label>
              <Select
                value={horse.stallType || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "stallType", e.target.value)
                }
                options={stallTypes.map((s) => ({ value: s, label: s }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              value={horse.notes || ""}
              onChange={(e) => handleHorseChange(idx, "notes", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      ))}

      {/* Save Button */}
      <button
        onClick={handleSaveSelectedHorses}
        disabled={saving}
        className="w-full py-3 bg-system-primary text-white font-semibold rounded-xl hover:bg-[#a7863e]"
      >
        {saving ? "Saving..." : "Save Horses"}
      </button>

      {/* Modal */}
      {modalOpen && unsavedHorseIdxs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 relative max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>

            {/* Unsaved Horses List */}
            {unsavedHorseIdxs.map((idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>
                  Horse {idx + 1}: {horses[idx].registeredName || "Unnamed"}
                </span>
                <button
                  onClick={() => handleModalSave(idx)}
                  className="px-3 py-1 bg-system-primary text-white rounded"
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
