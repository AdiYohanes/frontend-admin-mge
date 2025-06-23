import React, { useState, useRef } from "react";
import {
  useGetFeaturedGamesQuery,
  useDeleteFeaturedGameMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditFeaturedGameModal from "./AddEditFeaturedGameModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import FeaturedGameTable from "./FeaturedGameTable";

const FeaturedGameManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading } = useGetFeaturedGamesQuery();
  const [deleteGame, { isLoading: isDeleting }] =
    useDeleteFeaturedGameMutation();

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
      await deleteGame(itemToDelete.id).unwrap();
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
        addButtonText="Add Featured Games"
        showMonthFilter={false}
      />
      <FeaturedGameTable
        games={data?.games}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AddEditFeaturedGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Featured Games"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>Yakin ingin menghapus baris ini?</p>
      </ConfirmationModal>
    </>
  );
};

export default FeaturedGameManagement;
