import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetPeakTimeDataQuery } from "../api/dashboardApiSlice"; // <-- Gunakan hook baru

const PeakTimeChart = () => {
  const [period, setPeriod] = useState("daily"); // State filter lokal
  const { data, isLoading } = useGetPeakTimeDataQuery({ period }); // Panggil API sendiri

  if (isLoading)
    return (
      <div className="card bg-base-100 shadow-md h-96 flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Peak Time</h2>
          {/* UI FILTER BARU */}
          {/* --- BLOK FILTER RESPONSIVE --- */}
          {/* TABS untuk Desktop (tersembunyi di mobile) */}
          <div className="hidden md:flex tabs tabs-boxed bg-base-200 p-1">
            <a
              className={`tab tab-sm ${period === "daily" ? "tab-active" : ""}`}
              onClick={() => setPeriod("daily")}
            >
              Daily
            </a>
            <a
              className={`tab tab-sm ${
                period === "weekly" ? "tab-active" : ""
              }`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </a>
            <a
              className={`tab tab-sm ${
                period === "monthly" ? "tab-active" : ""
              }`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </a>
          </div>
          {/* DROPDOWN untuk Mobile (tersembunyi di desktop) */}
          <div className="md:hidden">
            <select
              className="select select-bordered select-sm w-full max-w-xs"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {/* --- AKHIR BLOK FILTER --- */}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorBookings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PeakTimeChart;
