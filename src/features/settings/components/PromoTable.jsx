import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdatePromoMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const PromoTable = ({ promos, isLoading, page, limit, onEdit, onDelete }) => {
  const [updatePromo, { isLoading: isUpdatingStatus }] =
    useUpdatePromoMutation();

  const handleToggleStatus = async (promo) => {
    try {
      // Kirim data lengkap dengan status yang sudah dibalik
      await updatePromo({
        id: promo.id,
        promo_code: promo.promo_code,
        percentage: promo.percentage,
        is_active: !promo.is_active,
        start_date: promo.start_date,
        end_date: promo.end_date,
        usage_limit: promo.usage_limit,
        usage_limit_per_user: promo.usage_limit_per_user,
      }).unwrap();
      toast.success(`Status promo ${promo.promo_code} berhasil diperbarui.`);
    } catch {
      toast.error("Gagal memperbarui status promo.");
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
            <th>Percentage</th>
            <th>Period</th>
            <th>Usage</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((promo, index) => (
            <tr key={promo.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="font-bold font-mono">{promo.promo_code}</div>
              </td>
              <td className="font-semibold">{promo.percentage}%</td>
              <td className="text-sm">
                <div className="space-y-1">
                  <div>Start: {new Date(promo.start_date).toLocaleDateString('id-ID')}</div>
                  <div>End: {new Date(promo.end_date).toLocaleDateString('id-ID')}</div>
                </div>
              </td>
              <td className="text-sm">
                <div className="space-y-1">
                  <div>Used: <span className="font-semibold">{promo.times_used}</span>/{promo.usage_limit}</div>
                  <div>Per User: {promo.usage_limit_per_user}</div>
                </div>
              </td>
              <td>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={promo.is_active}
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
