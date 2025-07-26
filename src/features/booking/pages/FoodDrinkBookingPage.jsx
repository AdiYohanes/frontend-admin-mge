import React, { useState, useEffect, useMemo } from 'react';
import { useGetFoodDrinkBookingsQuery, useGetFoodDrinkBookingDetailQuery } from '../api/foodDrinkBookingApiSlice';
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

  // Load booking list
  const { data: apiResponse, isLoading, isFetching } = useGetFoodDrinkBookingsQuery({
    page: currentPage,
    limit,
    status: statusFilter,
  });

  // Extract booking IDs for detail loading
  const bookingIds = useMemo(() => {
    if (!apiResponse?.bookings) return [];
    return apiResponse.bookings.map(booking => booking.id);
  }, [apiResponse?.bookings]);

  // Load details for all bookings
  const { data: bookingDetails, isLoading: isLoadingDetails } = useGetFoodDrinkBookingDetailQuery(
    bookingIds.length > 0 ? bookingIds : null,
    {
      skip: bookingIds.length === 0,
    }
  );

  // Merge booking list with details
  const mergedBookings = useMemo(() => {
    if (!apiResponse?.bookings) return [];

    return apiResponse.bookings.map(booking => {
      // Ensure bookingDetails is an array and handle both single and batch responses
      let detailsArray = [];
      if (Array.isArray(bookingDetails)) {
        detailsArray = bookingDetails;
      } else if (bookingDetails && typeof bookingDetails === 'object') {
        // If it's a single object, wrap it in array
        detailsArray = [bookingDetails];
      }

      const detail = detailsArray.find(d => d?.id === booking.id);

      // Create order name from FnB items
      const orderName = detail?.fnbItems?.length > 0
        ? detail.fnbItems.map(item => `${item.name} (${item.quantity}x)`).join(', ')
        : 'F&B Order';

      return {
        ...booking,
        orderName: orderName,
        fnbItems: detail?.fnbItems || [],
      };
    });
  }, [apiResponse?.bookings, bookingDetails]);

  // Filter data berdasarkan search term di frontend
  const filteredBookings = useMemo(() => {
    if (!mergedBookings) return [];

    return mergedBookings.filter(booking =>
      booking.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.noTransaction.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.orderName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.phoneNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [mergedBookings, debouncedSearchTerm]);

  // Gunakan pagination dari API response
  const paginationData = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15
  };

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
  }, [limit, statusFilter]);

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
              Kelola pesanan makanan dan minuman pelanggan
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
                searchPlaceholder="Cari nama, no. transaksi, atau email..."
              />
            </div>

            {/* Table */}
            <div className="mb-6">
              <FoodDrinkTable
                orders={filteredBookings}
                isLoading={isLoading || isFetching || isLoadingDetails}
                page={currentPage}
                limit={limit}
                onPrint={handleOpenPrintModal}
                onViewDetail={handleOpenDetailModal}
              />
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Loading Overlay */}
            {(isLoading || isFetching || isLoadingDetails) && (
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
