import React, { useState, useRef } from "react";
import {
  useGetFeaturedConsolesQuery,
  useDeleteFeaturedConsoleMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditFeaturedConsoleModal from "./AddEditFeaturedConsoleModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import FeaturedConsoleTable from "./FeaturedConsoleTable";

const FeaturedConsoleManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading } = useGetFeaturedConsolesQuery();
  const [deleteConsole, { isLoading: isDeleting }] =
    useDeleteFeaturedConsoleMutation();

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
      await deleteConsole(itemToDelete.id).unwrap();
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
        addButtonText="Add Featured Console"
        showMonthFilter={false}
      />
      <FeaturedConsoleTable
        consoles={data?.consoles}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AddEditFeaturedConsoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Featured Console"
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

export default FeaturedConsoleManagement;
