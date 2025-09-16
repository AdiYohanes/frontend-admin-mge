import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useGetEventBookingsQuery,
  useDeleteEventBookingMutation,
} from "../api/eventBookingApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";
import { ChevronUpIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import EventBookingTable from "../components/EventBookingTable";
import AddEditEventModal from "../components/AddEditEventModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import DatePickerModal from "../../../components/common/DatePickerModal";

const EventBookingPage = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // State untuk date picker modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = [
    "All",
    "confirmed",
    "pending",
    "cancelled",
  ];

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

  const { data, isLoading, isFetching, error } = useGetEventBookingsQuery({
    page: currentPage,
    limit: limit,
    search: debouncedSearchTerm,
    status: statusFilter,
    month: monthFilter,
    year: yearFilter,
    sort_direction: 'desc', // Default to newest first
  });

  // Debug: Log the data received from API
  console.log('EventBookingPage - API data:', data);
  console.log('EventBookingPage - isLoading:', isLoading);
  console.log('EventBookingPage - isFetching:', isFetching);
  console.log('EventBookingPage - error:', error);
  console.log('EventBookingPage - bookings from data:', data?.bookings);
  console.log('EventBookingPage - events from data:', data?.events);

  const [deleteEventBooking, { isLoading: isDeleting }] =
    useDeleteEventBookingMutation();

  // Use data directly from API (already transformed by API slice)
  const bookings = useMemo(() => data?.bookings || [], [data?.bookings]);
  const events = useMemo(() => data?.events || [], [data?.events]);
  const paginationData = useMemo(() => data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10
  }, [data?.pagination]);

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

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingData(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (event) => {
    setEventToDelete(event);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEventBooking(eventToDelete.rawEvent?.id || eventToDelete.id).unwrap();
      toast.success("Event booking berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus event booking.");
      console.error("Delete event booking error:", err);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, yearFilter, statusFilter, sortOrder]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="card-title text-2xl">Event Booking List</h2>

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

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Error loading data!</h3>
                <div className="text-xs">
                  {error?.data?.message || error?.message || 'Unknown error occurred'}
                </div>
                <div className="text-xs mt-1">
                  Check console for more details
                </div>
              </div>
            </div>
          )}
          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map((tab) => (
              <a
                key={tab}
                className={`tab tab-sm sm:tab-md ${statusFilter === tab ? "tab-active" : ""
                  }`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search and Limit Controls */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search by event name or invoice..."
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
                aria-label="Add Event"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenAddModal();
                  }
                }}
              >
                Add Event
              </button>
            </div>
          </div>
          <EventBookingTable
            events={bookings}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Table Information */}
          <div className="text-center mb-4">
            <div className="text-sm text-base-content/70 mb-2">
              {isLoading || isFetching ? (
                <span>Loading...</span>
              ) : (
                <span>
                  Showing {bookings.length} event bookings from{' '}
                  {events.length} events
                  {(monthFilter || yearFilter) && (
                    <> for {monthFilter && yearFilter ? `${monthFilter}/${yearFilter}` : monthFilter ? `month ${monthFilter}` : `year ${yearFilter}`}</>
                  )}
                </span>
              )}
            </div>

            {/* Show filtered count when searching */}
            {debouncedSearchTerm.trim() && (
              <div className="text-sm text-info">
                Found {bookings.length} event bookings from {events.length} events matching "{debouncedSearchTerm}"
              </div>
            )}
          </div>

          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <AddEditEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Event"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus event{" "}
          <span className="font-bold">"{eventToDelete?.eventName}"</span>?
        </p>
      </ConfirmationModal>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedDate={selectedMonth || selectedYear}
        onDateSelect={handleDateSelect}
        title="Select Date Filter"
        yearRange={5}
      />
    </>
  );
};

export default EventBookingPage;
