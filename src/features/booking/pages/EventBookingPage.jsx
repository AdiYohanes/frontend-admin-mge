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
import AddEventModal from "../components/AddEventModal";
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
    "Confirmed",
    "Pending",
    "Cancelled",
  ];

  const { data, isLoading, isFetching } = useGetEventBookingsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
    status: statusFilter,
  });

  // Debug: Log the data received from API
  console.log('EventBookingPage - API data:', data);
  console.log('EventBookingPage - isLoading:', isLoading);
  console.log('EventBookingPage - isFetching:', isFetching);

  const [deleteEventBooking, { isLoading: isDeleting }] =
    useDeleteEventBookingMutation();

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
  }, [limit, debouncedSearchTerm, statusFilter]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Event Booking List</h2>
          <div className="tabs tabs-boxed mb-4 bg-base-200 self-start">
            {statusTabs.map((tab) => (
              <a
                key={tab}
                className={`tab tab-sm sm:tab-md ${statusFilter === tab ? "tab-active" : ""
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
            onAddClick={handleOpenAddModal}
            addButtonText="Add Event"
            showMonthFilter={false}
          />
          <EventBookingTable
            events={data?.bookings}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
          <Pagination
            currentPage={data?.currentPage}
            totalPages={data?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <AddEventModal
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
