import React, { useState, useRef } from "react";
import {
  useGetFeaturedRoomsQuery,
  useDeleteFeaturedRoomMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditFeaturedRoomModal from "./AddEditFeaturedRoomModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import FeaturedRoomTable from "./FeaturedRoomTable";

const FeaturedRoomManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading } = useGetFeaturedRoomsQuery();
  const [deleteRoom, { isLoading: isDeleting }] =
    useDeleteFeaturedRoomMutation();

  const handleEdit = (item) => {
    setEditingData(item);
    setIsModalOpen(true);
  };
  const handleAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };
  const handleDelete = (item) => {
    setItemToDelete(item);
    deleteModalRef.current?.showModal();
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteRoom(itemToDelete.id).unwrap();
      toast.success("Item berhasil dihapus.");
      deleteModalRef.current?.close();
    } catch {
      toast.error("Gagal menghapus item.");
    }
  };

  return (
    <>
      <TableControls
        onAddClick={handleAdd}
        addButtonText="Add Featured Room"
        showMonthFilter={false}
      />
      <FeaturedRoomTable
        rooms={data?.rooms}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AddEditFeaturedRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Featured Room"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Yakin ingin menghapus{" "}
          <span className="font-bold">"{itemToDelete?.title}"</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};
export default FeaturedRoomManagement;
