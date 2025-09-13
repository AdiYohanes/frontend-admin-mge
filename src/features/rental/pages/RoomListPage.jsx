import React, { useState, useRef, useEffect } from "react";
import { useGetRoomsQuery, useDeleteRoomMutation } from "../api/rentalApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import RoomTable from "../components/RoomTable";
import AddEditRoomModal from "../components/AddEditRoomModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const RoomListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading, isFetching } = useGetRoomsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const [orderedRooms, setOrderedRooms] = useState([]);

  useEffect(() => {
    if (data?.rooms) {
      console.log('API Data:', {
        rooms: data.rooms,
        roomsLength: data.rooms.length,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        limit: limit,
        searchTerm: debouncedSearchTerm
      });
      setOrderedRooms(data.rooms);
    }
  }, [data?.rooms, limit, debouncedSearchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedRooms((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        console.log('Drag and drop:', {
          oldIndex,
          newIndex,
          originalLength: items.length,
          newLength: newItems.length
        });
        return newItems;
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (roomData) => {
    setEditingData(roomData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (roomData) => {
    setRoomToDelete(roomData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteRoom(roomToDelete.id).unwrap();
      toast.success("Ruangan berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus ruangan.");
      console.error("Failed to delete room:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Room Management</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Room"
            showMonthFilter={false}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedRooms}
              strategy={verticalListSortingStrategy}
            >
              <RoomTable
                rooms={orderedRooms} // Gunakan state lokal
                isLoading={isLoading || isFetching}
                page={currentPage}
                limit={limit}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-2">
                Debug: Showing {orderedRooms.length} of {data?.rooms?.length || 0} rooms (limit: {limit})
              </div>
            </SortableContext>
          </DndContext>
          <Pagination
            currentPage={currentPage}
            totalPages={data?.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddEditRoomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Ruangan"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus ruangan{" "}
          <span className="font-bold">{roomToDelete?.name}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default RoomListPage;
