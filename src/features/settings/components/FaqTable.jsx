import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUpdateFaqMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const FaqTable = ({ faqs, isLoading, page, limit, onEdit, onDelete }) => {
  const [updateFaq, { isLoading: isUpdatingStatus }] = useUpdateFaqMutation();

  const handleToggleStatus = async (faq) => {
    try {
      await updateFaq({ ...faq, isPublished: !faq.isPublished }).unwrap();
      toast.success(
        `FAQ ${!faq.isPublished ? "dipublikasikan" : "disembunyikan"}.`
      );
    } catch {
      toast.error("Gagal mengubah status FAQ.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!faqs || faqs.length === 0)
    return (
      <div className="text-center p-10">Tidak ada data FAQ yang ditemukan.</div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Question</th>
            <th>Answer</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq, index) => (
            <tr key={faq.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td className="font-semibold whitespace-normal">
                {faq.question}
              </td>
              <td className="text-sm opacity-80 whitespace-normal max-w-md">
                {faq.answer}
              </td>
              <td>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={faq.isPublished}
                  onChange={() => handleToggleStatus(faq)}
                  disabled={isUpdatingStatus}
                />
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(faq)}
                      className="btn btn-ghost btn-sm"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(faq)}
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
export default FaqTable;
