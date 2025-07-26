import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetWhatsTrendingDataQuery } from "../api/dashboardApiSlice";

const ConsoleStats = ({ sharedPeriod, onPeriodChange }) => {
  const period = sharedPeriod || "daily";

  const { data, isLoading, isError } = useGetWhatsTrendingDataQuery({
    period,
  }, {
    skip: !period, // Skip query if period is not defined
  });

  const chartData = useMemo(() => {
    if (!data || !data.console) return [];

    const consoleData = data.console || [];
    const totalBookings = consoleData.reduce((sum, item) => sum + item.totalOrders, 0);

    // Generate colors for each console
    const colors = ["#22c55e", "#f97316", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981"];

    return consoleData.map((item, index) => ({
      name: item.name,
      value: totalBookings > 0 ? Math.round((item.totalOrders / totalBookings) * 100) : 0,
      bookingCount: item.totalOrders,
      color: colors[index % colors.length],
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-brand-gold font-bold">{data.value}%</p>
          <p className="text-sm text-gray-600">{data.bookingCount} bookings</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md h-full flex justify-center items-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card bg-base-100 shadow-md h-full flex justify-center items-center">
        <p className="text-error text-sm">Gagal memuat data.</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md h-full">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Console Stats</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Chart Section */}
          <div className="flex-1 flex items-center justify-center">
            {chartData.length > 0 ? (
              <div className="w-full max-w-xs">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Tidak ada data console</p>
              </div>
            )}
          </div>

          {/* Legend Section */}
          <div className="flex-1">
            {chartData.length > 0 ? (
              <div className="space-y-3">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-base-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-semibold text-base-content">{item.name}</p>
                      <p className="text-sm text-base-content/60">
                        {item.bookingCount} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-gold text-lg">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Tidak ada data console</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleStats;
