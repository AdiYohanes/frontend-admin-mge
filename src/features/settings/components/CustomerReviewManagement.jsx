import React, { useState, useRef } from "react";
import {
  useGetCustomerReviewsQuery,
  useDeleteCustomerReviewMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditCustomerReviewModal from "./AddEditCustomerReviewModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import CustomerReviewTable from "./CustomerReviewTable";

const CustomerReviewManagement = () => {
  // 1. STATE UNTUK MENGONTROL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading } = useGetCustomerReviewsQuery();
  const [deleteReview, { isLoading: isDeleting }] =
    useDeleteCustomerReviewMutation();

  // 2. HANDLER UNTUK MEMBUKA MODAL
  const handleEdit = (item) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReview(itemToDelete.id).unwrap();
      toast.success("Review berhasil dihapus.");
      deleteModalRef.current?.close();
    } catch {
      toast.error("Gagal menghapus review.");
    }
  };

  return (
    <>
      {/* Table controls without add button since add review is not available */}
      <TableControls
        showMonthFilter={false}
        showSearch={false}
      />

      <CustomerReviewTable
        reviews={data?.reviews || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 4. PASTIKAN MODAL DIRENDER DENGAN PROPS YANG BENAR */}
      <AddEditCustomerReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Customer Review"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Yakin ingin menghapus review dari{" "}
          <span className="font-bold">"{itemToDelete?.name}"</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default CustomerReviewManagement;
