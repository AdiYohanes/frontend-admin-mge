import React, { useState, useEffect, useMemo } from 'react';
import { useGetBookingsQuery, useGetBookingDetailQuery } from '../api/bookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';
import { ChevronUpIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router'
// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from '../../../components/common/TableControls';
import Pagination from '../../../components/common/Pagination';
import BookingTable from '../components/BookingTable';
import RefundModal from '../components/RefundModal';
import BookingDetailModal from '../components/BookingDetailModal';
import DatePickerModal from '../../../components/common/DatePickerModal';

const BookingRoomPage = () => {
  // --- URL PARAMETER MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE MANAGEMENT ---
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  // State untuk date picker modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Navigation hook

  // State untuk mengontrol modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = ['All', 'pending', 'confirmed', 'cancelled', 'completed'];

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
    params.set('sort_direction', sortOrder === 'newest' ? 'desc' : 'asc');

    // Only update URL if parameters have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();

    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [monthFilter, yearFilter, statusFilter, currentPage, limit, searchTerm, sortOrder, setSearchParams, searchParams]);

  // --- RTK QUERY HOOKS ---
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch
  } = useGetBookingsQuery(
    {
      month: monthFilter,
      year: yearFilter,
      status: statusFilter,
      page: currentPage,
      per_page: limit,
      sort_direction: 'desc', // Default to newest first
    },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  // Booking detail query
  const {
    data: bookingDetail,
    isLoading: isDetailLoading,
    error: detailError
  } = useGetBookingDetailQuery(selectedBookingId, {
    skip: !selectedBookingId,
  });

  // Extract data dari response
  const allBookings = useMemo(() => apiResponse?.bookings || [], [apiResponse?.bookings]);
  const paginationInfo = useMemo(() => apiResponse?.pagination || {}, [apiResponse?.pagination]);

  // Debug: Log data yang diterima dari API
  useEffect(() => {
    // noop: keep effect for potential future side-effects
  }, [allBookings, paginationInfo, monthFilter, yearFilter, statusFilter]);

  // --- LOGIKA PENCARIAN & PAGINASI DI FRONTEND ---
  const { paginatedBookings, totalPages, totalFiltered } = useMemo(() => {
    if (!allBookings) {
      return { paginatedBookings: [], totalPages: 1, totalFiltered: 0 };
    }

    console.log('🔍 DEBUG - Pagination Logic:', {
      allBookingsLength: allBookings.length,
      limit: limit,
      currentPage: currentPage,
      searchTerm: debouncedSearchTerm,
      paginationInfo: paginationInfo
    });

    // Filter berdasarkan search term
    let filtered = [...allBookings];

    // Only do client-side filtering for search term since month/year filtering is now handled by backend
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchLower) ||
        booking.noTransaction.toLowerCase().includes(searchLower) ||
        booking.phoneNumber.toLowerCase().includes(searchLower) ||
        booking.room.toLowerCase().includes(searchLower) ||
        booking.unit.toLowerCase().includes(searchLower) ||
        booking.console.toLowerCase().includes(searchLower)
      );
    }

    // Sorting is now handled by backend via sort_direction parameter

    // Use backend pagination when no search term is applied
    if (!debouncedSearchTerm.trim()) {
      // Use data directly from API (already paginated by backend)
      const calculatedTotalPages = paginationInfo.last_page || Math.ceil(paginationInfo.total / limit) || 1;

      console.log('🔍 DEBUG - Backend Pagination:', {
        filteredLength: filtered.length,
        calculatedTotalPages: calculatedTotalPages,
        paginationInfo: paginationInfo
      });

      return {
        paginatedBookings: filtered,
        totalPages: calculatedTotalPages,
        totalFiltered: filtered.length
      };
    }

    // If there's a search term, do frontend pagination
    const total = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    console.log('🔍 DEBUG - Frontend Pagination:', {
      filteredLength: filtered.length,
      totalPages: total,
      paginatedLength: paginated.length
    });

    return {
      paginatedBookings: paginated,
      totalPages: total,
      totalFiltered: filtered.length
    };
  }, [allBookings, debouncedSearchTerm, currentPage, limit, paginationInfo]);

  // Debug: Log totalPages untuk memastikan tombol pagination muncul
  useEffect(() => {
    // noop: keep effect for potential future side-effects
  }, [totalPages, currentPage, limit, paginationInfo, debouncedSearchTerm]);

  // Debug: Log perubahan limit dan currentPage
  useEffect(() => {
    // noop: keep effect for potential future side-effects
  }, [limit, currentPage, monthFilter, yearFilter, statusFilter]);

  // Auto-refresh status indicator
  useEffect(() => {
    // noop: keep effect for potential future side-effects
  }, [isFetching]);

  // Show last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  useEffect(() => {
    if (!isFetching && apiResponse) {
      setLastRefreshTime(new Date());
    }
  }, [isFetching, apiResponse]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenAddModal = () => {
    // Get admin token from localStorage or sessionStorage
    const adminToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Get frontend URL from environment variable
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    const fullFrontendUrl = `${frontendUrl}/rent`;
    const newWindow = window.open(fullFrontendUrl, '_blank');

    // Send token via PostMessage after window opens
    if (adminToken && newWindow) {
      setTimeout(() => {
        try {
          newWindow.postMessage({
            type: 'AUTO_LOGIN',
            token: adminToken,
            source: 'admin_panel'
          }, frontendUrl);
        } catch (error) {
          console.error('Failed to send token via PostMessage:', error);
        }
      }, 1000); // Wait 1 second for window to fully load
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBookingId(booking.id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBookingId(null);
  };

  const handleOpenRefundModal = (booking) => {
    setBookingToRefund(booking);
    setIsRefundModalOpen(true);
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setTimeout(() => setBookingToRefund(null), 300);
  };

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

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-2xl">Room Booking List</h2>
            <div className="flex items-center gap-2">
              {/* Auto-refresh indicator */}
              {isFetching && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-gold"></div>
                  <span>Refreshing...</span>
                </div>
              )}

              {/* Last refresh time */}
              {!isFetching && (
                <div className="text-xs text-gray-500">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}

              {/* Manual refresh button */}
              <button
                onClick={() => refetch()}
                className="btn btn-outline btn-sm"
                title="Refresh data"
                disabled={isFetching}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

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

          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map(tab => (
              <a key={tab} className={`tab tab-sm sm:tab-md ${statusFilter === tab ? 'tab-active' : ''}`} onClick={() => setStatusFilter(tab)}>
                {tab === 'All' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search and Limit Controls */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="input input-bordered input-sm w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-control">
                <select
                  className="select select-bordered select-sm"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            {/* Date Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
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

            {/* Add Button */}
            <div className="form-control">
              <button
                onClick={handleOpenAddModal}
                className="btn btn-sm bg-brand-gold text-white border-none hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
                aria-label="Add OTS Booking"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenAddModal();
                  }
                }}
              >
                Add OTS Booking
              </button>
            </div>
          </div>

          <BookingTable
            bookings={paginatedBookings}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onViewDetails={handleViewDetails}
            onRefund={handleOpenRefundModal}
          />

          {/* Show total count from API */}
          {!debouncedSearchTerm.trim() && paginationInfo.total > 0 && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Showing {allBookings.length} of {paginationInfo.total} bookings
              {(monthFilter || yearFilter) && (
                <> for {monthFilter && yearFilter ? `${monthFilter}/${yearFilter}` : monthFilter ? `month ${monthFilter}` : `year ${yearFilter}`}</>
              )}
            </div>
          )}
          {/* Show filtered count when searching */}
          {debouncedSearchTerm.trim() && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Found {totalFiltered || 0} bookings matching "{debouncedSearchTerm}"
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <RefundModal isOpen={isRefundModalOpen} onClose={handleCloseRefundModal} bookingData={bookingToRefund} />

      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        bookingData={bookingDetail}
        isLoading={isDetailLoading}
        error={detailError}
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

export default BookingRoomPage;
