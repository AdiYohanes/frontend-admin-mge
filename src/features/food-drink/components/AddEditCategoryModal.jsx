import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/foodDrinkApiSlice";
import { toast } from "react-hot-toast";
import { FiTag } from "react-icons/fi";

// Skema validasi untuk form
const categorySchema = z.object({
  category: z.string().min(3, "Nama kategori minimal 3 karakter"),
  type: z.string().nonempty("Tipe harus dipilih"),
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
        // Map 'name' dari data kita ke 'category' yang diharapkan form
        reset({ category: editingData.name, type: editingData.type });
      } else {
        reset({ category: "", type: "Food" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateCategory({ id: editingData.id, ...formData }).unwrap();
        toast.success("Kategori berhasil diperbarui!");
      } else {
        await addCategory(formData).unwrap();
        toast.success("Kategori baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Gagal memproses data.");
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
        <div className="flex items-center gap-2 mb-2">
          <FiTag className="h-6 w-6 text-brand-gold" />
          <h3 className="font-bold text-lg text-brand-gold">
            {isEditMode ? "Edit Category" : "Add New Category"}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-brand-gold">Category Name</span>
            </label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. Makanan Berat"
              className={`input input-bordered focus:border-brand-gold focus:ring-brand-gold ${errors.category ? "input-error" : ""}`}
            />
            {errors.category && (
              <span className="text-xs text-error mt-1">
                {errors.category.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-brand-gold">Type</span>
            </label>
            <select
              {...register("type")}
              className={`select select-bordered focus:border-brand-gold focus:ring-brand-gold ${errors.type ? "select-error" : ""}`}
            >
              <option value="Food">Food</option>
              <option value="Drink">Drink</option>
            </select>
            {errors.type && (
              <span className="text-xs text-error mt-1">
                {errors.type.message}
              </span>
            )}
          </div>
          <div className="modal-action pt-4 border-t border-base-300">
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
