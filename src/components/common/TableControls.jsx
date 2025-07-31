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

      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input with Icon */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            className="input input-bordered input-sm pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Month Filter */}
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
      </div>

      {/* --- AWAL BLOK PERUBAHAN --- */}
      {onAddClick && (
        <button
          className="btn btn-sm bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
          onClick={onAddClick}
        >
          <PlusIcon className="h-4 w-4" />
          {addButtonText || "Add New"}
        </button>
      )}
      {/* --- AKHIR BLOK PERUBAHAN --- */}
    </div>
  );
};

export default TableControls;
