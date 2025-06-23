import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdatePromoMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const PromoTable = ({ promos, isLoading, page, limit, onEdit, onDelete }) => {
  const [updatePromo, { isLoading: isUpdatingStatus }] =
    useUpdatePromoMutation();

  const handleToggleStatus = async (promo) => {
    try {
      await updatePromo({ ...promo, isActive: !promo.isActive }).unwrap();
      toast.success(
        `Promo ${promo.code} ${
          !promo.isActive ? "diaktifkan" : "dinonaktifkan"
        }.`
      );
    } catch {
      toast.error("Gagal mengubah status promo.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!promos || promos.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data promo yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Promo Code</th>
            <th>Description</th>
            <th>Nominal</th>
            <th>Activation</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((promo, index) => (
            <tr key={promo.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="font-bold font-mono">{promo.code}</div>
              </td>
              <td className="text-sm opacity-80">{promo.description}</td>
              <td className="font-semibold">{promo.nominal}%</td>
              <td>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={promo.isActive}
                  onChange={() => handleToggleStatus(promo)}
                  disabled={isUpdatingStatus}
                />
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(promo)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(promo)}
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
export default PromoTable;
