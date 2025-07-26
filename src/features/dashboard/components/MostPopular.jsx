import React, { useState } from "react";
// Impor semua ikon yang kita butuhkan
import {
  BuildingOfficeIcon,
  PuzzlePieceIcon,
  CakeIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";
import { useGetMostPopularDataQuery } from "../api/dashboardApiSlice";

// Komponen helper untuk memilih dan merender ikon berdasarkan 'type'
const IconSelector = ({ type }) => {
  const iconProps = { className: "h-6 w-6 text-white" };
  switch (type) {
    case "unit":
      return <BuildingOfficeIcon {...iconProps} />;
    case "game":
      return <PuzzlePieceIcon {...iconProps} />;
    case "food":
    case "drink":
      return <CakeIcon {...iconProps} />;
    case "console":
      return <ComputerDesktopIcon {...iconProps} />;
    default:
      return null;
  }
};

const MostPopular = ({ sharedPeriod, onPeriodChange }) => {
  const period = sharedPeriod || "daily";

  // Panggil hook API dengan filter yang aktif
  const { data, isLoading, isError } = useGetMostPopularDataQuery({
    period,
  }, {
    skip: !period, // Skip query if period is not defined
  });

  return (
    <div className="card bg-base-100 shadow-md h-full">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="card-title">Most Popular</h2>
        </div>

        {/* Data Most Popular: vertical column */}
        <div className="mt-4 flex flex-col gap-4 overflow-y-auto pr-2 flex-grow">
          {isLoading ? (
            // Tampilkan skeleton loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-48 min-w-[12rem]"></div>
            ))
          ) : isError ? (
            <div className="text-center py-10 text-error min-w-full">
              Gagal memuat data.
            </div>
          ) : data && data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                className="flex items-center min-w-[12rem] p-4 bg-base-200/60 rounded-xl shadow-sm"
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}
                >
                  <IconSelector type={item.type} />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-base-content">{item.name}</h3>
                  <p className="text-sm text-base-content/60">
                    {item.category}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 min-w-full">
              Tidak ada data popularitas untuk periode ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MostPopular;
