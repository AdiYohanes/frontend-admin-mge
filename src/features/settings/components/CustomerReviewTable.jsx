import React from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useUpdateCustomerReviewMutation } from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const CustomerReviewTable = ({ reviews, isLoading, onEdit, onDelete }) => {
  const [updateReview, { isLoading: isUpdatingStatus }] =
    useUpdateCustomerReviewMutation();

  const handleToggleStatus = async (review) => {
    try {
      await updateReview({ ...review, isActive: !review.isActive }).unwrap();
      toast.success(`Status review berhasil diperbarui.`);
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!reviews || reviews.length === 0)
    return <div className="text-center p-10">Tidak ada data.</div>;

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Reviewer</th>
            <th>Description</th>
            <th>Rating</th>
            <th>Activation</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, index) => (
            <tr key={review.id} className="hover">
              <th>{index + 1}</th>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img
                        src={
                          review.avatarUrl ||
                          `https://i.pravatar.cc/150?u=${review.name}`
                        }
                        alt={review.name}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{review.name}</div>
                  </div>
                </div>
              </td>
              <td className="text-sm max-w-sm whitespace-normal">
                {review.description}
              </td>
              <td>
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  {review.rating} <StarIcon className="w-4 h-4" />
                </div>
              </td>
              <td>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={review.isActive}
                  onChange={() => handleToggleStatus(review)}
                  disabled={isUpdatingStatus}
                />
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(review)}
                    className="btn btn-ghost btn-sm"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(review)}
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
export default CustomerReviewTable;
