import React, { useEffect, useState } from "react";
import Select from "../../../components/common/Select";
import Toast from "../../../components/common/Toast";
import ColorPicker from "../../../components/common/ColorPicker";
import { useHorseAttributeOptions } from "../../../hooks/useHorseAttributeOptions";

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
  notesLog: [],
  selectedHorseId: "new",
};

const Step3HorseInfo = ({
  numberOfHorses,
  setNumberOfHorses,
  horses = [],
  setHorses,
  handleHorseChange,
  myHorses = [],
  getMyHorses,
  createHorse,
  editingHorseIdx,
  setEditingHorseIdx,
  errors = {},
  isEditMode,
  metadataOnly = false,
}) => {
  const { colors: colorOptions, sexes: sexOptions } = useHorseAttributeOptions();
  const [savingHorseIdx, setSavingHorseIdx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unsavedHorseIdxs, setUnsavedHorseIdxs] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (editingHorseIdx !== null) {
      const horseElement = document.getElementById(`horse-${editingHorseIdx}`);
      if (horseElement) {
        horseElement.scrollIntoView({ behavior: "smooth", block: "center" });
        horseElement.classList.add(
          "ring-4",
          "ring-[#BF9B53]",
          "transition-all",
          "duration-300"
        );
        const timer = setTimeout(() => {
          horseElement.classList.remove("ring-4", "ring-[#BF9B53]");
          setEditingHorseIdx(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [editingHorseIdx, setEditingHorseIdx]);

  const validateHorse = (horse) => {
    return (
      horse?.registeredName &&
      horse?.barnName &&
      horse?.breed &&
      (horse?.breed !== "Other Breed" || horse?.otherBreed) &&
      horse?.sex &&
      horse?.age &&
      horse?.stallType &&
      horse?.colour
    );
  };

  const handleSaveHorse = async (idx) => {
    const horse = horses[idx];

    if (!validateHorse(horse)) {
      Toast.error(`Please fill all details for Horse ${idx + 1}`);
      return false;
    }

    try {
      setSavingHorseIdx(idx);

      let formData;
      const hasFile = Object.values(horse || {}).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        formData = new FormData();
        Object.entries(horse || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      } else {
        formData = { ...horse };
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

      // ✅ FIX 1: Properly map defaultStallSize to stallType
      handleHorseChange(idx, "selectedHorseId", savedHorse._id);
      Object.keys(defaultHorse).forEach((k) => {
        let value = savedHorse[k];

        // Handle stallType/defaultStallSize mapping
        if (k === "stallType") {
          value = savedHorse.stallType || savedHorse.defaultStallSize || "";
        }

        if (value !== undefined && value !== null) {
          handleHorseChange(idx, k, value);
        }
      });

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
      setSavingHorseIdx(null);
    }
  };

  const handleSaveSelectedHorses = () => {
    // ✅ FIX 2: Only show unsaved horses (selectedHorseId === "new")
    const unsaved = horses
      .slice(0, numberOfHorses)
      .map((h, i) => (h?.selectedHorseId === "new" ? i : null))
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

  const displayHorses = Array.isArray(horses) ? horses : [];
  const horseOptions = Array.isArray(myHorses)
    ? myHorses.map((h) => ({
        value: h._id,
        label: `${h.registeredName} (${h.barnName})`,
      }))
    : [];

  // ✅ FIX 3: Only show button if there are truly unsaved NEW horses
  const hasNewUnsavedHorses =
    displayHorses
      .slice(0, numberOfHorses)
      .some((h) => h?.selectedHorseId === "new") && !isEditMode;

  return (
    <div className="flex flex-col w-full gap-6 px-2 md:px-4 font-montserrat">
      {!isEditMode && (
        <div className="w-full max-w-full">
          <label className="block text-[#BF9B53] font-semibold mb-2">
            Select Number of Horses <span className="text-red-500">*</span>
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
      )}

      {displayHorses.slice(0, numberOfHorses).map((horse, idx) => (
        <div
          key={idx}
          id={`horse-${idx}`}
          className="bg-white p-6 rounded-md space-y-4 shadow-md border border-gray-200 transition-all duration-300"
        >
          <p className="font-bold text-lg text-[#BF9B53]">
            Horse {idx + 1}: {horse?.registeredName || "Unnamed"}
          </p>

          {metadataOnly ? (
            <div>
              <label className="block font-semibold text-gray-600 mb-2">
                Additional Notes
              </label>
              <textarea
                value={horse?.notes || ""}
                onChange={(e) =>
                  handleHorseChange(idx, "notes", e.target.value)
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                rows={4}
                placeholder="Add a new note. Previous notes will stay in the log."
              />
              {horse?.notesLog?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Existing Notes
                  </p>
                  {horse.notesLog.map((entry, noteIdx) => (
                    <div
                      key={noteIdx}
                      className="rounded-sm border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                        <span className="font-semibold">
                          {entry.userName || "Customer"}
                        </span>
                        {entry.createdAt && (
                          <span>
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                        {entry.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
          {!isEditMode && (
            <Select
              label="Select from My Horses"
              value={horse?.selectedHorseId || "new"}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId === "new") {
                  Object.keys(defaultHorse).forEach((k) =>
                    handleHorseChange(idx, k, defaultHorse[k])
                  );
                  return;
                }
                const selectedHorse = myHorses?.find(
                  (h) => h._id === selectedId
                );
                if (!selectedHorse) return;

                Object.keys(defaultHorse).forEach((k) => {
                  let value = selectedHorse[k] || "";

                  // ✅ FIX 4: Properly map defaultStallSize when selecting from my horses
                  if (
                    k === "stallType" &&
                    !value &&
                    selectedHorse.defaultStallSize
                  ) {
                    value = selectedHorse.defaultStallSize;
                  }

                  handleHorseChange(idx, k, value);
                });
                handleHorseChange(idx, "selectedHorseId", selectedHorse._id);
              }}
              options={[{ value: "new", label: "New Horse" }, ...horseOptions]}
            />
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Registered Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse?.registeredName || ""}
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
                value={horse?.barnName || ""}
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

          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <Select
              value={horse?.breed || ""}
              onChange={(e) => handleHorseChange(idx, "breed", e.target.value)}
              options={breedsList.map((b) => ({ value: b, label: b }))}
            />
            {errors?.[`breed${idx}`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`breed${idx}`]}
              </p>
            )}
          </div>

          {horse?.breed === "Other Breed" && (
            <div>
              <label className="block font-semibold text-gray-600 mb-2">
                Enter Other Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse?.otherBreed || ""}
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

          <div className="flex flex-col md:flex-row gap-4">
            <ColorPicker
              value={horse?.colour}
              onChange={(val) => handleHorseChange(idx, "colour", val)}
              label="Colour"
              error={errors?.[`colour${idx}`]}
              options={colorOptions}
            />

            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse?.age || ""}
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

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-semibold text-gray-600 mb-2">
                Sex <span className="text-red-500">*</span>
              </label>
              <Select
                value={horse?.sex || ""}
                onChange={(e) => handleHorseChange(idx, "sex", e.target.value)}
                options={sexOptions.map((s) => ({ value: s, label: s }))}
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
                value={horse?.stallType || ""}
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

          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Additional Notes
            </label>
            <textarea
              value={horse?.notes || ""}
              onChange={(e) => handleHorseChange(idx, "notes", e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder={
                isEditMode
                  ? "Update this note. Previous notes will stay in the log."
                  : "Any additional information about this horse..."
              }
            />
            {horse?.notesLog?.length > 0 && (
              <p className="mt-1 text-xs font-medium text-gray-500">
                Existing notes are preserved chronologically when you update.
              </p>
            )}
          </div>

          {!isEditMode && horse?.selectedHorseId === "new" && (
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => handleSaveHorse(idx)}
                disabled={savingHorseIdx !== null}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#BF9B53] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#a7863e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingHorseIdx === idx ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving Horse...
                  </>
                ) : (
                  "Save Horse"
                )}
              </button>
            </div>
          )}
            </>
          )}
        </div>
      ))}

      {/* ✅ FIX 3: Show button ONLY when there are new unsaved horses (selectedHorseId === "new") */}
      {!isEditMode && hasNewUnsavedHorses && (
        <button
          onClick={handleSaveSelectedHorses}
          disabled={savingHorseIdx !== null}
          className="w-full py-3 bg-[#BF9B53] text-white font-bold rounded-md hover:bg-[#a7863e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {savingHorseIdx !== null ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            "Save Horses"
          )}
        </button>
      )}

      {/* UNSAVED HORSES MODAL */}
      {modalOpen && unsavedHorseIdxs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-sm w-full max-w-md p-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-black hover:text-[#BF9B53] text-2xl font-bold z-10"
            >
              ×
            </button>

            <h2 className="text-lg font-bold text-gray-800">
              Save Unsaved Horses
            </h2>

            {unsavedHorseIdxs.map((idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border-2 border-gray-200 rounded-sm"
              >
                <span className="font-semibold">
                  Horse {idx + 1} :{" "}
                  <span className="text-[#BF9B53]">
                    {horses[idx]?.registeredName || "Unnamed"}
                  </span>
                </span>
                <button
                  onClick={() => handleModalSave(idx)}
                  disabled={savingHorseIdx === idx}
                  className="px-4 py-2 bg-[#BF9B53] text-white rounded-sm hover:bg-[#a7863e] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingHorseIdx === idx ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving</span>
                    </>
                  ) : (
                    "Save"
                  )}
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
