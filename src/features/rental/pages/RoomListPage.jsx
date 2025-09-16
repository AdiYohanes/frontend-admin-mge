import React, { useState, useRef, useEffect, useMemo } from "react";
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
    search: "", // Always fetch all data for frontend filtering
  });

  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const [orderedRooms, setOrderedRooms] = useState([]);

  // Frontend pagination for filtered results
  const { paginatedRooms, paginationData } = useMemo(() => {
    const allRooms = data?.rooms || [];

    // If no search term, use backend pagination but calculate from/to correctly
    if (!debouncedSearchTerm.trim()) {
      const total = data?.total || allRooms.length;
      const currentPageNum = data?.currentPage || currentPage;
      const totalPages = data?.totalPages || Math.ceil(total / limit);
      const from = ((currentPageNum - 1) * limit) + 1;
      const to = Math.min(currentPageNum * limit, total);

      return {
        paginatedRooms: allRooms,
        paginationData: {
          currentPage: currentPageNum,
          totalPages,
          total,
          perPage: limit,
          from,
          to
        }
      };
    }

    // Frontend filtering and pagination
    const filteredRooms = allRooms.filter(room =>
      room.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRooms.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

    return {
      paginatedRooms,
      paginationData: {
        currentPage,
        totalPages,
        total: filteredRooms.length,
        perPage: limit,
        from: filteredRooms.length > 0 ? startIndex + 1 : 0,
        to: Math.min(endIndex, filteredRooms.length)
      }
    };
  }, [data, debouncedSearchTerm, currentPage, limit]);

  useEffect(() => {
    if (paginatedRooms) {
      setOrderedRooms(paginatedRooms);
    }
  }, [paginatedRooms]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            </SortableContext>
          </DndContext>

          {/* Table Information */}
          <div className="text-center mb-4">
            <div className="text-sm text-base-content/70 mb-2">
              {isLoading || isFetching ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {debouncedSearchTerm.trim() ? (
                    <>
                      {paginationData.total} room{paginationData.total !== 1 ? 's' : ''} matching "{debouncedSearchTerm}"
                    </>
                  ) : (
                    <>
                      Showing {paginationData.total} of {paginationData.total} rooms
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
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
