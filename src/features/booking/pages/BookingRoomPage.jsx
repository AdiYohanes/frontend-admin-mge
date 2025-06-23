/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  useGetBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
} from "../api/bookingApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

// Impor semua komponen yang dibutuhkan oleh halaman ini
import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import BookingTable from "../components/BookingTable";
import AddBookingModal from "../components/AddBookingModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import RescheduleModal from "../components/RescheduleModal";
import RefundModal from "../components/RefundModal";

const BookingRoomPage = () => {
  // --- STATE MANAGEMENT ---
  // State untuk filter dan paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // State untuk mengontrol semua modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Ref untuk modal konfirmasi
  const deleteModalRef = useRef(null);
  const cancelModalRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = [
    "All",
    "Ongoing",
    "Booking Success",
    "Finished",
    "Cancelled",
    "Rescheduled",
    "Refunded",
  ];

  // --- RTK QUERY HOOKS ---
  const { data, isLoading, isFetching, isError, error } = useGetBookingsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
    month: monthFilter,
    status: statusFilter,
  });

  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

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
    setTimeout(() => {
      setEditingData(null);
    }, 300);
  };

  const handleSuccessSubmit = () => {
    handleCloseAddEditModal();
    setSearchTerm("");
    setMonthFilter("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const handleOpenDeleteModal = (booking) => {
    setBookingToDelete(booking);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBooking(bookingToDelete.id).unwrap();
      toast.success("Booking berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus booking.");
      console.error("Delete booking error:", err);
    }
  };

  const handleOpenRescheduleModal = (booking) => {
    setBookingToReschedule(booking);
    setIsRescheduleModalOpen(true);
  };
  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setTimeout(() => setBookingToReschedule(null), 300);
  };

  const handleOpenRefundModal = (booking) => {
    setBookingToRefund(booking);
    setIsRefundModalOpen(true);
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setTimeout(() => setBookingToRefund(null), 300);
  };

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    cancelModalRef.current?.showModal();
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      const updatedBookingData = {
        ...bookingToCancel,
        statusBooking: "Cancelled",
      };
      await updateBooking(updatedBookingData).unwrap();
      toast.success("Booking berhasil dibatalkan!");
      cancelModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal membatalkan booking.");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [limit, debouncedSearchTerm, monthFilter, statusFilter]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Room Booking List</h2>

          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map((tab) => (
              <a
                key={tab}
                className={`tab tab-sm sm:tab-md ${
                  statusFilter === tab ? "tab-active" : ""
                }`}
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
            onAddClick={handleOpenAddModal}
            addButtonText="Add OTS Booking"
          />

          <BookingTable
            bookings={data?.bookings}
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
            currentPage={data?.currentPage}
            totalPages={data?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddBookingModal
        isOpen={isAddEditModalOpen}
        onClose={handleCloseAddEditModal}
        editingData={editingData}
        onFormSubmit={handleSuccessSubmit}
      />
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        bookingData={bookingToReschedule}
      />
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={handleCloseRefundModal}
        bookingData={bookingToRefund}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus booking No.{" "}
          <span className="font-bold">{bookingToDelete?.noTransaction}</span>?
        </p>
      </ConfirmationModal>

      <ConfirmationModal
        ref={cancelModalRef}
        title="Konfirmasi Pembatalan"
        onConfirm={handleConfirmCancel}
        isLoading={isUpdating}
      >
        <p>
          Apakah Anda yakin ingin membatalkan booking No.{" "}
          <span className="font-bold">{bookingToCancel?.noTransaction}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default BookingRoomPage;
