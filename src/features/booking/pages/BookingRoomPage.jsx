import React, { useState, useEffect, useMemo } from 'react';
import { useGetBookingsQuery, useGetBookingDetailQuery } from '../api/bookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';
import { parseISO } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';

// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from '../../../components/common/TableControls';
import Pagination from '../../../components/common/Pagination';
import BookingTable from '../components/BookingTable';
import RefundModal from '../components/RefundModal';
import BookingDetailModal from '../components/BookingDetailModal';

const BookingRoomPage = () => {
  // --- STATE MANAGEMENT ---
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  // Navigation hook
  const navigate = useNavigate();

  // State untuk mengontrol modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = ['All', 'Confirmed', 'Pending', 'Completed'];

  // --- RTK QUERY HOOKS ---
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch
  } = useGetBookingsQuery({
    month: monthFilter,
    status: statusFilter,
    page: currentPage,
    per_page: limit,
  }, {
    // Auto refresh setiap 30 detik
    pollingInterval: 30000,
    // Refetch ketika window focus kembali
    refetchOnFocus: true,
    // Refetch ketika reconnect
    refetchOnReconnect: true,
    // Refetch ketika mount
    refetchOnMountOrArgChange: true,
  });

  // Booking detail query
  const {
    data: bookingDetail,
    isLoading: isDetailLoading,
    error: detailError
  } = useGetBookingDetailQuery(selectedBookingId, {
    skip: !selectedBookingId,
  });

  // Extract data dari response
  const allBookings = apiResponse?.bookings || [];
  const paginationInfo = apiResponse?.pagination || {};

  // Debug: Log data yang diterima dari API
  useEffect(() => {
    console.log('🔍 DEBUG - Data dari API:', {
      totalBookings: allBookings?.length || 0,
      paginationInfo,
      monthFilter,
      statusFilter,
      allBookings: allBookings
    });
  }, [allBookings, paginationInfo, monthFilter, statusFilter]);

  // --- LOGIKA PENCARIAN & PAGINASI DI FRONTEND ---
  const { paginatedBookings, totalPages } = useMemo(() => {
    if (!allBookings) {
      return { paginatedBookings: [], totalPages: 1 };
    }

    // Filter berdasarkan search term
    let filtered = [...allBookings];

    // Debug: Log sebelum filtering
    console.log('🔍 DEBUG - Sebelum filtering:', {
      totalBookings: filtered.length,
      searchTerm: debouncedSearchTerm,
      monthFilter
    });

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

    // Sort berdasarkan tanggal
    filtered.sort((a, b) => {
      try {
        const dateA = parseISO(a.rawBooking?.start_time || a.tanggalBooking);
        const dateB = parseISO(b.rawBooking?.start_time || b.tanggalBooking);

        if (sortOrder === 'newest') {
          return dateB - dateA; // Newest first
        } else {
          return dateA - dateB; // Oldest first
        }
      } catch (error) {
        console.error('Error sorting dates:', error);
        return 0;
      }
    });

    // PERBAIKAN: Gunakan pagination dari backend jika tidak ada search term
    if (!debouncedSearchTerm.trim()) {
      // Jika tidak ada search, gunakan data langsung dari API (sudah dipaginasi di backend)
      const calculatedTotalPages = paginationInfo.last_page || Math.ceil(paginationInfo.total / limit) || 1;

      console.log('🔍 DEBUG - Backend pagination:', {
        paginationTotal: paginationInfo.total,
        lastPage: paginationInfo.last_page,
        limit,
        calculatedTotalPages,
        currentPage,
        allBookingsLength: allBookings.length,
        paginationInfo: paginationInfo
      });

      return {
        paginatedBookings: filtered,
        totalPages: calculatedTotalPages
      };
    }

    // Jika ada search term, lakukan pagination di frontend
    const total = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    // Debug: Log setelah filtering dan pagination
    console.log('🔍 DEBUG - Frontend pagination (with search):', {
      filteredCount: filtered.length,
      paginatedCount: paginated.length,
      currentPage,
      limit,
      totalPages: total,
      hasSearchTerm: !!debouncedSearchTerm.trim(),
      paginationTotal: paginationInfo.total
    });

    return { paginatedBookings: paginated, totalPages: total };
  }, [allBookings, debouncedSearchTerm, monthFilter, currentPage, limit, sortOrder, paginationInfo]);

  // Debug: Log totalPages untuk memastikan tombol pagination muncul
  useEffect(() => {
    console.log('🔍 DEBUG - Pagination info:', {
      totalPages,
      currentPage,
      limit,
      paginationInfo,
      hasSearchTerm: !!debouncedSearchTerm.trim()
    });
  }, [totalPages, currentPage, limit, paginationInfo, debouncedSearchTerm]);

  // Debug: Log perubahan limit dan currentPage
  useEffect(() => {
    console.log('🔍 DEBUG - State changes:', {
      limit,
      currentPage,
      monthFilter,
      statusFilter
    });
  }, [limit, currentPage, monthFilter, statusFilter]);

  // Auto-refresh status indicator
  useEffect(() => {
    if (isFetching) {
      console.log('🔄 Auto-refreshing booking data...');
    }
  }, [isFetching]);

  // Show last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  useEffect(() => {
    if (!isFetching && apiResponse) {
      setLastRefreshTime(new Date());
      console.log('✅ Data refreshed successfully');
    }
  }, [isFetching, apiResponse]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenAddModal = () => {
    // Redirect to specific URL for OTS booking
    window.open('http://f0w8ssgc0kw4gkc08s04448o.168.231.84.221.sslip.io/rent', '_blank');
  };

  const handleViewDetails = (booking) => {
    console.log('View details for booking:', booking);
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, statusFilter, sortOrder]);

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
                title={sortOrder === 'newest' ? 'Sort by Oldest First' : 'Sort by Newest First'}
              >
                {sortOrder === 'newest' ? (
                  <>
                    <ChevronDownIcon className="h-4 w-4" />
                    Newest First
                  </>
                ) : (
                  <>
                    <ChevronUpIcon className="h-4 w-4" />
                    Oldest First
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map(tab => (
              <a key={tab} className={`tab tab-sm sm:tab-md ${statusFilter === tab ? 'tab-active' : ''}`} onClick={() => setStatusFilter(tab)}>{tab}</a>
            ))}
          </div>

          <TableControls
            limit={limit} setLimit={setLimit} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            monthFilter={monthFilter} setMonthFilter={setMonthFilter}
            onAddClick={handleOpenAddModal} addButtonText="Add OTS Booking"
          />

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
            </div>
          )}
          {/* Show filtered count when searching */}
          {debouncedSearchTerm.trim() && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Found {paginatedBookings.length} bookings matching "{debouncedSearchTerm}"
            </div>
          )}

          {/* Debug: Log pagination info sebelum render */}
          {console.log('🔍 DEBUG - Rendering Pagination:', {
            currentPage,
            totalPages,
            paginatedBookings: paginatedBookings.length,
            limit,
            paginationInfo: paginationInfo,
            hasSearchTerm: !!debouncedSearchTerm.trim()
          })}

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
    </>
  );
};

export default BookingRoomPage;
