import React, { useState, useMemo } from "react";
import { useGetRevenueChartDataQuery } from "../api/dashboardApiSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const formatCurrency = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);

const formatYAxis = (tick) => {
  if (tick >= 1000000) return `${tick / 1000000} Jt`;
  if (tick >= 1000) return `${tick / 1000} Rb`;
  return tick;
};

// Function to calculate Y-axis ticks with 50k increments
const calculateYTicks = (data) => {
  if (!data || data.length === 0) return [0, 50000, 100000, 150000, 200000];

  const maxValue = Math.max(...data.map(item => item.Pemasukan || 0));

  // Calculate the next multiple of 50k above maxValue
  const nextFiftyK = Math.ceil(maxValue / 50000) * 50000;

  // Generate ticks from 0 to nextFiftyK with 50k increments
  const ticks = [];
  for (let i = 0; i <= nextFiftyK; i += 50000) {
    ticks.push(i);
  }

  // Ensure we have at least 3 ticks
  if (ticks.length < 3) {
    ticks.push(100000, 150000);
  }

  return ticks;
};

// Function to calculate Y-axis domain for better visualization
const calculateYDomain = (data) => {
  if (!data || data.length === 0) return [0, 200000];

  const maxValue = Math.max(...data.map(item => item.Pemasukan || 0));

  // Calculate the next multiple of 50k above maxValue
  const nextFiftyK = Math.ceil(maxValue / 50000) * 50000;

  // Return domain from 0 to the calculated maximum
  return [0, nextFiftyK];
};

// Function to translate day names to Indonesian
const translateDayName = (dayName) => {
  const dayTranslations = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  };
  return dayTranslations[dayName] || dayName;
};

// Function to translate week names to Indonesian
const translateWeekName = (weekName) => {
  return weekName.replace('Week', 'Minggu');
};

