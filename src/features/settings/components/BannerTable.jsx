import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdateBannerMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const BannerTable = ({ banners, isLoading, onEdit, onDelete }) => {
  const [updateBanner, { isLoading: isUpdatingStatus }] =
    useUpdateBannerMutation();

  const handleToggleStatus = async (banner) => {
    try {
      // --- PERBAIKAN DI SINI ---
      // Mengirim properti 'isActive' yang benar, bukan 'is_active'
      await updateBanner({
        id: banner.id,
        isActive: !banner.isActive,
      }).unwrap();
      toast.success("Status banner diperbarui.");
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  }
  if (!banners || banners.length === 0) {
    return (
      <div className="text-center p-10">
        Tidak ada data banner yang ditemukan.
      </div>
    );
  }

  return (
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
          {banners.map((banner) => (
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
                  disabled={isUpdatingStatus}
                />
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(banner)}
                    className="btn btn-ghost btn-sm"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(banner)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannerTable;
