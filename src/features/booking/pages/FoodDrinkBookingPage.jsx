import React, { useState, useEffect } from "react"; // Impor useEffect
import { useGetFoodDrinkBookingsQuery } from "../api/foodDrinkBookingApiSlice";
import useDebounce from "../../../hooks/useDebounce";

import TableControls from "../../../components/common/TableControls";
import FoodDrinkTable from "../components/FoodDrinkTable";
import Pagination from "../../../components/common/Pagination";
import PrintPreviewModal from "../components/PrintPreviewModal";

const FoodDrinkBookingPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // State untuk filter status
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);

  const handleOpenPrintModal = (order) => {
    setOrderToPrint(order);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => setOrderToPrint(null), 300);
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetFoodDrinkBookingsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
    month: monthFilter,
    status: statusFilter, // Kirim status ke API
  });

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, statusFilter]);

  const statusTabs = ["All", "Complete", "Waiting for Payment"];

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            Food & Drink Booking List
          </h2>

          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map((tab) => (
              <a
                key={tab}
                className={`tab ${statusFilter === tab ? "tab-active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </a>
            ))}
          </div>

          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
          />

          <FoodDrinkTable
            orders={data?.bookings}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onPrint={handleOpenPrintModal}
          />

          <Pagination
            currentPage={data?.currentPage}
            totalPages={data?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        orderData={orderToPrint}
      />
    </>
  );
};

export default FoodDrinkBookingPage;
