import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddPromoMutation,
  useUpdatePromoMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const promoSchema = z.object({
  code: z
    .string()
    .min(5, "Kode promo minimal 5 karakter")
    .regex(/^[A-Z0-9]+$/, "Gunakan huruf kapital dan angka"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  nominal: z
    .number()
    .min(1, "Nominal minimal 1%")
    .max(100, "Nominal maksimal 100%"),
});

const AddEditPromoModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addPromo, { isLoading: isAdding }] = useAddPromoMutation();
  const [updatePromo, { isLoading: isUpdating }] = useUpdatePromoMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(promoSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ code: "", description: "", nominal: 10 });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updatePromo({ ...editingData, ...formData }).unwrap();
        toast.success("Promo berhasil diperbarui!");
      } else {
        await addPromo(formData).unwrap();
        toast.success("Promo baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data promo.");
      console.error("Failed to process promo data:", err);
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
          {isEditMode ? "Edit Promo" : "Add New Promo"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Promo Code</span>
            </label>
            <input
              type="text"
              {...register("code")}
              className="input input-bordered"
            />
            {errors.code && (
              <span className="text-xs text-error mt-1">
                {errors.code.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nominal Discount (%)</span>
            </label>
            <input
              type="number"
              {...register("nominal", { valueAsNumber: true })}
              className="input input-bordered"
            />
            {errors.nominal && (
              <span className="text-xs text-error mt-1">
                {errors.nominal.message}
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
              {isEditMode ? "Save Changes" : "Add Promo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditPromoModal;
