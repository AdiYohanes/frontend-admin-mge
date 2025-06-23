import React, { useState, useRef } from "react";
import { useGetFaqsQuery, useDeleteFaqMutation } from "../api/settingsApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import FaqTable from "../components/FaqTable";
import AddEditFaqModal from "../components/AddEditFaqModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const FaqManagementPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const deleteModalRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching } = useGetFaqsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faqData) => {
    setEditingData(faqData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (faqData) => {
    setFaqToDelete(faqData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFaq(faqToDelete.id).unwrap();
      toast.success("FAQ berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus FAQ.");
      console.error("Failed to delete FAQ:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">FAQ Management</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add FAQ"
            showMonthFilter={false}
          />
          <FaqTable
            faqs={data?.faqs}
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

      <AddEditFaqModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus FAQ"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus pertanyaan{" "}
          <span className="font-bold">"{faqToDelete?.question}"</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default FaqManagementPage;
