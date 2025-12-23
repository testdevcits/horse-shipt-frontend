import React, { useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="flex flex-col w-full ">
      {/* Header + Search + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 flex-shrink-0">
          New Opportunities for you
        </h1>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities"
              className="w-full border border-gray-400 rounded-md pl-10 pr-3 py-2
                   focus:outline-none focus:ring-1 focus:ring-system-primary font-montserrat"
            />
          </div>

          {/* Tabs - Button Group */}
          <div className="flex border border-gray-400 rounded-lg overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm sm:text-base ${
                activeTab === "map"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700"
              }`}
              style={{ borderRight: "1px solid #D1D5DB" }}
            >
              <CiMap size={20} />
              Map
            </button>

            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm sm:text-base ${
                activeTab === "list"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              <IoList size={20} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 border rounded-md p-4 w-full flex-1 min-h-[400px] bg-white overflow-auto">
        {activeTab === "map" && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-600 text-lg">
              Map view content goes here...
            </p>
          </div>
        )}
        {activeTab === "list" && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-600 text-lg">
              List view content goes here...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOpportunities;
