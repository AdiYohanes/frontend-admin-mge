/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  FireIcon,
  PuzzlePieceIcon,
  CakeIcon,
  BeakerIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
// Impor hook yang benar dari API slice
import { useGetPopularityStatsDataQuery } from "../api/dashboardApiSlice";

const PopularityStats = () => {
  // 1. Panggil hook TANPA argumen untuk mendapatkan seluruh data popularitas
  const { data, isLoading } = useGetPopularityStatsDataQuery();

  // 2. State filter lokal tetap ada untuk mengontrol UI
  const [period, setPeriod] = useState("monthly");
  const [trendCategory, setTrendCategory] = useState("rental");

  // 3. Logika untuk MEMILIH data berdasarkan state lokal
  const mostPopular = data?.mostPopular?.[period] || {};
  const trendingData = data?.trending?.[trendCategory]?.[period] || [];

  const maxTrendValue = trendingData.length > 0 ? trendingData[0].value : 1;

  const icons = {
    unit: <FireIcon className="h-8 w-8 text-red-500" />,
    game: <PuzzlePieceIcon className="h-8 w-8 text-blue-500" />,
    food: <CakeIcon className="h-8 w-8 text-yellow-500" />,
    drink: <BeakerIcon className="h-8 w-8 text-green-500" />,
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body flex justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Popularity & Trending</h2>
          <select
            className="select select-bordered select-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
          {/* Bagian Most Popular */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Most Popular</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mostPopular).map(([key, value]) => (
                <div key={key} className="bg-base-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-1">
                    {icons[key]}
                    <span className="font-bold capitalize text-md">{key}</span>
                  </div>
                  <p className="text-lg font-semibold text-primary truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian What's Trending */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">What's Trending (Top 5)</h3>
              <select
                className="select select-bordered select-sm"
                value={trendCategory}
                onChange={(e) => setTrendCategory(e.target.value)}
              >
                <option value="rental">Rental Unit</option>
                <option value="foodDrink">Food & Drink</option>
              </select>
            </div>

            <div className="w-full space-y-3">
              {trendingData.length > 0 ? (
                trendingData.slice(0, 5).map((item, index) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      index === 0 ? "bg-amber-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 ? (
                        <TrophyIcon className="h-6 w-6 text-amber-500" />
                      ) : (
                        <span className="font-bold text-gray-400 w-6 text-center">
                          {index + 1}
                        </span>
                      )}
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <span className="font-bold text-sm text-gray-700">
                      {item.value.toLocaleString("id-ID")} orders
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-48 text-gray-500">
                  Tidak ada data trending.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularityStats;
