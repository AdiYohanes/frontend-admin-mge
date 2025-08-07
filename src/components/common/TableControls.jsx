import React from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"; // <-- 1. Impor ikon Plus dan Search

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
  searchPlaceholder = "Search transactions...",
}) => {
  const monthOptions = Array.from({ length: 12 }, (e, i) => {
    const date = new Date(2025, i, 1);
    const label = date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    const value = `2025-${String(i + 1).padStart(2, "0")}`;
    return { label, value };
  });

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
          >
            <option value="">Filter by Month</option>
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
