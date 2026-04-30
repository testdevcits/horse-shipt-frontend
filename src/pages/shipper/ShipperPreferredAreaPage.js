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
  FiMap,
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

const allAreasMapContainerStyle = {
  width: "100%",
  height: "100%",
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
  if (
    latitude === "" ||
    longitude === "" ||
    latitude === null ||
    longitude === null ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return null;
  }

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

const fitMapToAreas = (map, areas = []) => {
  if (!map || !areas.length || !window.google?.maps) return;

  const bounds = new window.google.maps.LatLngBounds();
  let hasPoint = false;

  areas.forEach((area) => {
    const coords = getAreaCoords(area);
    if (!coords) return;

    const circle = new window.google.maps.Circle({
      center: coords,
      radius: getRadiusMeters(area.radiusKm),
    });

    const circleBounds = circle.getBounds();
    if (circleBounds) {
      bounds.union(circleBounds);
      hasPoint = true;
    }
  });

  if (hasPoint) {
    map.fitBounds(bounds, 32);
  }
};

const getPlaceLocationData = (place) => {
  if (!place?.geometry?.location) return null;

  const latitude = Number(place.geometry.location.lat().toFixed(6));
  const longitude = Number(place.geometry.location.lng().toFixed(6));

  return {
    locationName: place.formatted_address || place.name || "",
    latitude,
    longitude,
  };
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
    <div className="rounded-md border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-gray-100 bg-[#fcfaf5]">
        <div>
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="w-9 h-9 rounded-md bg-[#BF9B53]/10 flex items-center justify-center shrink-0">
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
    hasFetchedPreferredAreas,
    fetchPreferredAreas,
    addPreferredArea,
    removePreferredArea,
    updatePreferredArea,
    loading,
  } = useShipperPreferredArea();

  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllAreasModal, setShowAllAreasModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [visibleAreaIds, setVisibleAreaIds] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    areaId: null,
  });

  const autocompleteRef = useRef(null);
  const editAutocompleteRef = useRef(null);
  const addMapRef = useRef(null);
  const editMapRef = useRef(null);
  const allAreasMapRef = useRef(null);

  const isMaxReached = preferredAreas.length >= 4;
  const addCoords = getNumericCoords(form.latitude, form.longitude);
  const editCoords = getNumericCoords(editForm.latitude, editForm.longitude);
  const isFormOpen = showAddForm || Boolean(editingId);
  const editingArea = preferredAreas.find((area) => area._id === editingId);
  const selectedArea =
    preferredAreas.find((area) => area._id === selectedAreaId) ||
    preferredAreas[0] ||
    null;
  const visibleAreas = preferredAreas.filter((area) =>
    visibleAreaIds.includes(area._id)
  );

  const syncMapToCoords = useCallback((map, coords) => {
    if (!map || !coords) return;
    map.panTo(coords);
    map.setZoom(12);
  }, []);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    const placeData = getPlaceLocationData(place);
    if (!placeData) return;

    const nextCoords = {
      lat: placeData.latitude,
      lng: placeData.longitude,
    };

    setForm((prev) => ({
      ...prev,
      locationName: placeData.locationName || prev.locationName,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
    }));

    syncMapToCoords(addMapRef.current, nextCoords);
  }, [syncMapToCoords]);

  const onEditPlaceChanged = useCallback(() => {
    const place = editAutocompleteRef.current?.getPlace();
    const placeData = getPlaceLocationData(place);
    if (!placeData) return;

    const nextCoords = {
      lat: placeData.latitude,
      lng: placeData.longitude,
    };

    setEditForm((prev) => ({
      ...prev,
      locationName: placeData.locationName || prev.locationName,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
    }));

    syncMapToCoords(editMapRef.current, nextCoords);
  }, [syncMapToCoords]);

  const handleMarkerDragEnd = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(e.latLng.lat().toFixed(6)),
      longitude: Number(e.latLng.lng().toFixed(6)),
    }));
  }, []);

  const handleEditMarkerDragEnd = useCallback((e) => {
    setEditForm((prev) => ({
      ...prev,
      latitude: Number(e.latLng.lat().toFixed(6)),
      longitude: Number(e.latLng.lng().toFixed(6)),
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

  const handleOpenAllAreasModal = () => {
    if (!preferredAreas.length) return;
    setSelectedAreaId((prev) => prev || preferredAreas[0]._id);
    setVisibleAreaIds(preferredAreas.map((area) => area._id));
    setShowAllAreasModal(true);
  };

  const handleLoadPreferredAreas = async () => {
    await fetchPreferredAreas();
  };

  const handleCloseAllAreasModal = () => {
    setShowAllAreasModal(false);
  };

  const handleFocusArea = useCallback((area) => {
    if (!area) return;
    setSelectedAreaId(area._id);
    const coords = getAreaCoords(area);
    const map = allAreasMapRef.current;
    if (!map || !coords) return;

    map.panTo(coords);
    if ((map.getZoom?.() || 5) < 8) {
      map.setZoom(8);
    }
  }, []);

  const handleToggleAreaVisibility = useCallback((areaId) => {
    setVisibleAreaIds((prev) => {
      const isVisible = prev.includes(areaId);
      const next = isVisible
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId];

      if (isVisible && selectedAreaId === areaId) {
        const fallbackId = next[0] || null;
        setSelectedAreaId(fallbackId);
      }

      return next;
    });
  }, [selectedAreaId]);

  const handleShowAllAreas = useCallback(() => {
    const ids = preferredAreas.map((area) => area._id);
    setVisibleAreaIds(ids);
    setSelectedAreaId((prev) => prev || ids[0] || null);
    requestAnimationFrame(() => {
      fitMapToAreas(allAreasMapRef.current, preferredAreas);
    });
  }, [preferredAreas]);

  const handleFitVisibleAreas = useCallback(() => {
    fitMapToAreas(allAreasMapRef.current, visibleAreas);
  }, [visibleAreas]);

  React.useEffect(() => {
    if (!showAllAreasModal) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAllAreasModal]);

  return (
    <div className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-4 font-montserrat">
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

      {showAllAreasModal && (
        <div className="fixed inset-0 z-50 bg-black/50 p-2 sm:p-3">
          <div className="w-full h-full bg-white rounded-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-gray-200 bg-[#fcfaf5]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53]">
                  All Preferred Areas
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                  View All Areas In One Map
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Check areas to show or hide them. Select an area to focus the
                  map smoothly.
                </p>
              </div>
              <button
                onClick={handleCloseAllAreasModal}
                className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-[#fffdf8] overflow-y-auto p-2.5 sm:p-3">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={handleShowAllAreas}
                    className="flex-1 rounded-md border border-[#BF9B53] bg-[#BF9B53] px-3 py-2 text-xs font-bold text-white hover:bg-[#a8863e] transition"
                  >
                    Show All
                  </button>
                  <button
                    type="button"
                    onClick={handleFitVisibleAreas}
                    disabled={!visibleAreas.length}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Fit Selected
                  </button>
                </div>

                <div className="space-y-2">
                  {preferredAreas.map((area, idx) => {
                    const isActive = selectedArea?._id === area._id;
                    const isVisible = visibleAreaIds.includes(area._id);
                    return (
                      <div
                        key={area._id}
                        className={`w-full text-left rounded-md border px-3 py-2.5 transition ${
                          isActive
                            ? "border-[#BF9B53] bg-[#fff8ea] shadow-sm"
                            : "border-gray-200 bg-white hover:border-[#BF9B53]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <label
                            className="mt-2 flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() =>
                                handleToggleAreaVisibility(area._id)
                              }
                              className="h-4 w-4 accent-[#BF9B53]"
                            />
                          </label>
                          <div
                            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 font-bold text-sm ${
                              isActive
                                ? "bg-[#BF9B53] text-white"
                                : "bg-[#BF9B53]/10 text-[#BF9B53]"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFocusArea(area)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="text-sm font-bold text-gray-900 break-words">
                              {area.locationName || `Area ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Radius: {area.radiusKm} km
                            </p>
                            <p className="text-xs text-gray-400 mt-1 break-all">
                              {formatCoord(area.coordinates?.coordinates?.[1])},{" "}
                              {formatCoord(area.coordinates?.coordinates?.[0])}
                            </p>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-[340px] lg:min-h-0 p-2">
                <div className="w-full h-full rounded-md overflow-hidden border border-gray-200">
                  <GoogleMap
                    mapContainerStyle={allAreasMapContainerStyle}
                    center={getAreaCoords(selectedArea) || defaultCenter}
                    zoom={5}
                    onLoad={(map) => {
                      allAreasMapRef.current = map;
                      fitMapToAreas(map, visibleAreas.length ? visibleAreas : preferredAreas);
                    }}
                    options={mapOptions}
                  >
                    {visibleAreas.map((area, idx) => {
                      const coords = getAreaCoords(area);
                      if (!coords) return null;

                      const isActive = selectedArea?._id === area._id;

                      return (
                        <React.Fragment key={area._id}>
                          <Circle
                            center={coords}
                            radius={getRadiusMeters(area.radiusKm)}
                            options={{
                              ...radiusCircleOptions,
                              fillOpacity: isActive ? 0.22 : 0.12,
                              strokeWeight: isActive ? 3 : 2,
                            }}
                          />
                          <Marker
                            position={coords}
                            label={{
                              text: String(idx + 1),
                              color: isActive ? "#ffffff" : "#1f2937",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                            onClick={() => handleFocusArea(area)}
                          />
                        </React.Fragment>
                      );
                    })}
                  </GoogleMap>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="">
        <div className="">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53]">
                Coverage Setup
              </p>
              <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
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
                  className={`min-w-[68px] rounded-md border px-2.5 py-2.5 text-center transition-all ${
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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex-1 h-2 rounded-sm bg-gray-200 overflow-hidden min-w-[180px]">
              <div
                className="h-full rounded-sm bg-[#BF9B53] transition-all"
                style={{ width: `${(preferredAreas.length / 4) * 100}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              {preferredAreas.length} / 4 areas added
            </p>
          </div>

          {!isMaxReached && !isFormOpen && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleOpenAddForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md bg-[#BF9B53] hover:bg-[#a8863e] text-white text-sm font-bold transition"
              >
                <FiPlus size={15} />
                Add New Area
              </button>
              {!hasFetchedPreferredAreas && (
                <button
                  onClick={handleLoadPreferredAreas}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition disabled:opacity-60"
                >
                  <FiMap size={15} />
                  {loading ? "Loading..." : "Load Saved Areas"}
                </button>
              )}
              {hasFetchedPreferredAreas && preferredAreas.length > 0 && (
                <button
                  onClick={handleOpenAllAreasModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition"
                >
                  <FiMap size={15} />
                  See All Areas
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pt-3">
          {!isMaxReached && showAddForm ? (
            <form
              onSubmit={handleAdd}
              className="rounded-md border border-gray-200 bg-white p-3 sm:p-3.5 shadow-sm mb-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-[#BF9B53]/10 flex items-center justify-center shrink-0">
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

              <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-3 lg:gap-4">
                <div className="space-y-3">
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
                            latitude: "",
                            longitude: "",
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-[#efe4ce] bg-[#fffbf4] px-3 py-2.5">
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

                <div className="space-y-2.5">
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
                className="w-full mt-4 bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-bold transition flex items-center justify-center gap-2"
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
                className="w-full mt-2.5 border border-gray-300 text-gray-700 py-2.5 rounded-md text-sm font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </form>
          ) : isMaxReached ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
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
            <div className="p-3 sm:p-3.5 bg-[#fffdf8] rounded-md border border-gray-200 shadow-sm">
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
                  className="w-9 h-9 rounded-md bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-3 lg:gap-4">
                <div className="space-y-3">
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
                            latitude: "",
                            longitude: "",
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-[#efe4ce] bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold text-gray-700">
                      Coordinates are visible while editing so the user can
                      verify the exact saved point.
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

                <div className="space-y-2.5">
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

              <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loading || !editCoords}
                  className="flex-1 py-2.5 rounded-md bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
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
            {!hasFetchedPreferredAreas ? (
              <div className="text-center text-gray-400 text-sm py-10 border border-dashed border-gray-200 rounded-md bg-white">
                <FiMap size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-gray-700">
                  Saved preferred areas are not loaded yet
                </p>
                <p className="text-xs mt-1 mb-4">
                  This page will only fetch them when you ask for them.
                </p>
                <button
                  onClick={handleLoadPreferredAreas}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition disabled:opacity-60"
                >
                  <FiMap size={15} />
                  {loading ? "Loading..." : "Load Preferred Areas"}
                </button>
              </div>
            ) : preferredAreas.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10 border-2 border-dashed border-gray-200 rounded-md bg-white">
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
                      className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
                    >
                      {!isEditing ? (
                        <div className="p-3 sm:p-3.5">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-md bg-[#BF9B53]/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-sm font-bold text-[#BF9B53]">
                                  #{idx + 1}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-base font-bold text-gray-900 leading-tight break-words">
                                    {area.locationName || "Unnamed Location"}
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#BF9B53]/10 text-[#BF9B53] px-2.5 py-1 rounded-md">
                                    <MdRadar size={12} />
                                    {area.radiusKm} km radius
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                  <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                      Latitude
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                      {formatCoord(
                                        area.coordinates?.coordinates?.[1]
                                      )}
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2">
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

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-[132px]">
                              <button
                                onClick={() => handleStartEdit(area)}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-gray-900 hover:bg-blue-600 text-white text-sm font-semibold transition"
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
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition border border-red-100"
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>

                          {areaCoords && (
                            <div className="mt-3 rounded-md overflow-hidden border border-gray-200">
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
                        <div className="p-3 sm:p-3.5 bg-[#fffdf8]">
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
                              className="w-9 h-9 rounded-md bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            >
                              <FiX size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-3 lg:gap-4">
                            <div className="space-y-3">
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53]"
                                  />
                                </div>
                              </div>

                              <div className="rounded-md border border-[#efe4ce] bg-white px-3 py-2.5">
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

                            <div className="space-y-2.5">
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
                                and longitude manually, or drag the marker to
                                the exact point.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={loading || !editCoords}
                              className="flex-1 py-2.5 rounded-md bg-[#BF9B53] hover:bg-[#a8863e] disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
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
