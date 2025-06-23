import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/foodDrinkApiSlice";
import { toast } from "react-hot-toast";

const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

const AddEditCategoryModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateCategory({ ...editingData, ...formData }).unwrap();
        toast.success("Kategori berhasil diperbarui!");
      } else {
        await addCategory(formData).unwrap();
        toast.success("Kategori baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Error processing category data:", err);
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
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category Name</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Minuman Dingin"
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
              {isEditMode ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditCategoryModal;
