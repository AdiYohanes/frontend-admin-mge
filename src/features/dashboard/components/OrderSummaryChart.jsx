/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useGetOrderSummaryDataQuery } from "../api/dashboardApiSlice";

const periodOptions = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

const OrderSummaryChart = () => {
  const [period, setPeriod] = useState("daily");
  const { data, isLoading } = useGetOrderSummaryDataQuery({ period });

  const barData = [
    { name: "Rental", value: data?.rental ?? 0 },
    { name: "FnB", value: data?.foodDrink ?? 0 },
  ];

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
          <h2 className="card-title flex-shrink-0">Order Summary</h2>
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
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <Bar dataKey="value" name="Jumlah Order" barSize={40} radius={[4, 4, 0, 0]}>
                <Cell fill="#22c55e" />
                <Cell fill="#3b82f6" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryChart;
