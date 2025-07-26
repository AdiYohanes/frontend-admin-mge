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
    if (!data || !data.booking_counts_by_unit) return [];
    // Urutkan data berdasarkan jumlah booking terbanyak
    return [...data.booking_counts_by_unit].sort(
      (a, b) => b.booking_count - a.booking_count
    );
  }, [data]);

  return (
    <div className="card bg-base-100 shadow-md h-full">
      <div className="card-body flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="card-title">Today's Booking</h2>

          {/* Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm">
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
            >
              <li>
                <a
                  onClick={() => setFilter("daily")}
                  className={filter === "daily" ? "active" : ""}
                >
                  Daily
                </a>
              </li>
              <li>
                <a
                  onClick={() => setFilter("weekly")}
                  className={filter === "weekly" ? "active" : ""}
                >
                  Weekly
                </a>
              </li>
              <li>
                <a
                  onClick={() => setFilter("monthly")}
                  className={filter === "monthly" ? "active" : ""}
                >
                  Monthly
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Daftar Booking */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <span className="loading loading-spinner"></span>
            </div>
          ) : isError ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-error text-sm">Gagal memuat data.</p>
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-base-content/30 w-6">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-base-content">{item.name}</p>
                </div>
                <div className="font-bold text-brand-gold">
                  {item.booking_count}{" "}
                  <span className="text-sm font-normal text-base-content/60">
                    bookings
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">
                Tidak ada booking untuk periode ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaysBooking;
