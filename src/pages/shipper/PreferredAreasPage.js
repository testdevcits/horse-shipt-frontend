import React, { useState } from "react";
import { Search } from "lucide-react";
import Toast from "../../components/common/Toast";
import { useShipperPreferredAreas } from "../../contexts/ShipperPreferredAreaContext";
import citiesData from "../../data/cities"; // 👈 import your dataset

const PreferredAreas = () => {
  const { addPreferredArea, loading } = useShipperPreferredAreas();

  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [radius, setRadius] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Handle country select
  const handleSelectCountry = (region) => {
    setCountry(region);
    setSearch("");
    setFilteredCities([]);
    setSelectedCity(null);
  };

  // Handle search
  const handleSearchChange = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setFilteredCities([]);
      return;
    }

    // filter cities by country and search query
    const matches = citiesData
      .filter(
        (c) =>
          c.country?.toLowerCase() === country &&
          c.city.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 15); // limit to 15 results
    setFilteredCities(matches);
  };

  // Save Preferred Area
  const handleSave = async () => {
    if (!selectedCity || !radius) {
      setToast({
        show: true,
        message: "Please select city and enter radius",
        type: "error",
      });
      return;
    }

    const res = await addPreferredArea({
      country: selectedCity.country,
      city: selectedCity.city,
      province: selectedCity.province_name,
      latitude: selectedCity.lat,
      longitude: selectedCity.lng,
      radiusMiles: Number(radius),
    });

    setToast({
      show: true,
      message: res.success
        ? "Preferred area saved successfully"
        : "Failed to save area",
      type: res.success ? "success" : "error",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false })}
        />
      )}

      <h2 className="text-xl font-semibold text-gray-800">Preferred Area</h2>

      {/* Select Region */}
      <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Select your active region
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleSelectCountry("canada")}
            className={`flex-1 py-3 rounded-lg border text-center font-medium ${
              country === "canada"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:border-blue-400"
            }`}
          >
            Canada
          </button>
          <button
            onClick={() => handleSelectCountry("usa")}
            className={`flex-1 py-3 rounded-lg border text-center font-medium ${
              country === "usa"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:border-blue-400"
            }`}
          >
            United States
          </button>
        </div>
      </div>

      {/* City Search */}
      {country && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">
            Search for a city in{" "}
            {country === "canada" ? "Canada" : "United States"}
          </h3>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Type city name..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-500 w-5 h-5" />

            {filteredCities.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
                {filteredCities.map((city) => (
                  <li
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city);
                      setSearch(city.city);
                      setFilteredCities([]);
                    }}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {city.city}, {city.province_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedCity && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  Selected:{" "}
                  <span className="font-medium">
                    {selectedCity.city}, {selectedCity.province_name}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Lat: {selectedCity.lat}, Lng: {selectedCity.lng}
                </p>
              </div>

              <p className="text-sm text-gray-700">
                Specify the distance range from your route to receive
                opportunities. This feature lets you see nearby opportunities in
                case you have available space in your trailer.
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Up to</span>
                <input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  placeholder="500"
                  className="w-24 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">miles</span>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreferredAreas;
