import React, { useState, useRef } from "react";
import {
  useGetBannersQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from "../api/settingsApiSlice";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import TableControls from "../../../components/common/TableControls";
import AddEditBannerModal from "./AddEditBannerModal";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const BannerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const deleteModalRef = useRef(null);

  const { data, isLoading } = useGetBannersQuery();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const handleToggleStatus = async (banner) => {
    try {
      await updateBanner({ ...banner, isActive: !banner.isActive }).unwrap();
      toast.success("Status banner diperbarui.");
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

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
      />
      <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
        <table className="table">
          <thead className="bg-base-200">
            <tr>
              <th>Image</th>
              <th>Details</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <span className="loading loading-lg"></span>
                </td>
              </tr>
            ) : (
              data?.banners.map((banner) => (
                <tr key={banner.id} className="hover">
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle w-24 h-12">
                        <img src={banner.imageUrl} alt={banner.title} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold">{banner.title}</div>
                    <div className="text-xs opacity-70 max-w-md truncate">
                      {banner.description}
                    </div>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={banner.isActive}
                      onChange={() => handleToggleStatus(banner)}
                    />
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
