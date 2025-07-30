import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Debug log untuk memastikan props diterima dengan benar
  console.log('🔍 DEBUG - Pagination props:', { currentPage, totalPages });

  if (totalPages <= 1) {
    console.log('🔍 DEBUG - Pagination tidak ditampilkan karena totalPages <= 1');
    return null;
  }

  console.log('🔍 DEBUG - Rendering pagination buttons:', { currentPage, totalPages });

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Jika terlalu banyak halaman, tampilkan navigasi yang lebih compact
  const showCompactPagination = totalPages > 10;

  const renderPageButtons = () => {
    if (showCompactPagination) {
      // Tampilkan navigasi compact untuk halaman yang banyak
      const buttons = [];

      // Tombol Previous
      if (currentPage > 1) {
        buttons.push(
          <button
            key="prev"
            className="join-item btn btn-sm bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
            onClick={() => onPageChange(currentPage - 1)}
          >
            «
          </button>
        );
      }

      // Halaman pertama
      buttons.push(
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

      // Ellipsis jika ada gap
      if (currentPage > 4) {
        buttons.push(
          <button key="ellipsis1" className="join-item btn btn-sm bg-white text-gray-500 border-gray-300" disabled>
            ...
          </button>
        );
      }

      // Halaman sekitar current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          buttons.push(
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

      // Ellipsis jika ada gap
      if (currentPage < totalPages - 3) {
        buttons.push(
          <button key="ellipsis2" className="join-item btn btn-sm bg-white text-gray-500 border-gray-300" disabled>
            ...
          </button>
        );
      }

      // Halaman terakhir
      if (totalPages > 1) {
        buttons.push(
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

      // Tombol Next
      if (currentPage < totalPages) {
        buttons.push(
          <button
            key="next"
            className="join-item btn btn-sm bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
            onClick={() => onPageChange(currentPage + 1)}
          >
            »
          </button>
        );
      }

      return buttons;
    } else {
      // Tampilkan semua nomor halaman untuk halaman yang sedikit
      return pageNumbers.map((number) => (
        <button
          key={number}
          className={`join-item btn btn-sm ${currentPage === number
            ? "bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
            : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
            }`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ));
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <div className="join">
        {renderPageButtons()}
      </div>
    </div>
  );
};

export default Pagination;
