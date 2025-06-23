import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddCustomerReviewMutation,
  useUpdateCustomerReviewMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const reviewSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(10, "Review minimal 10 karakter"),
  rating: z.coerce.number().min(1).max(5),
  avatarUrl: z
    .string()
    .url("URL Avatar tidak valid")
    .optional()
    .or(z.literal("")),
});

const AddEditCustomerReviewModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addReview, { isLoading: isAdding }] = useAddCustomerReviewMutation();
  const [updateReview, { isLoading: isUpdating }] =
    useUpdateCustomerReviewMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "", description: "", rating: 5, avatarUrl: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      console.log("Data yang akan disubmit:", formData); // Untuk debugging
      if (isEditMode) {
        await updateReview({ ...editingData, ...formData }).unwrap();
        toast.success("Review berhasil diperbarui!");
      } else {
        await addReview(formData).unwrap();
        toast.success("Review baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Failed to process review:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {isEditMode ? "Edit Customer Review" : "Add New Review"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nama Reviewer</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={`input input-bordered ${
                errors.name ? "input-error" : ""
              }`}
            />
            {errors.name && (
              <span className="text-xs text-error mt-1">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Avatar URL (Opsional)</span>
            </label>
            <input
              type="text"
              {...register("avatarUrl")}
              className={`input input-bordered ${
                errors.avatarUrl ? "input-error" : ""
              }`}
            />
            {errors.avatarUrl && (
              <span className="text-xs text-error mt-1">
                {errors.avatarUrl.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Rating</span>
            </label>
            <div className="rating rating-lg">
              <input
                type="radio"
                value={1}
                {...register("rating", { valueAsNumber: true })}
                className="mask mask-star-2 bg-orange-400"
              />
              <input
                type="radio"
                value={2}
                {...register("rating", { valueAsNumber: true })}
                className="mask mask-star-2 bg-orange-400"
              />
              <input
                type="radio"
                value={3}
                {...register("rating", { valueAsNumber: true })}
                className="mask mask-star-2 bg-orange-400"
              />
              <input
                type="radio"
                value={4}
                {...register("rating", { valueAsNumber: true })}
                className="mask mask-star-2 bg-orange-400"
              />
              <input
                type="radio"
                value={5}
                {...register("rating", { valueAsNumber: true })}
                className="mask mask-star-2 bg-orange-400"
              />
            </div>
            {errors.rating && (
              <span className="text-xs text-error mt-1">
                {errors.rating.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Review Description</span>
            </label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered h-24 ${
                errors.description ? "textarea-error" : ""
              }`}
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              {isEditMode ? "Save Changes" : "Add Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditCustomerReviewModal;
