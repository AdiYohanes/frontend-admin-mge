import React, { useState } from "react";
import { useGetOrderSummaryDataQuery } from "../api/dashboardApiSlice";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

const OrderSummaryChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading } = useGetOrderSummaryDataQuery({ period });

  if (isLoading)
    return (
      <div className="card bg-base-100 shadow-md h-96 flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );

  const total = data?.reduce((sum, entry) => sum + entry.value, 0) || 0;

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title">Order Summary</h2>
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
        <div className="flex-grow w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString("id-ID")} />
              <Legend iconSize={10} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
            <span className="text-gray-500 text-sm">Total Orders</span>
            <span className="text-3xl font-bold">
              {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryChart;
