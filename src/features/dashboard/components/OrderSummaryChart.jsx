
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useGetOrderSummaryDataQuery } from "../api/dashboardApiSlice";

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const OrderSummaryChart = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading, isError } = useGetOrderSummaryDataQuery({ period });

  // Handle error state
  if (isError || data?.type === "error") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-sm text-gray-500 mb-4">Unable to fetch order summary data</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use chart data from API response
  const chartData = data?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        <div className="p-6 flex flex-col h-full">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>

          {/* Chart Skeleton */}
          <div className="flex-grow h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">Loading chart data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="p-6 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
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
              <div className="mt-1">
                <p className="text-xs text-blue-600 font-medium">
                  Today: {data.today.date}
                </p>
                {data?.yesterday && (
                  <p className="text-xs text-gray-500">
                    Yesterday: {data.yesterday.date}
                  </p>
                )}
              </div>
            )}
            {data?.current_week && (
              <div className="mt-1">
                <p className="text-xs text-blue-600 font-medium">
                  Week: {data.current_week.week_name}
                </p>
                {data?.previous_week && (
                  <p className="text-xs text-gray-500">
                    Previous Week: {data.previous_week.week_name}
                  </p>
                )}
              </div>
            )}
          </div>
          <select
            className="select select-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

        {/* Chart Section */}
        <div className="flex-grow h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                  fontWeight: 500
                }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                height={60}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 12,
                  fill: '#64748b',
                  fontWeight: 500
                }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  padding: "12px 16px",
                }}
                labelStyle={{
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
                formatter={(value, name) => [
                  <span className="font-semibold text-gray-900">{value}</span>,
                  <span className="text-gray-600">{name}</span>
                ]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
                formatter={(value) => (
                  <span className="text-gray-700 font-medium">{value}</span>
                )}
              />
              <Bar
                dataKey="Unit Booking"
                name="Unit Booking"
                fill="#10b981"
                barSize={chartData.length > 10 ? 20 : 32}
                radius={[4, 4, 0, 0]}
                stroke="#059669"
                strokeWidth={1}
              />
              <Bar
                dataKey="F&B Booking"
                name="F&B Booking"
                fill="#3b82f6"
                barSize={chartData.length > 10 ? 20 : 32}
                radius={[4, 4, 0, 0]}
                stroke="#2563eb"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {chartData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-600">Unit Bookings</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {chartData.reduce((sum, item) => sum + (item["Unit Booking"] || 0), 0)}
                </div>
                {data?.yesterday && period === "daily" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Yesterday: {data.yesterday.hourly_breakdown?.reduce((sum, item) => sum + (item.unit_booking_count || 0), 0) || 0}
                  </div>
                )}
                {data?.previous_week && period === "weekly" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Previous Week: {data.previous_week.daily_breakdown?.reduce((sum, item) => sum + (item.unit_booking_count || 0), 0) || 0}
                  </div>
                )}
                {data?.previous_month && period === "monthly" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Previous Month: {data.previous_month.weekly_breakdown?.reduce((sum, item) => sum + (item.unit_booking_count || 0), 0) || 0}
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-600">F&B Bookings</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {chartData.reduce((sum, item) => sum + (item["F&B Booking"] || 0), 0)}
                </div>
                {data?.yesterday && period === "daily" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Yesterday: {data.yesterday.hourly_breakdown?.reduce((sum, item) => sum + (item.fnb_booking_count || 0), 0) || 0}
                  </div>
                )}
                {data?.previous_week && period === "weekly" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Previous Week: {data.previous_week.daily_breakdown?.reduce((sum, item) => sum + (item.fnb_booking_count || 0), 0) || 0}
                  </div>
                )}
                {data?.previous_month && period === "monthly" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Previous Month: {data.previous_month.weekly_breakdown?.reduce((sum, item) => sum + (item.fnb_booking_count || 0), 0) || 0}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryChart;
