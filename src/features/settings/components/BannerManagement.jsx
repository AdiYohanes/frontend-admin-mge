import React, { useState, useRef } from "react";
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
} from "../api/settingsApiSlice";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditBannerModal from "./AddEditBannerModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import BannerTable from "./BannerTable"; // Menggunakan komponen tabel yang baru

const BannerManagement = () => {
  // State untuk mengontrol modal Tambah/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // State dan Ref untuk mengontrol modal konfirmasi Hapus
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  // Panggil hook untuk mengambil data banner dari backend
  const { data, isLoading, isError, error } = useGetBannersQuery();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  // Handlers untuk semua aksi CRUD
  const handleEdit = (banner) => {
    setEditingData(banner);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleDelete = (banner) => {
    setBannerToDelete(banner);
    deleteModalRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBanner(bannerToDelete.id).unwrap();
      toast.success("Banner berhasil dihapus.");
      deleteModalRef.current?.close();
    } catch {
      toast.error("Gagal menghapus banner.");
    }
  };

  return (
    <>
      <TableControls
        onAddClick={handleAdd}
        addButtonText="Add Banner"
        showMonthFilter={false}
        showSearch={false}
        showLimitControl={false} // Kita tidak pakai paginasi di sini
      />

      {isError && (
        <div className="alert alert-error my-4">
          <span>Gagal memuat data banner. Pesan: {error.status}</span>
        </div>
      )}

      <BannerTable
        banners={data?.banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddEditBannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
      />

      <ConfirmationModal
        ref={deleteModalRef}
        title="Hapus Banner"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      >
        <p>
          Yakin ingin menghapus banner{" "}
          <span className="font-bold">"{bannerToDelete?.title}"</span>?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default BannerManagement;
