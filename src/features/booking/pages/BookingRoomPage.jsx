import React, { useState, useEffect, useMemo /* , useRef */ } from 'react';
import { useGetBookingsQuery, /* useDeleteBookingMutation, useUpdateBookingMutation */ } from '../api/bookingApiSlice';
import useDebounce from '../../../hooks/useDebounce';
// import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from '../../../components/common/TableControls';
import Pagination from '../../../components/common/Pagination';
import BookingTable from '../components/BookingTable';
import AddBookingModal from '../components/AddBookingModal';
// import ConfirmationModal from '../../../components/common/ConfirmationModal';
// import RescheduleModal from '../components/RescheduleModal';
import RefundModal from '../components/RefundModal';

const BookingRoomPage = () => {
  // --- STATE MANAGEMENT ---
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  // State untuk mengontrol semua modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  // const [bookingToDelete, setBookingToDelete] = useState(null);
  // const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  // const [bookingToReschedule, setBookingToReschedule] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState(null);
  // const [bookingToCancel, setBookingToCancel] = useState(null);

  // Ref untuk modal konfirmasi
  // const deleteModalRef = useRef(null);
  // const cancelModalRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = ['All', 'Confirmed', 'Finished']; // Reschedule & cancelled comment out

  // --- RTK QUERY HOOKS ---
  const {
    data: allBookings, // Ini berisi SEMUA booking yang cocok dengan filter backend
    isLoading,
    isFetching
  } = useGetBookingsQuery({
    month: monthFilter,
    status: statusFilter,
  });

  // const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  // const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

  // --- LOGIKA PENCARIAN & PAGINASI DI FRONTEND ---
  const { paginatedBookings, totalPages } = useMemo(() => {
    if (!allBookings) {
      return { paginatedBookings: [], totalPages: 1 };
    }

    // Filter berdasarkan search term
    let filtered = [...allBookings]; // Create a new array to avoid read-only issues

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

    // Filter berdasarkan month (jika ada)
    if (monthFilter) {
      filtered = filtered.filter(booking => {
        if (!booking.rawBooking?.start_time) return false;

        try {
          const bookingDate = parseISO(booking.rawBooking.start_time);
          const bookingMonth = format(bookingDate, 'yyyy-MM');
          return bookingMonth === monthFilter;
        } catch (error) {
          console.error('Error parsing date:', error);
          return false;
        }
      });
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

    // Hitung pagination
    const total = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    return { paginatedBookings: paginated, totalPages: total };
  }, [allBookings, debouncedSearchTerm, monthFilter, currentPage, limit, sortOrder]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setEditingData(booking);
    setIsAddEditModalOpen(true);
  };

  const handleCloseAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setTimeout(() => { setEditingData(null); }, 300);
  };

  const handleSuccessSubmit = () => {
    handleCloseAddEditModal();
    setSearchTerm('');
    setMonthFilter('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleOpenDeleteModal = (/* booking */) => {
    // setBookingToDelete(booking);
    // deleteModalRef.current?.showModal();
  };

  // const handleConfirmDelete = async () => {
  //   // if (!bookingToDelete) return;
  //   // try {
  //   //   await deleteBooking(bookingToDelete.id).unwrap();
  //   //   toast.success('Booking berhasil dihapus!');
  //   //   deleteModalRef.current?.close();
  //   // } catch (err) {
  //   //   toast.error('Gagal menghapus booking.');
  //   //   console.error('Gagal menghapus booking:', err);
  //   // }
  // };

  const handleOpenRescheduleModal = (/* booking */) => {
    // setBookingToReschedule(booking);
    // setIsRescheduleModalOpen(true);
  };
  // const handleCloseRescheduleModal = () => {
  //   // setIsRescheduleModalOpen(false);
  //   // setTimeout(() => setBookingToReschedule(null), 300);
  // };

  const handleOpenRefundModal = (booking) => {
    setBookingToRefund(booking);
    setIsRefundModalOpen(true);
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setTimeout(() => setBookingToRefund(null), 300);
  };

  const handleOpenCancelModal = (/* booking */) => {
    // setBookingToCancel(booking);
    // cancelModalRef.current?.showModal();
  };

  // const handleConfirmCancel = async () => {
  //   // if (!bookingToCancel) return;
  //   // try {
  //   //   const payload = { id: bookingToCancel.id, status: 'cancelled' };
  //   //   await updateBooking(payload).unwrap();
  //   //   toast.success('Booking berhasil dibatalkan!');
  //   //   cancelModalRef.current?.close();
  //   // } catch (err) {
  //   //   toast.error(err.data?.message || 'Gagal membatalkan booking.');
  //   // }
  // };

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
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onReschedule={handleOpenRescheduleModal}
            onCancel={handleOpenCancelModal}
            onRefund={handleOpenRefundModal}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddBookingModal isOpen={isAddEditModalOpen} onClose={handleCloseAddEditModal} editingData={editingData} onFormSubmit={handleSuccessSubmit} />
      {/* <RescheduleModal isOpen={isRescheduleModalOpen} onClose={handleCloseRescheduleModal} bookingData={bookingToReschedule} /> */}
      <RefundModal isOpen={isRefundModalOpen} onClose={handleCloseRefundModal} bookingData={bookingToRefund} />
      {/* <ConfirmationModal ref={deleteModalRef} title="Konfirmasi Hapus" onConfirm={handleConfirmDelete} isLoading={isDeleting}>
        <p>Apakah Anda yakin ingin menghapus booking No. <span className="font-bold">{bookingToDelete?.noTransaction}</span>?</p>
      </ConfirmationModal>
      <ConfirmationModal ref={cancelModalRef} title="Konfirmasi Pembatalan" onConfirm={handleConfirmCancel} isLoading={isUpdating}>
        <p>Apakah Anda yakin ingin membatalkan booking No. <span className="font-bold">{bookingToCancel?.noTransaction}</span>?</p>
      </ConfirmationModal> */}
    </>
  );
};

export default BookingRoomPage;
