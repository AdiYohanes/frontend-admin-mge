
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useGetOrderSummaryDataQuery } from "../api/dashboardApiSlice";

const periodOptions = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

const OrderSummaryChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading, isError } = useGetOrderSummaryDataQuery({ period });

  // Handle error state
  if (isError || data?.type === "error") {
    return (
      <div className="card bg-base-100 shadow-md h-full">
        <div className="card-body items-center justify-center">
          <div className="text-error text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm">Gagal memuat data</p>
          </div>
        </div>
      </div>
    );
  }

  // Use chart data from API response
  const chartData = data?.data || [];

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md h-full">
        <div className="card-body items-center justify-center">
          <span className="loading loading-spinner"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md h-full">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="card-title flex-shrink-0">Order Summary</h2>
            {data?.current_month && (
              <p className="text-sm text-base-content/70 mt-1">
                {data.current_month.month_name}
              </p>
            )}
            {data?.current_week && (
              <p className="text-sm text-base-content/70 mt-1">
                {data.current_week.week_name}
              </p>
            )}
            {data?.today && (
              <p className="text-sm text-base-content/70 mt-1">
                {data.today.date}
              </p>
            )}
          </div>
          <select
            className="select select-bordered select-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Pilih periode"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
              <Tooltip
                cursor={{ fill: "rgba(185, 151, 51, 0.1)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(5px)",
                  borderRadius: "0.5rem",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend iconType="circle" formatter={(value) => (
                <span className="text-gray-600 font-medium">{value}</span>
              )} />
              <Bar dataKey="Unit Booking" name="Unit Booking" fill="#22c55e" barSize={40} radius={[4, 4, 0, 0]} />
              <Bar dataKey="F&B Booking" name="F&B Booking" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryChart;
