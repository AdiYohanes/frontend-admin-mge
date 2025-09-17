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
});

const AddEditCustomerReviewModal = ({ isOpen, onClose, editingData, onSuccess }) => {
  const isEditMode = Boolean(editingData);
  const [addReview, { isLoading: isAdding }] = useAddCustomerReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateCustomerReviewMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  const currentRating = watch("rating");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        const formData = {
          name: editingData.booking?.bookable?.name || '',
          description: editingData.description || '',
          rating: editingData.rating || 5,
        };
        reset(formData);
      } else {
        reset({ name: "", description: "", rating: 5 });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const handleSubmitReview = async (formData) => {
    try {
      if (isEditMode) {
        await updateReview({
          id: editingData.id,
          ...formData
        }).unwrap();
        toast.success("Review berhasil diperbarui!");
      } else {
        await addReview(formData).unwrap();
        toast.success("Review baru berhasil ditambahkan!");
      }
      onClose();
      if (onSuccess) {
        onSuccess();
      }
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
          aria-label="Tutup modal"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose();
          }}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {isEditMode ? "Edit Customer Review" : "Add New Review"}
        </h3>
        <form onSubmit={handleSubmit(handleSubmitReview)} className="flex flex-col space-y-6 mt-6">
          {/* Nama Reviewer Field */}
          <div className="form-control">
            <label htmlFor="reviewer-name" className="label mb-1">
              <span className="label-text font-medium">Nama Reviewer</span>
            </label>
            <input
              id="reviewer-name"
              type="text"
              {...register("name")}
              placeholder="Masukkan nama reviewer"
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
              aria-invalid={!!errors.name}
              aria-label="Nama Reviewer"
              tabIndex={0}
            />
            {errors.name && (
              <span className="label-text-alt text-error mt-1">{errors.name.message}</span>
            )}
          </div>

          {/* Rating Field */}
          <div className="form-control">
            <label className="label mb-1" htmlFor="review-rating">
              <span className="label-text font-medium">Rating</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-base font-medium" id="review-rating">Rating</span>
              <div className="rating rating-lg justify-start gap-2" aria-label="Pilih rating">
                {[1, 2, 3, 4, 5].map((val) => (
                  <input
                    key={val}
                    type="radio"
                    value={val}
                    {...register("rating", { valueAsNumber: true })}
                    checked={currentRating === val}
                    className="mask mask-star-2 bg-orange-400"
                    aria-label={`Rating ${val}`}
                    tabIndex={0}
                  />
                ))}
              </div>
            </div>
            {errors.rating && (
              <span className="label-text-alt text-error mt-1">{errors.rating.message}</span>
            )}
          </div>

          {/* Review Description Field */}
          <div className="form-control">
            <label htmlFor="review-description" className="label mb-1">
              <span className="label-text font-medium">Review Description</span>
            </label>
            <textarea
              id="review-description"
              {...register("description")}
              placeholder="Masukkan deskripsi review"
              className={`textarea textarea-bordered w-full h-24 resize-none ${errors.description ? "textarea-error" : ""}`}
              aria-invalid={!!errors.description}
              aria-label="Review Description"
              tabIndex={0}
            ></textarea>
            {errors.description && (
              <span className="label-text-alt text-error mt-1">{errors.description.message}</span>
            )}
          </div>
          {/* Modal Actions */}
          <div className="modal-action pt-6 border-t border-base-300">
            <div className="flex gap-3 w-full justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Batal"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onClose();
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn bg-brand-gold hover:bg-amber-600 text-white btn-sm"
                disabled={isLoading}
                aria-label={isEditMode ? "Simpan Perubahan" : "Tambah Review"}
                tabIndex={0}
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                {isEditMode ? "Simpan Perubahan" : "Tambah Review"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditCustomerReviewModal;
