import React, { useState, useEffect, useMemo } from 'react';
import { useGetFoodDrinkBookingsQuery } from '../api/foodDrinkBookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';
import { ChevronUpIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';

import TableControls from '../../../components/common/TableControls';
import FoodDrinkTable from '../components/FoodDrinkTable';
import Pagination from '../../../components/common/Pagination';
import PrintPreviewModal from '../components/PrintPreviewModal';
import FoodDrinkDetailModal from '../components/FoodDrinkDetailModal';
import DatePickerModal from '../../../components/common/DatePickerModal';

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

  // State untuk date picker modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

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
    const urlSortDirection = searchParams.get('sortOrder') || 'desc';

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
    params.set('sortOrder', sortOrder === 'newest' ? 'desc' : 'asc');

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


  // Use bookings directly from API response (already transformed)
  const bookings = useMemo(() => {
    return apiResponse?.bookings || [];
  }, [apiResponse?.bookings]);


  // Filter data berdasarkan search term di frontend
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];


    // Filter berdasarkan search term
    const filtered = bookings.filter(booking =>
      booking.noTransaction.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      booking.orderName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (booking.notes && booking.notes.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );


    return filtered;
  }, [bookings, debouncedSearchTerm]);


  // Use pagination data from API response
  const paginationData = useMemo(() => {
    return apiResponse?.pagination || {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: limit
    };
  }, [apiResponse?.pagination, limit]);


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

  // Date picker handlers
  const handleDateSelect = (date) => {
    if (date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      setMonthFilter(month);
      setYearFilter(year);
      setSelectedMonth(date);
      setSelectedYear(date);
    } else {
      setMonthFilter('');
      setYearFilter('');
      setSelectedMonth(null);
      setSelectedYear(null);
    }
  };

  const handleClearFilters = () => {
    setMonthFilter('');
    setYearFilter('');
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, yearFilter, statusFilter, sortOrder]);

  const statusTabs = [
    { value: "All", label: "All" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Pending", label: "Pending" }
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

            {/* Custom Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Show Entries Controls - Left Side */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-base-content">Show</span>
                <select
                  className="select select-bordered select-sm"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-sm text-base-content">entries</span>
              </div>

              {/* Search and Filter Controls - Right Side */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1 justify-end">
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Search by invoice number or order..."
                    className="input input-bordered input-sm w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {monthFilter && yearFilter ? `Filter: ${monthFilter}/${yearFilter}` : 'Filter'}
                  </button>
                </div>
                {(monthFilter || yearFilter) && (
                  <div className="form-control">
                    <button
                      onClick={handleClearFilters}
                      className="btn btn-ghost btn-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
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

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedDate={selectedMonth || selectedYear}
        onDateSelect={handleDateSelect}
        title="Select Date Filter"
        yearRange={20}
      />
    </>
  );
};

export default FoodDrinkBookingPage;

