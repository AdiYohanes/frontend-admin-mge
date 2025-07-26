import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiTag, FiGift, FiPercent, FiFileText } from "react-icons/fi";
import {
  useAddPromoMutation,
  useUpdatePromoMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

// Skema validasi untuk form promo
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

  // Inisialisasi hooks mutation dari RTK Query
  const [addPromo, { isLoading: isAdding }] = useAddPromoMutation();
  const [updatePromo, { isLoading: isUpdating }] = useUpdatePromoMutation();
  const isLoading = isAdding || isUpdating;

  // Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(promoSchema),
  });

  // Efek untuk mengisi atau mereset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Mode Edit: isi form dengan data yang ada
        reset(editingData);
      } else {
        // Mode Tambah: reset ke form kosong dengan nilai default
        reset({ code: "", description: "", nominal: 10 });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  // Fungsi yang dijalankan saat form di-submit
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        // Panggil mutation update jika dalam mode edit
        await updatePromo({ ...editingData, ...formData }).unwrap();
        toast.success("Promo berhasil diperbarui!");
      } else {
        // Panggil mutation tambah jika dalam mode tambah
        await addPromo(formData).unwrap();
        toast.success("Promo baru berhasil ditambahkan!");
      }
      onClose(); // Tutup modal setelah sukses
    } catch (err) {
      toast.error(err.data?.message || "Gagal memproses data promo.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <FiGift className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                {isEditMode ? "Edit Promo" : "Tambah Promo Baru"}
              </h3>
              <p className="text-sm text-base-content/60">
                {isEditMode ? "Perbarui informasi promo" : "Buat promo baru untuk pelanggan"}
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {/* Promo Code */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiTag className="h-4 w-4 text-brand-gold" />
                Kode Promo
              </span>
            </label>
            <input
              type="text"
              {...register("code")}
              className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.code ? "input-error" : ""
                }`}
              placeholder="Contoh: WEEKENDSERU"
            />
            {errors.code && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.code.message}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiFileText className="h-4 w-4 text-brand-gold" />
                Deskripsi Promo
              </span>
            </label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered h-24 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.description ? "textarea-error" : ""
                }`}
              placeholder="Jelaskan detail promo, syarat dan ketentuan, periode berlaku, dll..."
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Nominal Discount */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiPercent className="h-4 w-4 text-brand-gold" />
                Persentase Diskon
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("nominal", { valueAsNumber: true })}
                className={`input input-bordered w-full pr-12 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.nominal ? "input-error" : ""
                  }`}
                placeholder="15"
                min="1"
                max="100"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-base-content/60 text-sm">%</span>
              </div>
            </div>
            {errors.nominal && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.nominal.message}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="modal-action pt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner loading-sm"></span>}
              {isEditMode ? "Simpan Perubahan" : "Tambah Promo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditPromoModal;
