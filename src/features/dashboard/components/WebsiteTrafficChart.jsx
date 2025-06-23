import React, { useState } from "react";
import { useGetWebsiteTrafficDataQuery } from "../api/dashboardApiSlice";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#8884d8", "#ff8042"];

const WebsiteTrafficChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading } = useGetWebsiteTrafficDataQuery({ period });

  if (isLoading)
    return (
      <div className="card bg-base-100 shadow-md h-96 flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );

  let conversionRate = 0;
  if (data && data.length === 2) {
    const visitors = data.find((d) => d.name === "Visitors")?.value || 0;
    const clicks = data.find((d) => d.name === "Clicks")?.value || 0;
    if (visitors > 0) {
      conversionRate = (clicks / visitors) * 100;
    }
  }

  return (
    <div className="card bg-base-100 shadow-md h-96">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title">Website Traffic</h2>
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
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
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
            <span className="text-gray-500 text-sm">Conversion Rate</span>
            <span className="text-3xl font-bold text-success">
              {conversionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTrafficChart;
