import React, { useState, useEffect, useMemo } from 'react';
import { useGetFoodDrinkBookingsQuery } from '../api/foodDrinkBookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';

import TableControls from '../../../components/common/TableControls';
import FoodDrinkTable from '../components/FoodDrinkTable';
import Pagination from '../../../components/common/Pagination';
import PrintPreviewModal from '../components/PrintPreviewModal';
import FoodDrinkDetailModal from '../components/FoodDrinkDetailModal';

const FoodDrinkBookingPage = () => {
  // --- URL PARAMETER MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- URL PARAMETER SYNCHRONIZATION ---
  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const urlMonth = searchParams.get('month') || '';
    const urlYear = searchParams.get('year') || '';
    const urlStatus = searchParams.get('status') || 'All';
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlLimit = parseInt(searchParams.get('limit')) || 10;
    const urlSearch = searchParams.get('search') || '';
    const urlSortDirection = searchParams.get('sort_direction') || 'desc';

    setMonthFilter(urlMonth);
    setYearFilter(urlYear);
    setStatusFilter(urlStatus);
    setCurrentPage(urlPage);
    setLimit(urlLimit);
    setSearchTerm(urlSearch);
    setSortOrder(urlSortDirection === 'desc' ? 'newest' : 'oldest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (monthFilter) params.set('month', monthFilter);
    if (yearFilter) params.set('year', yearFilter);
    if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (sortOrder !== 'newest') params.set('sort_direction', sortOrder === 'newest' ? 'desc' : 'asc');

    // Only update URL if parameters have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [monthFilter, yearFilter, statusFilter, currentPage, limit, searchTerm, sortOrder, setSearchParams, searchParams]);

  // Load booking list with proper pagination
  const { data: apiResponse, isLoading, isFetching } = useGetFoodDrinkBookingsQuery({
    page: currentPage,
    limit: limit,
    status: statusFilter,
    month: monthFilter,
    year: yearFilter,
    sort_direction: sortOrder === 'newest' ? 'desc' : 'asc',
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

  // --- HANDLER FUNCTIONS ---
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, yearFilter, statusFilter, sortOrder]);

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

          {/* Sort Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSortToggle}
              className="btn btn-outline btn-sm gap-2"
              title={sortOrder === 'newest' ? 'Sort by Oldest Created First' : 'Sort by Newest Created First'}
            >
              {sortOrder === 'newest' ? (
                <>
                  <ChevronDownIcon className="h-4 w-4" />
                  Newest
                </>
              ) : (
                <>
                  <ChevronUpIcon className="h-4 w-4" />
                  Oldest
                </>
              )}
            </button>
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
                monthFilter={monthFilter}
                setMonthFilter={setMonthFilter}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                showMonthFilter={true}
                showYearFilter={true}
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

            {/* Table Information */}
            <div className="text-center mb-4">
              <div className="text-sm text-base-content/70 mb-2">
                {isLoading || isFetching ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    Showing {filteredBookings.length} of{' '}
                    {paginationData.total} bookings
                    {(monthFilter || yearFilter) && (
                      <> for {monthFilter && yearFilter ? `${monthFilter}/${yearFilter}` : monthFilter ? `month ${monthFilter}` : `year ${yearFilter}`}</>
                    )}
                  </span>
                )}
              </div>

              {/* Show filtered count when searching */}
              {debouncedSearchTerm.trim() && (
                <div className="text-sm text-info">
                  Found {filteredBookings.length} F&B orders matching "{debouncedSearchTerm}"
                </div>
              )}
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

