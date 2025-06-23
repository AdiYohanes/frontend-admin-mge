import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-4">
      <div className="join">
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`join-item btn btn-sm ${
              currentPage === number ? "btn-active" : ""
            }`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pagination;
