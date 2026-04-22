import React, { useState, useRef, useCallback } from "react";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { useShipperPreferredArea } from "../../contexts/shipperContext/ShipperPreferredAreaContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  FiTrash2,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { MdRadar } from "react-icons/md";

const mapContainerStyle = {
  width: "100%",
  height: "260px",
};

const savedAreaMapContainerStyle = {
  width: "100%",
  height: "220px",
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const defaultForm = {
  locationName: "",
  latitude: "",
  longitude: "",
  radiusKm: 50,
};

const getNumericCoords = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
};

const getAreaCoords = (area) => {
  const lat = area?.coordinates?.coordinates?.[1];
  const lng = area?.coordinates?.coordinates?.[0];
  return getNumericCoords(lat, lng);
};

const formatCoord = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : "--";
};

const mapOptions = {
  mapId: process.env.REACT_APP_GOOGLE_MAP_ID || "",
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

const getRadiusMeters = (radiusKm) => {
  const value = Number(radiusKm);
  return Number.isFinite(value) ? value * 1000 : 0;
};

const radiusCircleOptions = {
  fillColor: "#BF9B53",
  fillOpacity: 0.18,
  strokeColor: "#BF9B53",
  strokeOpacity: 0.9,
  strokeWeight: 2,
};

const fitMapToRadius = (map, coords, radiusKm) => {
  if (!map || !coords || !window.google?.maps) return;

  const circle = new window.google.maps.Circle({
    center: coords,
    radius: getRadiusMeters(radiusKm),
  });

  const bounds = circle.getBounds();
  if (bounds) {
    map.fitBounds(bounds, 24);
  }
};

const LocationMapCard = ({
  title,
  description,
  coords,
  radiusKm,
  mapRef,
  onMarkerDragEnd,
}) => {
  React.useEffect(() => {
    fitMapToRadius(mapRef.current, coords, radiusKm);
  }, [coords, radiusKm, mapRef]);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-gray-100 bg-[#fcfaf5]">
        <div>
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#BF9B53]/10 flex items-center justify-center shrink-0">
          <FiMapPin size={16} className="text-[#BF9B53]" />
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coords || defaultCenter}
        zoom={coords ? 12 : 4}
        onLoad={(map) => {
          mapRef.current = map;
          fitMapToRadius(map, coords, radiusKm);
        }}
        options={mapOptions}
      >
        {coords && (
          <>
            <Circle
              center={coords}
              radius={getRadiusMeters(radiusKm)}
              options={radiusCircleOptions}
            />
            <Marker
              position={coords}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
};

const ShipperPreferredAreaPage = () => {
  const {
    preferredAreas,
    addPreferredArea,
    removePreferredArea,
    updatePreferredArea,
    loading,
  } = useShipperPreferredArea();

  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    areaId: null,
  });

  const autocompleteRef = useRef(null);
  const editAutocompleteRef = useRef(null);
  const addMapRef = useRef(null);
  const editMapRef = useRef(null);

  const isMaxReached = preferredAreas.length >= 4;
  const addCoords = getNumericCoords(form.latitude, form.longitude);
  const editCoords = getNumericCoords(editForm.latitude, editForm.longitude);
  const isFormOpen = showAddForm || Boolean(editingId);
  const editingArea = preferredAreas.find((area) => area._id === editingId);

  const syncMapToCoords = useCallback((map, coords) => {
    if (!map || !coords) return;
    map.panTo(coords);
    map.setZoom(12);
  }, []);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();
    const nextCoords = { lat: latitude, lng: longitude };

    setForm((prev) => ({
      ...prev,
      locationName: place.formatted_address || prev.locationName,
      latitude,
      longitude,
    }));

    syncMapToCoords(addMapRef.current, nextCoords);
  }, [syncMapToCoords]);

  const onEditPlaceChanged = useCallback(() => {
    const place = editAutocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();
    const nextCoords = { lat: latitude, lng: longitude };

    setEditForm((prev) => ({
      ...prev,
      locationName: place.formatted_address || prev.locationName,
      latitude,
      longitude,
    }));

    syncMapToCoords(editMapRef.current, nextCoords);
  }, [syncMapToCoords]);

  const handleMarkerDragEnd = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    }));
  }, []);

  const handleEditMarkerDragEnd = useCallback((e) => {
    setEditForm((prev) => ({
      ...prev,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    }));
  }, []);

  const handleCoordinateInput = useCallback(
    (key, value, mode = "add") => {
      const updater = mode === "edit" ? setEditForm : setForm;
      const targetMap =
        mode === "edit" ? editMapRef.current : addMapRef.current;

      updater((prev) => {
        const next = { ...prev, [key]: value };
        const coords = getNumericCoords(next.latitude, next.longitude);
        if (coords) {
          syncMapToCoords(targetMap, coords);
        }
        return next;
      });
    },
    [syncMapToCoords]
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isMaxReached || !addCoords) return;

    await addPreferredArea({
      locationName: form.locationName,
      latitude: addCoords.lat,
      longitude: addCoords.lng,
      radiusKm: parseFloat(form.radiusKm),
    });

    setForm(defaultForm);
    setShowAddForm(false);
  };

  const handleStartEdit = (area) => {
    setConfirmModal({ open: false, areaId: null });
    setShowAddForm(false);
    setEditingId(area._id);
    setEditForm({
      locationName: area.locationName || "",
      latitude: area.coordinates?.coordinates?.[1] || "",
      longitude: area.coordinates?.coordinates?.[0] || "",
      radiusKm: area.radiusKm || 50,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(defaultForm);
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setEditForm(defaultForm);
    setForm(defaultForm);
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setForm(defaultForm);
    setShowAddForm(false);
  };

  const handleSaveEdit = async () => {
    const coords = getNumericCoords(editForm.latitude, editForm.longitude);
    if (!editingId || !coords) return;

    await updatePreferredArea(editingId, {
      locationName: editForm.locationName,
      latitude: coords.lat,
      longitude: coords.lng,
      radiusKm: parseFloat(editForm.radiusKm),
    });

    handleCancelEdit();
  };

  const handleDelete = async (id) => {
    await removePreferredArea(id);
    setConfirmModal({ open: false, areaId: null });
  };

  return (
    <div className="w-full px-2 sm:px-3 lg:px-5 py-3 sm:py-5 font-montserrat">
      {confirmModal.open && (
        <ConfirmModal
          show={confirmModal.open}
          title="Delete Preferred Area"
          message="Are you sure you want to delete this preferred area? This action cannot be undone."
          onConfirm={() => handleDelete(confirmModal.areaId)}
          onCancel={() => setConfirmModal({ open: false, areaId: null })}
          confirmText="Delete"
          confirmColor="red"
        />
      )}

      <div className="">
        <div className="">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53]">
                Coverage Setup
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                Preferred Areas
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                Add up to 4 service areas, edit them clearly, and adjust the
                exact pin on the map when you need better precision.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`min-w-[72px] rounded-2xl border px-3 py-3 text-center transition-all ${
                    i < preferredAreas.length
                      ? "bg-[#BF9B53] border-[#BF9B53] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  <p className="text-lg font-bold leading-none">{i + 1}</p>
                  <p className="text-[11px] mt-1 font-semibold uppercase tracking-wide">
                    {i < preferredAreas.length ? "Filled" : "Open"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden min-w-[180px]">
              <div
                className="h-full rounded-full bg-[#BF9B53] transition-all"
                style={{ width: `${(preferredAreas.length / 4) * 100}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              {preferredAreas.length} / 4 areas added
            </p>
          </div>

          {!isMaxReached && !isFormOpen && (
            <div className="mt-4">
              <button
                onClick={handleOpenAddForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#BF9B53] hover:bg-[#a8863e] text-white text-sm font-bold transition"
              >
                <FiPlus size={15} />
                Add New Area
              </button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 lg:p-5">
          {!isMaxReached && showAddForm ? (
            <form
              onSubmit={handleAdd}
              className="rounded-[22px] border border-gray-200 bg-white p-3 sm:p-4 shadow-sm mb-4 sm:mb-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-[#BF9B53]/10 flex items-center justify-center shrink-0">
                  <FiPlus size={18} className="text-[#BF9B53]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Add New Area
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Search a location, then fine-tune it on the map if needed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4 lg:gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                      Location Search
                    </label>
                    <Autocomplete
                      onLoad={(auto) => (autocompleteRef.current = auto)}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search location (e.g. Dallas, TX)"
                        value={form.locationName}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            locationName: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                        required
                      />
                    </Autocomplete>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={form.latitude}
                        placeholder="Enter or choose on map"
                        onChange={(e) =>
                          handleCoordinateInput(
                            "latitude",
                            e.target.value,
                            "add"
                          )
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={form.longitude}
                        placeholder="Enter or choose on map"
                        onChange={(e) =>
                          handleCoordinateInput(
                            "longitude",
                            e.target.value,
                            "add"
                          )
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#efe4ce] bg-[#fffbf4] px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">
                      Exact coordinates stay visible here so the user can verify
                      the point before saving.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Current Latitude
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          {formatCoord(form.latitude)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Current Longitude
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          {formatCoord(form.longitude)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Radius
                      </label>
                      <span className="text-sm font-bold text-[#BF9B53]">
                        {form.radiusKm} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={form.radiusKm}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          radiusKm: e.target.value,
                        }))
                      }
                      className="w-full accent-[#BF9B53]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10 km</span>
                      <span>200 km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <LocationMapCard
                    title="Map Preview"
                    description={
                      addCoords
                        ? `Coverage circle shows ${form.radiusKm} km around this point. Drag the marker to set the exact location.`
                        : "Search a location or enter coordinates to place the marker."
                    }
                    coords={addCoords}
                    radiusKm={form.radiusKm}
                    mapRef={addMapRef}
                    onMarkerDragEnd={handleMarkerDragEnd}
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tip: if the searched location is close but not perfect, drag
                    the marker to the exact barn, stable, or operating point.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !addCoords}
                className="w-full mt-5 bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Adding Area...
                  </>
                ) : (
                  <>
                    <FiPlus size={15} />
                    Save Preferred Area
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelAdd}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </form>
          ) : isMaxReached ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <MdRadar size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Maximum reached
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  You already have 4 preferred areas. Delete one area to add a
                  new one.
                </p>
              </div>
            </div>
          ) : null}

          {editingId && editingArea && (
            <div className="p-3 sm:p-4 bg-[#fffdf8] rounded-[22px] border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53]">
                    Editing Preferred Area
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    Update location and radius
                  </h3>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4 lg:gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                      Location Search
                    </label>
                    <Autocomplete
                      onLoad={(auto) => (editAutocompleteRef.current = auto)}
                      onPlaceChanged={onEditPlaceChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search new location"
                        value={editForm.locationName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            locationName: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </Autocomplete>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.latitude}
                        placeholder="Enter or drag marker"
                        onChange={(e) =>
                          handleCoordinateInput("latitude", e.target.value, "edit")
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.longitude}
                        placeholder="Enter or drag marker"
                        onChange={(e) =>
                          handleCoordinateInput("longitude", e.target.value, "edit")
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#efe4ce] bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">
                      Coordinates are visible while editing so the user can verify
                      the exact saved point.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Latitude
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          {formatCoord(editForm.latitude)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Longitude
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          {formatCoord(editForm.longitude)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Radius
                      </label>
                      <span className="text-sm font-bold text-[#BF9B53]">
                        {editForm.radiusKm} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={editForm.radiusKm}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          radiusKm: e.target.value,
                        }))
                      }
                      className="w-full accent-[#BF9B53]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10 km</span>
                      <span>200 km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <LocationMapCard
                    title="Adjust Exact Location"
                    description={
                      editCoords
                        ? `Coverage circle shows ${editForm.radiusKm} km around this point. Drag the marker to update the exact saved location.`
                        : "Search the place or fill latitude and longitude to place the marker."
                    }
                    coords={editCoords}
                    radiusKm={editForm.radiusKm}
                    mapRef={editMapRef}
                    onMarkerDragEnd={handleEditMarkerDragEnd}
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    You can update the address search, type latitude and
                    longitude manually, or drag the marker to the exact point.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-5">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loading || !editCoords}
                  className="flex-1 py-3 rounded-xl bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
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
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FiCheck size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!showAddForm && !editingId && (
            <div className="space-y-3">
            {preferredAreas.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <FiMapPin size={26} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-gray-600">
                  No preferred areas yet
                </p>
                <p className="text-xs mt-1">
                  Add your first service area above.
                </p>
              </div>
            ) : (
              preferredAreas.map((area, idx) => {
                const areaCoords = getAreaCoords(area);
                const isEditing = editingId === area._id;

                return (
                  <div
                    key={area._id}
                    className="bg-white border border-gray-200 rounded-[22px] shadow-sm overflow-hidden"
                  >
                    {!isEditing ? (
                      <div className="p-3 sm:p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-[#BF9B53]/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-sm font-bold text-[#BF9B53]">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-bold text-gray-900 leading-tight break-words">
                                  {area.locationName || "Unnamed Location"}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#BF9B53]/10 text-[#BF9B53] px-2.5 py-1 rounded-full">
                                  <MdRadar size={12} />
                                  {area.radiusKm} km radius
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                                  <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                    Latitude
                                  </p>
                                  <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {formatCoord(
                                      area.coordinates?.coordinates?.[1]
                                    )}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                                  <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                    Longitude
                                  </p>
                                  <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {formatCoord(
                                      area.coordinates?.coordinates?.[0]
                                    )}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5 break-all">
                                <FiMapPin size={12} className="shrink-0" />
                                Exact saved point for this preferred area
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-[142px]">
                            <button
                              onClick={() => handleStartEdit(area)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-blue-600 text-white text-sm font-semibold transition"
                              title="Edit"
                            >
                              <FiEdit2 size={14} />
                              Edit Area
                            </button>

                            <button
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  areaId: area._id,
                                })
                              }
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition border border-red-100"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>

                        {areaCoords && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                            <GoogleMap
                              mapContainerStyle={savedAreaMapContainerStyle}
                              center={areaCoords}
                              zoom={11}
                              onLoad={(map) =>
                                fitMapToRadius(map, areaCoords, area.radiusKm)
                              }
                              options={mapOptions}
                            >
                              <Circle
                                center={areaCoords}
                                radius={getRadiusMeters(area.radiusKm)}
                                options={radiusCircleOptions}
                              />
                              <Marker position={areaCoords} />
                            </GoogleMap>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-[#fffdf8]">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53]">
                              Editing Area #{idx + 1}
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 mt-1">
                              Update location and radius
                            </h3>
                          </div>
                          <button
                            onClick={handleCancelEdit}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                          >
                            <FiX size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4 lg:gap-5">
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                                Location Search
                              </label>
                              <Autocomplete
                                onLoad={(auto) =>
                                  (editAutocompleteRef.current = auto)
                                }
                                onPlaceChanged={onEditPlaceChanged}
                              >
                                <input
                                  type="text"
                                  placeholder="Search new location"
                                  value={editForm.locationName}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      locationName: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                                />
                              </Autocomplete>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                                  Latitude
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={editForm.latitude}
                                  placeholder="Enter or drag marker"
                                  onChange={(e) =>
                                    handleCoordinateInput(
                                      "latitude",
                                      e.target.value,
                                      "edit"
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">
                                  Longitude
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={editForm.longitude}
                                  placeholder="Enter or drag marker"
                                  onChange={(e) =>
                                    handleCoordinateInput(
                                      "longitude",
                                      e.target.value,
                                      "edit"
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                                />
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#efe4ce] bg-white px-4 py-3">
                              <p className="text-xs font-semibold text-gray-700">
                                Coordinates are visible while editing so the
                                user can verify the exact saved point.
                              </p>
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                    Latitude
                                  </p>
                                  <p className="text-sm font-bold text-gray-800 mt-1">
                                    {formatCoord(editForm.latitude)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                    Longitude
                                  </p>
                                  <p className="text-sm font-bold text-gray-800 mt-1">
                                    {formatCoord(editForm.longitude)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Radius
                                </label>
                                <span className="text-sm font-bold text-[#BF9B53]">
                                  {editForm.radiusKm} km
                                </span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="200"
                                step="5"
                                value={editForm.radiusKm}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    radiusKm: e.target.value,
                                  }))
                                }
                                className="w-full accent-[#BF9B53]"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>10 km</span>
                                <span>200 km</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <LocationMapCard
                              title="Adjust Exact Location"
                              description={
                                editCoords
                                  ? `Coverage circle shows ${editForm.radiusKm} km around this point. Drag the marker to update the exact saved location.`
                                  : "Search the place or fill latitude and longitude to place the marker."
                              }
                              coords={editCoords}
                              radiusKm={editForm.radiusKm}
                              mapRef={editMapRef}
                              onMarkerDragEnd={handleEditMarkerDragEnd}
                            />
                            <p className="text-xs text-gray-500 leading-relaxed">
                              You can update the address search, type latitude
                              and longitude manually, or drag the marker to the
                              exact point.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-5">
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={loading || !editCoords}
                            className="flex-1 py-3 rounded-xl bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <svg
                                  className="animate-spin w-4 h-4"
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
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                                Saving Changes...
                              </>
                            ) : (
                              <>
                                <FiCheck size={14} />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipperPreferredAreaPage;