const RevenueChart = () => {
  const [period, setPeriod] = useState("daily");
  const { data: apiResponse, isLoading, isError } = useGetRevenueChartDataQuery({
    period,
  });

  const chartData = useMemo(() => {
    if (!apiResponse || apiResponse.type !== "chart") return [];

    // Transform data to include translated names and formatted dates
    return apiResponse.data.map(item => {
      if (period === "weekly") {
        return {
          ...item,
          name: translateDayName(item.name),
          date: item.date ? format(new Date(item.date), 'dd MMM', { locale: idLocale }) : '',
          displayName: `${translateDayName(item.name)}\n${item.date ? format(new Date(item.date), 'dd MMM', { locale: idLocale }) : ''}`
        };
      } else if (period === "monthly") {
        return {
          ...item,
          name: translateWeekName(item.name),
          displayName: translateWeekName(item.name)
        };
      }
      return item;
    });
  }, [apiResponse, period]);

  // Calculate yesterday's total revenue for daily period
  const yesterdayTotalRevenue = useMemo(() => {
    // Cek apakah ada data yesterday dalam response
    if (period === "daily" && apiResponse) {
      // Data yesterday sudah disimpan dalam apiResponse.yesterday
      if (apiResponse.yesterday?.revenue_by_hour) {
        const total = apiResponse.yesterday.revenue_by_hour.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        return total;
      }
    }
    return 0;
  }, [apiResponse, period]);

  // Calculate previous week's total revenue for weekly period
  const previousWeekTotalRevenue = useMemo(() => {
    // Cek apakah ada data previous_week dalam response
    if (period === "weekly" && apiResponse) {
      // Data previous_week sudah disimpan dalam apiResponse.previous_week
      if (apiResponse.previous_week?.daily_breakdown) {
        const total = apiResponse.previous_week.daily_breakdown.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        return total;
      }
    }
    return 0;
  }, [apiResponse, period]);

  // Calculate previous month's total revenue for monthly period
  const previousMonthTotalRevenue = useMemo(() => {
    // Cek apakah ada data previous_month dalam response
    if (period === "monthly" && apiResponse) {
      // Data previous_month sudah disimpan dalam apiResponse.previous_month
      if (apiResponse.previous_month?.weekly_breakdown) {
        const total = apiResponse.previous_month.weekly_breakdown.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        return total;
      }
    }
    return 0;
  }, [apiResponse, period]);

  const filterOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex-grow flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        </div>
      );

    if (isError)
      return (
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Gagal memuat data</p>
            <p className="text-sm text-gray-500 mt-1">Silakan coba lagi nanti</p>
          </div>
        </div>
      );

    if (!apiResponse)
      return (
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Tidak ada data</p>
          </div>
        </div>
      );

    if (apiResponse.type === "error") {
      return (
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Terjadi kesalahan</p>
            <p className="text-sm text-gray-500 mt-1">{apiResponse.message || "Gagal memuat data"}</p>
          </div>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Tidak ada data revenue</p>
            <p className="text-sm text-gray-500 mt-1">untuk periode ini</p>
          </div>
        </div>
      );
    }

    // Calculate total revenue for the period
    const totalRevenue = chartData.reduce((sum, item) => sum + (item.Pemasukan || 0), 0);

    // Calculate Y-axis ticks and domain with 50k increments
    const yTicks = calculateYTicks(chartData);
    const yDomain = calculateYDomain(chartData);

    // Calculate percentage change and trend indicators
    const getRevenueComparison = (currentRevenue, previousRevenue) => {
      if (previousRevenue === 0) {
        if (currentRevenue > 0) {
          // Jika sebelumnya 0 dan sekarang ada revenue, hitung persentase dari current revenue
          return { type: 'up', percentage: 100, text: '+100%' };
        } else {
          return { type: 'neutral', percentage: 0, text: 'No change' };
        }
      }

      const percentage = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      const roundedPercentage = Math.round(percentage * 10) / 10; // Round to 1 decimal place

      if (percentage > 0) {
        return { type: 'up', percentage: roundedPercentage, text: `+${roundedPercentage}%` };
      } else if (percentage < 0) {
        return { type: 'down', percentage: Math.abs(roundedPercentage), text: `-${Math.abs(roundedPercentage)}%` };
      } else {
        return { type: 'neutral', percentage: 0, text: 'No change' };
      }
    };

    // Get comparison data for current period
    const currentComparison = getRevenueComparison(totalRevenue, period === "daily" ? yesterdayTotalRevenue : period === "weekly" ? previousWeekTotalRevenue : previousMonthTotalRevenue);

    return (
      <div className="flex flex-col h-full">
        {/* Summary Stats */}
        <div className="mb-4 flex-shrink-0">
          {period === "daily" ? (
            // Layout untuk daily period dengan Today dan Yesterday
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Revenue Today */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue Today
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(totalRevenue)}
                    </p>
                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 mt-1 ${currentComparison.type === 'up' ? 'text-green-600' :
                      currentComparison.type === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                      {currentComparison.type === 'up' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                      {currentComparison.type === 'down' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span className="text-xs font-medium">{currentComparison.text}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Yesterday */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue Yesterday
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(yesterdayTotalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : period === "weekly" ? (
            // Layout untuk weekly period dengan This Week dan Previous Week
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Revenue This Week */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue This Week
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(totalRevenue)}
                    </p>
                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 mt-1 ${currentComparison.type === 'up' ? 'text-green-600' :
                      currentComparison.type === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                      {currentComparison.type === 'up' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                      {currentComparison.type === 'down' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span className="text-xs font-medium">{currentComparison.text}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Previous Week */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue Previous Week
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(previousWeekTotalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Layout untuk monthly period
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Revenue This Month */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue This Month
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(totalRevenue)}
                    </p>
                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 mt-1 ${currentComparison.type === 'up' ? 'text-green-600' :
                      currentComparison.type === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                      {currentComparison.type === 'up' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                      {currentComparison.type === 'down' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span className="text-xs font-medium">{currentComparison.text}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Previous Month */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Revenue Previous Month
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(previousMonthTotalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 15,
                bottom: period === "weekly" ? 60 : 50
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.1}
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey={period === "weekly" ? "displayName" : "name"}
                tick={{
                  fontSize: 10,
                  fill: '#6b7280',
                  fontWeight: 500
                }}
                angle={-45}
                textAnchor="end"
                height={period === "weekly" ? 60 : 50}
                interval={0}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{
                  fontSize: 10,
                  fill: '#6b7280',
                  fontWeight: 500
                }}
                width={50}
                domain={yDomain}
                ticks={yTicks}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                formatter={(value) => [
                  <span style={{ color: '#B99733', fontWeight: '600' }}>
                    {formatCurrency(value)}
                  </span>,
                  "Revenue"
                ]}
                labelFormatter={(label) => {
                  if (period === "daily") return `Jam ${label}`;
                  if (period === "weekly") {
                    const dayName = label.split('\n')[0];
                    const date = label.split('\n')[1];
                    return `${dayName} (${date})`;
                  }
                  if (period === "monthly") return label;
                  return label;
                }}
                cursor={{ stroke: '#B99733', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="Pemasukan"
                stroke="#B99733"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                activeDot={{
                  r: 5,
                  fill: "#B99733",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
                dot={{
                  r: 3,
                  fill: "#B99733",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Revenue Chart</h2>
            <p className="text-xs text-gray-500 mt-1">
              Analisis pendapatan berdasarkan periode
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-xs border-gray-300 hover:border-brand-gold text-gray-700 hover:text-brand-gold hover:bg-brand-gold/5">
              {filterOptions.find((opt) => opt.value === period)?.label}
              <ChevronDownIcon className="h-3 w-3 ml-1" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg border border-gray-200 w-28"
            >
              {filterOptions.map((opt) => (
                <li key={opt.value}>
                  <a
                    className={`${period === opt.value ? 'bg-brand-gold text-white' : 'hover:bg-gray-50'} rounded-md text-sm`}
                    onClick={() => {
                      setPeriod(opt.value);
                      if (document.activeElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
                    {opt.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;

