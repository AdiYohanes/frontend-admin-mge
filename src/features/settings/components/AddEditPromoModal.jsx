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
  promo_code: z
    .string()
    .min(5, "Kode promo minimal 5 karakter")
    .regex(/^[A-Z0-9]+$/, "Gunakan huruf kapital dan angka"),
  percentage: z
    .number()
    .min(1, "Persentase minimal 1%")
    .max(100, "Persentase maksimal 100%"),
  is_active: z.boolean().default(true),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi").refine((date) => {
    return new Date(date).toString() !== 'Invalid Date';
  }, "Format tanggal tidak valid"),
  end_date: z.string().min(1, "Tanggal berakhir wajib diisi").refine((date) => {
    return new Date(date).toString() !== 'Invalid Date';
  }, "Format tanggal tidak valid"),
  usage_limit: z
    .number()
    .min(1, "Batas penggunaan minimal 1"),
  usage_limit_per_user: z
    .number()
    .min(1, "Batas penggunaan per user minimal 1"),
}).refine((data) => {
  return new Date(data.end_date) > new Date(data.start_date);
}, {
  message: "Tanggal berakhir harus setelah tanggal mulai",
  path: ["end_date"],
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
        reset({
          promo_code: "",
          percentage: 10,
          is_active: true,
          start_date: "",
          end_date: "",
          usage_limit: 100,
          usage_limit_per_user: 1
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  // Fungsi yang dijalankan saat form di-submit
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        // Panggil mutation update jika dalam mode edit
        await updatePromo({ id: editingData.id, ...formData }).unwrap();
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
              {...register("promo_code")}
              className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.promo_code ? "input-error" : ""
                }`}
              placeholder="Contoh: DISKON10"
            />
            {errors.promo_code && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.promo_code.message}
              </span>
            )}
          </div>

          {/* Percentage */}
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
                {...register("percentage", { valueAsNumber: true })}
                className={`input input-bordered w-full pr-12 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.percentage ? "input-error" : ""
                  }`}
                placeholder="10"
                min="1"
                max="100"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-base-content/60 text-sm">%</span>
              </div>
            </div>
            {errors.percentage && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.percentage.message}
              </span>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tanggal Mulai</span>
              </label>
              <input
                type="date"
                {...register("start_date")}
                className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.start_date ? "input-error" : ""
                  }`}
              />
              {errors.start_date && (
                <span className="text-xs text-error mt-1">
                  {errors.start_date.message}
                </span>
              )}
            </div>

            {/* End Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tanggal Berakhir</span>
              </label>
              <input
                type="date"
                {...register("end_date")}
                className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.end_date ? "input-error" : ""
                  }`}
              />
              {errors.end_date && (
                <span className="text-xs text-error mt-1">
                  {errors.end_date.message}
                </span>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Usage Limit */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Batas Total Penggunaan</span>
              </label>
              <input
                type="number"
                {...register("usage_limit", { valueAsNumber: true })}
                className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.usage_limit ? "input-error" : ""
                  }`}
                placeholder="100"
                min="1"
              />
              {errors.usage_limit && (
                <span className="text-xs text-error mt-1">
                  {errors.usage_limit.message}
                </span>
              )}
            </div>

            {/* Usage Limit Per User */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Batas Per User</span>
              </label>
              <input
                type="number"
                {...register("usage_limit_per_user", { valueAsNumber: true })}
                className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.usage_limit_per_user ? "input-error" : ""
                  }`}
                placeholder="1"
                min="1"
              />
              {errors.usage_limit_per_user && (
                <span className="text-xs text-error mt-1">
                  {errors.usage_limit_per_user.message}
                </span>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                {...register("is_active")}
                className="checkbox checkbox-primary"
              />
              <span className="label-text font-medium">Aktifkan promo</span>
            </label>
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
