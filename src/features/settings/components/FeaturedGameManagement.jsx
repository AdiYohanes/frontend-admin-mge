import React, { useState } from "react";
import {
  useGetFeaturedGamesQuery,
  useUpdateGameFeaturedStatusMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import FeaturedGameTable from "./FeaturedGameTable";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const FeaturedGameManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useGetFeaturedGamesQuery({
    page: currentPage,
    limit,
  });

  const [updateGameStatus] = useUpdateGameFeaturedStatusMutation();

  const handleToggleStatus = async (game) => {
    try {
      await updateGameStatus({
        id: game.id,
        isActive: !game.isActive
      }).unwrap();
      toast.success(`Game ${game.isActive ? 'unfeatured' : 'featured'} successfully!`);
    } catch {
      toast.error("Failed to update game status.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Custom Professional Pagination Component
  const ProfessionalPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];

      // Always show first page
      pages.push(
        <button
          key={1}
          className={`join-item btn btn-sm ${currentPage === 1
            ? "bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
            : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
            }`}
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );

      // Show ellipsis if there's a gap after page 1
      if (currentPage > 4) {
        pages.push(
          <button key="ellipsis1" className="join-item btn btn-sm bg-white text-gray-500 border-gray-300" disabled>
            ...
          </button>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(
            <button
              key={i}
              className={`join-item btn btn-sm ${currentPage === i
                ? "bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
                : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              onClick={() => onPageChange(i)}
            >
              {i}
            </button>
          );
        }
      }

      // Show ellipsis if there's a gap before last page
      if (currentPage < totalPages - 3) {
        pages.push(
          <button key="ellipsis2" className="join-item btn btn-sm bg-white text-gray-500 border-gray-300" disabled>
            ...
          </button>
        );
      }

      // Always show last page if there's more than one page
      if (totalPages > 1) {
        pages.push(
          <button
            key={totalPages}
            className={`join-item btn btn-sm ${currentPage === totalPages
              ? "bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
              : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
              }`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            className={`btn btn-sm btn-circle ${currentPage === 1
              ? "btn-disabled opacity-50"
              : "btn-outline hover:bg-brand-gold hover:text-white hover:border-brand-gold"
              }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          <div className="join">
            {renderPageNumbers()}
          </div>

          {/* Next Button */}
          <button
            className={`btn btn-sm btn-circle ${currentPage === totalPages
              ? "btn-disabled opacity-50"
              : "btn-outline hover:bg-brand-gold hover:text-white hover:border-brand-gold"
              }`}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Show Entries Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="select select-bordered select-sm w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
          <span className="text-sm text-base-content/70">entries</span>
        </div>

        {data?.totalItems && (
          <div className="text-sm text-base-content/70">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.totalItems)} of {data.totalItems} entries
          </div>
        )}
      </div>

      <FeaturedGameTable
        games={data?.games}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        limit={limit}
      />

      {data?.totalPages > 1 && (
        <ProfessionalPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default FeaturedGameManagement;
