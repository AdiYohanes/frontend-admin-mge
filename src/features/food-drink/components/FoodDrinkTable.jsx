import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";
import { useUpdateFoodDrinkItemMutation } from "../api/foodDrinkApiSlice";
import { toast } from "react-hot-toast";

const FoodDrinkTable = ({
  items,
  isLoading,
  page,
  limit,
  onEdit,
  onDelete,
}) => {
  // 1. Inisialisasi hook mutation untuk update
  const [updateItem, { isLoading: isUpdatingStatus }] =
    useUpdateFoodDrinkItemMutation();

  // 2. Buat fungsi handler untuk menangani klik pada toggle
  const handleToggleStatus = async (item) => {
    try {
      // Kirim hanya ID dan status baru untuk diupdate
      await updateItem({
        id: item.id,
        is_available: !item.is_available,
      }).unwrap();
      toast.success(`Status untuk ${item.name} berhasil diperbarui.`);
    } catch (err) {
      toast.error("Gagal memperbarui status item.");
      console.error("Failed to toggle status:", err);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!items || items.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data item yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="avatar">
                  <div className="mask mask-squircle w-12 h-12">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                </div>
              </td>
              <td className="font-bold">{item.name}</td>
              <td>
                <div className="badge badge-ghost">{item.category}</div>
              </td>
              <td className="font-semibold">
                {formatCurrency(parseFloat(item.price))}
              </td>

              <td>
                <div
                  className="tooltip"
                  data-tip={item.is_available ? "Available" : "Sold Out"}
                >
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={item.is_available}
                    onChange={() => handleToggleStatus(item)}
                    disabled={isUpdatingStatus} // Nonaktifkan saat proses update berjalan
                  />
                </div>
              </td>

              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(item)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(item)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FoodDrinkTable;
