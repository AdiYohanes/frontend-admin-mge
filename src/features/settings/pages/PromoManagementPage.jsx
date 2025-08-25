import React, { useState, useRef } from "react";
import {
  useGetPromosQuery,
  useDeletePromoMutation,
} from "../api/settingsApiSlice";
import useDebounce from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";

import TableControls from "../../../components/common/TableControls";
import Pagination from "../../../components/common/Pagination";
import PromoTable from "../components/PromoTable";
import AddEditPromoModal from "../components/AddEditPromoModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const PromoManagementPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State untuk mengontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading, isFetching } = useGetPromosQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
  });

  const [deletePromo, { isLoading: isDeleting }] = useDeletePromoMutation();

  // Handlers untuk semua aksi CRUD
  const handleOpenAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promoData) => {
    setEditingData(promoData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleOpenDeleteModal = (promoData) => {
    setPromoToDelete(promoData);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePromo(promoToDelete.id).unwrap();
      toast.success("Promo berhasil dihapus!");
      deleteModalRef.current?.close();
    } catch (err) {
      toast.error("Gagal menghapus promo.");
      console.error("Delete promo error:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Promo Management</h2>
          <TableControls
            limit={limit}
            setLimit={setLimit}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={handleOpenAddModal}
            addButtonText="Add Promo"
            showMonthFilter={false}
          />
          <PromoTable
            promos={data?.promos}
            isLoading={isLoading || isFetching}
            page={currentPage}
            limit={limit}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
          <Pagination
            currentPage={data?.currentPage || currentPage}
            totalPages={data?.totalPages || 1}
            onPageChange={setCurrentPage}
          />

          {/* Show pagination info */}
          {data?.total > 0 && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Showing {data.from} to {data.to} of {data.total} promos
            </div>
          )}
        </div>
      </div>

      <AddEditPromoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingData={editingData}
      />
      <ConfirmationModal
        ref={deleteModalRef}
        title="Konfirmasi Hapus Promo"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus promo{" "}
          <span className="font-bold font-mono">{promoToDelete?.promo_code}</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default PromoManagementPage;
