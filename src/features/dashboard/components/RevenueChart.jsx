import React, { useState } from "react";
import { useGetRevenueChartDataQuery } from "../api/dashboardApiSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart, // Impor AreaChart jika ingin gradien
  Area, // Impor Area jika ingin gradien
} from "recharts";

const formatYAxis = (tick) => {
  if (tick >= 1000000) {
    return `${tick / 1000000} Jt`;
  }
  if (tick >= 1000) {
    return `${tick / 1000} Rb`;
  }
  return tick;
};

const RevenueChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading } = useGetRevenueChartDataQuery({ period });

  const filterOptions = ["daily", "weekly", "monthly"];

  if (isLoading)
    return (
      <div className="card bg-base-100 shadow-md h-96 flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h2 className="card-title">Revenue Chart</h2>

          {/* Filter UI */}
          <div className="hidden md:flex tabs tabs-boxed bg-base-200 p-1">
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
          <div className="md:hidden">
            <select
              className="select select-bordered select-sm w-full max-w-xs"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!data || data.length === 0 ? (
          <div className="flex-grow flex justify-center items-center">
            <p className="text-gray-500">Tidak ada data untuk ditampilkan.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {/* Kita gunakan LineChart sebagai pembungkus utama */}
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              {/* --- PERUBAHAN 1: Definisi Gradien Baru --- */}
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B99733" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#B99733" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(5px)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(value)
                }
              />
              <Legend />

              {/* --- PERUBAHAN 2: Penambahan Komponen <Area> untuk gradien --- */}
              <Area
                type="monotone"
                dataKey="Pemasukan"
                stroke="none"
                fill="url(#colorRevenue)"
              />

              {/* --- PERUBAHAN 3: Perubahan Warna Garis <Line> --- */}
              <Line
                type="monotone"
                dataKey="Pemasukan"
                stroke="#B99733"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
