import React, { useState } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useGetOrderSummaryDataQuery } from "../api/dashboardApiSlice";

const OrderSummaryChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading, isError } = useGetOrderSummaryDataQuery({ period });

  // Transform API data to chart format
  const chartData = data?.data?.map(item => ({
    name: item.name,
    unit: item["Unit Booking"] || 0,
    fnb: item["F&B Booking"] || 0,
  })) || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-500">No booking data found for the selected period</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Order Summary</h2>
            <p className="text-sm text-gray-500">Booking performance overview</p>
            {data?.current_month && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {data.current_month.month_name}
              </p>
            )}
            {data?.current_week && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {data.current_week.week_name}
              </p>
            )}
            {data?.today && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                Today: {data.today.date}
              </p>
            )}
          </div>

          {/* Period Tabs */}
          <div className="tabs tabs-boxed bg-base-200">
            <button
              className={`tab tab-sm ${period === "daily" ? "tab-active" : ""}`}
              onClick={() => setPeriod("daily")}
            >
              Daily
            </button>
            <button
              className={`tab tab-sm ${period === "weekly" ? "tab-active" : ""}`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`tab tab-sm ${period === "monthly" ? "tab-active" : ""}`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-grow h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="unit"
                fill="#10b981"
                name="Unit Booking"
                activeBar={<Rectangle fill="#059669" stroke="#047857" />}
              />
              <Bar
                dataKey="fnb"
                fill="#3b82f6"
                name="F&B Booking"
                activeBar={<Rectangle fill="#2563eb" stroke="#1d4ed8" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-600">Unit Bookings</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {chartData.reduce((sum, item) => sum + (item.unit || 0), 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-600">F&B Bookings</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {chartData.reduce((sum, item) => sum + (item.fnb || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryChart;