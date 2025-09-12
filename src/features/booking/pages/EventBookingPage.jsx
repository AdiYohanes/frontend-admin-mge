import React, { useState, useRef, useEffect } from "react";
import {
  useGetEventBookingsQuery,
  useDeleteEventBookingMutation,
} from "../api/eventBookingApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import EventBookingTable from "../components/EventBookingTable";
import AddEditEventModal from "../components/AddEditEventModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const EventBookingPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const statusTabs = [
    "All",
    "confirmed",
    "pending",
    "cancelled",
  ];

  const { data, isLoading, isFetching, error } = useGetEventBookingsQuery({
    page: currentPage,
    limit: limit,
    search: "",
    status: "",
  });

  // Debug: Log the data received from API
  console.log('EventBookingPage - API data:', data);
  console.log('EventBookingPage - isLoading:', isLoading);
  console.log('EventBookingPage - isFetching:', isFetching);
  console.log('EventBookingPage - error:', error);

  const [deleteEventBooking, { isLoading: isDeleting }] =
    useDeleteEventBookingMutation();

  // Use data directly from API (backend handles filtering and pagination)
  const bookings = data?.bookings || [];
  const totalPages = data?.totalPages || 1;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Event Booking List</h2>

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
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Event"
            showMonthFilter={false}
          />
          <EventBookingTable
            events={bookings}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Show search results count when searching */}
          {debouncedSearchTerm.trim() && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Found {data?.total || 0} events matching "{debouncedSearchTerm}"
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
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
    </>
  );
};

export default EventBookingPage;
