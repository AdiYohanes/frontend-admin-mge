import React, { useState, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useGetTodaysBookingDataQuery } from "../api/dashboardApiSlice";

const TodaysBooking = () => {
  const [filter, setFilter] = useState("daily");

  // Komponen ini memanggil API-nya sendiri
  const { data, isLoading, isError } = useGetTodaysBookingDataQuery({
    period: filter,
  });

  // Ekstrak data dari respons API dengan aman
  const bookings = useMemo(() => {
    if (!data || !data.unit_bookings) return [];

    // Group bookings by unit_name and calculate total duration
    const unitStats = data.unit_bookings.reduce((acc, booking) => {
      const unitName = booking.unit_name;
      if (!acc[unitName]) {
        acc[unitName] = {
          name: unitName,
          booking_count: 0,
          total_duration: 0
        };
      }
      acc[unitName].booking_count += 1;
      acc[unitName].total_duration += booking.duration_hours;
      return acc;
    }, {});

    // Convert to array and sort by booking count
    return Object.values(unitStats).sort(
      (a, b) => b.booking_count - a.booking_count
    );
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="p-6 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Today's Booking</h2>
            <p className="text-sm text-gray-500">Unit performance overview</p>
          </div>

          {/* Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 font-medium">
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg border border-gray-100 w-32"
            >
              <li>
                <a
                  onClick={() => setFilter("daily")}
                  className={`text-sm px-3 py-2 rounded-md transition-colors ${filter === "daily"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Daily
                </a>
              </li>
              <li>
                <a
                  onClick={() => setFilter("weekly")}
                  className={`text-sm px-3 py-2 rounded-md transition-colors ${filter === "weekly"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Weekly
                </a>
              </li>
              <li>
                <a
                  onClick={() => setFilter("monthly")}
                  className={`text-sm px-3 py-2 rounded-md transition-colors ${filter === "monthly"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Monthly
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Unit Bookings Table */}
        <div className="flex-grow overflow-x-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Loading data...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 font-medium">Failed to load data</p>
                <p className="text-xs text-gray-500 mt-1">Please try again later</p>
              </div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Name
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-50 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {item.booking_count}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {item.total_duration}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No bookings found</p>
                <p className="text-xs text-gray-400 mt-1">No data available for this period</p>
              </div>
            </div>
          )}
        </div>

        {/* F&B Summary Section */}
        {data?.fnb_summary && data.fnb_summary.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-4 bg-green-500 rounded-full mr-3"></div>
              <h4 className="text-sm font-semibold text-gray-900">F&B Sales Today</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.fnb_summary.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">{item.fnb_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {item.total_sold}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysBooking;
