import React, { useState, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useGetWhatsTrendingDataQuery } from "../api/dashboardApiSlice";
import {
  BuildingOfficeIcon,
  PuzzlePieceIcon,
  CakeIcon,
  BeakerIcon,
} from "@heroicons/react/24/solid";

// Komponen helper untuk memilih ikon berdasarkan 'type'
const IconSelector = ({ type }) => {
  const iconProps = { className: "h-6 w-6 text-white" };
  switch (type) {
    case "unit":
      return <BuildingOfficeIcon {...iconProps} />;
    case "game":
      return <PuzzlePieceIcon {...iconProps} />;
    case "food":
      return <CakeIcon {...iconProps} />;
    case "drink":
      return <BeakerIcon {...iconProps} />;
    default:
      return null;
  }
};

const WhatsTrending = ({ sharedPeriod, onPeriodChange }) => {
  const period = sharedPeriod || "daily";
  const [filter, setFilter] = useState("rental");

  const { data, isLoading, isError } = useGetWhatsTrendingDataQuery({
    period,
  }, {
    skip: !period, // Skip query if period is not defined
  });

  const trendingItems = useMemo(() => {
    if (!data) return [];

    // Buat salinan array sebelum mengurutkannya
    const dataToFilter = data[filter] || [];
    return [...dataToFilter].sort((a, b) => b.totalOrders - a.totalOrders);
  }, [data, filter]);

  const filterOptions = [
    { value: "rental", label: "Rental" },
    { value: "fnb", label: "FnB" },
  ];

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md h-full flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card bg-base-100 shadow-md h-full flex justify-center items-center">
        <p className="text-error text-sm">Gagal memuat data.</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md h-full min-h-[300px]">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">What's Trending</h2>

          {/* Category Filter */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm">
              {filterOptions.find(opt => opt.value === filter)?.label}
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
            >
              {filterOptions.map((option) => (
                <li key={option.value}>
                  <a
                    onClick={() => setFilter(option.value)}
                    className={filter === option.value ? "active" : ""}
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-full overflow-y-auto pr-2 space-y-3">
          {trendingItems.length > 0 ? (
            trendingItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-base-content/30 w-6">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-base-content">{item.name}</p>
                </div>
                <div className="font-bold text-brand-gold">
                  {item.totalOrders}{" "}
                  <span className="text-sm font-normal text-base-content/60">
                    {filter === "rental" ? "bookings" : "orders"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Tidak ada data trending.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsTrending;
