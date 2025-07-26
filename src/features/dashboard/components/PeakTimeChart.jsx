import React, { useState } from "react";
import { useGetPeakTimeDataQuery } from "../api/dashboardApiSlice";
// Impor komponen yang relevan, LineChart tidak lagi dominan
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PeakTimeChart = () => {
  const [period, setPeriod] = useState("daily");
  const { data, isLoading } = useGetPeakTimeDataQuery({ period });

  const filterOptions = ["daily", "weekly", "monthly"];

  // Generate empty data structure based on period
  const getEmptyData = () => {
    switch (period) {
      case "daily":
        return [
          { time: "00:00", bookings: 0 },
          { time: "06:00", bookings: 0 },
          { time: "12:00", bookings: 0 },
          { time: "18:00", bookings: 0 },
          { time: "24:00", bookings: 0 },
        ];
      case "weekly":
        return [
          { time: "Mon", bookings: 0 },
          { time: "Tue", bookings: 0 },
          { time: "Wed", bookings: 0 },
          { time: "Thu", bookings: 0 },
          { time: "Fri", bookings: 0 },
          { time: "Sat", bookings: 0 },
          { time: "Sun", bookings: 0 },
        ];
      case "monthly":
        return [
          { time: "Week 1", bookings: 0 },
          { time: "Week 2", bookings: 0 },
          { time: "Week 3", bookings: 0 },
          { time: "Week 4", bookings: 0 },
        ];
      default:
        return [];
    }
  };

  // --- FUNGSI RENDER DISEMPURNAKAN UNTUK SELALU MENGGUNAKAN BAR CHART ---
  const renderChart = () => {
    // Selalu gunakan data yang ada atau empty data
    const chartData = data && data.length > 0 ? data : getEmptyData();

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
          <Tooltip
            cursor={{ fill: "rgba(185, 151, 51, 0.1)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(5px)",
              borderRadius: "0.5rem",
            }}
          />
          <Bar
            dataKey="bookings"
            fill="#B99733"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="card-title">Peak Time</h2>
          <div className="tabs tabs-boxed bg-base-200 p-1">
            {filterOptions.map((opt) => (
              <a
                key={opt}
                className={`tab tab-sm ${period === opt ? "tab-active" : ""}`}
                onClick={() => setPeriod(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </a>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-grow flex justify-center items-center">
            <span className="loading loading-spinner"></span>
          </div>
        ) : (
          <div className="flex-grow">
            {renderChart()}
            {(!data || data.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm bg-white/80 px-3 py-1 rounded-full">
                  Tidak ada data untuk periode ini
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeakTimeChart;
