import React from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const TableControls = ({
  limit,
  setLimit,
  searchTerm,
  setSearchTerm,
  monthFilter,
  setMonthFilter,
  onAddClick,
  addButtonText,
  showMonthFilter = true,
  showSearch = true,
  searchPlaceholder = "Search ...",
}) => {
  // Generate last 12 months including current month, dynamically
  const monthOptions = Array.from({ length: 12 }, (_, idx) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - idx, 1);
    const label = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { label, value };
  }).reverse();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          className="select select-bordered select-sm"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>entries</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Input with Icon */}
        {showSearch && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="input input-bordered input-sm pl-10 pr-4 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Month Filter di sebelah search */}
        {showMonthFilter && (
          <select
            className="select select-bordered select-sm"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            aria-label="Filter by month"
          >
            <option value="">All months</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Add Button di pojok kanan */}
        {onAddClick && (
          <button
            className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
            onClick={onAddClick}
          >
            <PlusIcon className="h-4 w-4" />
            {addButtonText || "Add New"}
          </button>
        )}
      </div>
    </div>
  );
};

export default TableControls;
