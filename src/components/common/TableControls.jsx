import React from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const TableControls = ({
  limit,
  setLimit,
  searchTerm,
  setSearchTerm,
  onAddClick,
  addButtonText,
  showSearch = true,
  searchPlaceholder = "Search ...",
  exportButton,
}) => {

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
