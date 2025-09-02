import React, { useState, useEffect, useMemo } from 'react';
import { useGetFoodDrinkBookingsQuery } from '../api/foodDrinkBookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';

import TableControls from '../../../components/common/TableControls';
import FoodDrinkTable from '../components/FoodDrinkTable';
import Pagination from '../../../components/common/Pagination';
import PrintPreviewModal from '../components/PrintPreviewModal';
import FoodDrinkDetailModal from '../components/FoodDrinkDetailModal';

const FoodDrinkBookingPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load booking list with proper pagination
  const { data: apiResponse, isLoading, isFetching } = useGetFoodDrinkBookingsQuery({
    page: currentPage,
    limit: limit,
    status: statusFilter,
  });

  // Debug: Log API response
  useEffect(() => {
    console.log('🔍 DEBUG - FoodDrinkBooking API Response:', {
      apiResponse,
      isLoading,
      isFetching,
      currentPage,
      limit,
      statusFilter
    });
  }, [apiResponse, isLoading, isFetching, currentPage, limit, statusFilter]);

  // Use bookings directly from API response (already transformed)
  const bookings = useMemo(() => {
    return apiResponse?.bookings || [];
  }, [apiResponse?.bookings]);

  // Debug: Log bookings
  useEffect(() => {
    console.log('🔍 DEBUG - Bookings:', {
      bookingsCount: bookings.length,
      sampleBookings: bookings.slice(0, 2).map(b => ({
        id: b.id,
        noTransaction: b.noTransaction,
        name: b.name,
        orderName: b.orderName,
        fnbItemsCount: b.fnbItems?.length || 0
      }))
    });
  }, [bookings]);

  // Filter data berdasarkan search term di frontend
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    // Debug: Log sebelum filtering
    console.log('🔍 DEBUG - FoodDrinkBooking filtering:', {
      totalBookings: bookings.length,
      searchTerm: debouncedSearchTerm,
      sampleBookings: bookings.slice(0, 3).map(b => ({
        id: b.id,
        noTransaction: b.noTransaction,
        name: b.name
      }))
    });

    // Filter berdasarkan search term
    const filtered = bookings.filter(booking =>
      booking.noTransaction.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.orderName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (booking.notes && booking.notes.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );

    // Debug: Log setelah filtering
    console.log('🔍 DEBUG - After search filter:', {
      filteredBookingsCount: filtered.length,
      sampleFilteredBookings: filtered.slice(0, 3).map(b => ({
        id: b.id,
        noTransaction: b.noTransaction,
        name: b.name
      }))
    });

    return filtered;
  }, [bookings, debouncedSearchTerm]);

  // Debug: Log final filtered bookings
  useEffect(() => {
    console.log('🔍 DEBUG - Final Filtered Bookings:', {
      filteredBookingsCount: filteredBookings.length,
      sampleFilteredBookings: filteredBookings.slice(0, 2).map(b => ({
        id: b.id,
        noTransaction: b.noTransaction,
        name: b.name,
        orderName: b.orderName
      }))
    });
  }, [filteredBookings]);

  // Use pagination data from API response
  const paginationData = useMemo(() => {
    return apiResponse?.pagination || {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: limit
    };
  }, [apiResponse?.pagination, limit]);

  // Debug: Log pagination data
  useEffect(() => {
    console.log('🔍 DEBUG - Pagination Data:', {
      paginationData,
      filteredBookingsCount: filteredBookings.length,
      apiResponseTotal: apiResponse?.pagination?.total
    });
  }, [paginationData, filteredBookings.length, apiResponse?.pagination?.total]);

  const handleOpenPrintModal = (order) => {
    setOrderToPrint(order);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => setOrderToPrint(null), 300);
  };

  const handleOpenDetailModal = (order) => {
    setSelectedBookingId(order.id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedBookingId(null), 300);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const statusTabs = [
    { value: "All", label: "All" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Pending", label: "Pending" },
    { value: "Finished", label: "Finished" }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Food & Drink Booking</h1>
            <p className="text-base-content/60 mt-1">
              Kelola pesanan makanan dan minuman pelanggan (Invoice: FNB-*)
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            {/* Status Tabs */}
            <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
              {statusTabs.map((tab) => (
                <a
                  key={tab.value}
                  className={`tab tab-sm lg:tab-md font-medium ${statusFilter === tab.value ? "tab-active bg-brand-gold text-white" : ""
                    }`}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </a>
              ))}
            </div>

            {/* Table Controls */}
            <div className="mb-6">
              <TableControls
                limit={limit}
                setLimit={setLimit}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showMonthFilter={false}
                searchPlaceholder="Search by invoice number or order..."
              />
            </div>

            {/* Table */}
            <div className="mb-6">
              <FoodDrinkTable
                orders={filteredBookings}
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onPrint={handleOpenPrintModal}
                onViewDetail={handleOpenDetailModal}
              />
            </div>

            {/* Show filtered count when searching */}
            {debouncedSearchTerm.trim() && (
              <div className="text-sm text-gray-600 mb-4 text-center">
                Found {filteredBookings.length} F&B orders matching "{debouncedSearchTerm}"
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Loading Overlay */}
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center rounded-lg">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        orderData={orderToPrint}
      />

      <FoodDrinkDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        bookingId={selectedBookingId}
      />
    </>
  );
};

export default FoodDrinkBookingPage;

