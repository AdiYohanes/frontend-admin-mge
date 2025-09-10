import React from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const TableControls = ({
  limit,
  setLimit,
  searchTerm,
  setSearchTerm,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  onAddClick,
  addButtonText,
  showMonthFilter = true,
  showYearFilter = true,
  showSearch = true,
  searchPlaceholder = "Search ...",
  exportButton,
}) => {
  // Generate month options (1-12)
  const monthOptions = [
    { value: "", label: "All months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (current year and 5 years before)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "All years" },
    ...Array.from({ length: 6 }, (_, idx) => {
      const year = currentYear - idx;
      return { value: year.toString(), label: year.toString() };
    }),
  ];

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
        {/* Export Button di sebelah kiri search */}
        {exportButton}

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

        {/* Month Filter */}
        {showMonthFilter && (
          <select
            className="select select-bordered select-sm"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            aria-label="Filter by month"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Year Filter */}
        {showYearFilter && (
          <select
            className="select select-bordered select-sm"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filter by year"
          >
            {yearOptions.map((opt) => (
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
