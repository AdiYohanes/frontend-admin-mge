import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { FiImage, FiFileText, FiType } from "react-icons/fi";
import {
  useAddBannerMutation,
  useUpdateBannerMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

// --- AWAL BLOK PERBAIKAN ---
// Kita buat fungsi untuk menghasilkan skema secara dinamis
const createBannerSchema = (isEditMode = false) =>
  z.object({
    title: z.string().min(5, "Judul minimal 5 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    // Logika validasi gambar sekarang kondisional
    image: z
      .any()
      .refine((files) => isEditMode || (files && files.length > 0), {
        message: "Gambar wajib diunggah untuk banner baru.",
      })
      .refine((files) => !files || files?.[0]?.size <= 2 * 1024 * 1024, {
        message: `Ukuran gambar maksimal 2MB.`,
      }),
  });
// --- AKHIR BLOK PERBAIKAN ---

const AddEditBannerModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const isLoading = isAdding || isUpdating;

  // Gunakan skema dinamis di sini
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBannerSchema(isEditMode)),
  });

  const watchedImage = watch("image");

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    setValue("image", acceptedFiles);
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset({
          title: editingData.title,
          description: editingData.description,
        });
      } else {
        reset({ title: "", description: "", image: null });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        if (!formData.image || formData.image.length === 0) {
          delete formData.image;
        }
        await updateBanner({ id: editingData.id, ...formData }).unwrap();
        toast.success("Banner berhasil diperbarui!");
      } else {
        await addBanner(formData).unwrap();
        toast.success("Banner baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Gagal memproses data banner.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <FiImage className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                {isEditMode ? "Edit Banner" : "Tambah Banner Baru"}
              </h3>
              <p className="text-sm text-base-content/60">
                {isEditMode ? "Perbarui informasi banner" : "Buat banner baru untuk landing page"}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiType className="h-4 w-4 text-brand-gold" />
                Judul Banner
              </span>
            </label>
            <input
              type="text"
              {...register("title")}
              className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.title ? "input-error" : ""
                }`}
              placeholder="Masukkan judul banner..."
            />
            {errors.title && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiFileText className="h-4 w-4 text-brand-gold" />
                Deskripsi Banner
              </span>
            </label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered h-24 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 ${errors.description ? "textarea-error" : ""
                }`}
              placeholder="Jelaskan deskripsi banner, pesan yang ingin disampaikan, dll..."
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Image Upload Dropzone */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiImage className="h-4 w-4 text-brand-gold" />
                Gambar Banner
              </span>
            </label>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-brand-gold bg-brand-gold/5"
                : watchedImage && watchedImage.length > 0
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-base-300 hover:border-brand-gold/50"
                } ${errors.image ? "border-error" : ""}`}
            >
              <input {...getInputProps()} />

              {watchedImage && watchedImage.length > 0 ? (
                <div className="space-y-3">
                  <div className="mx-auto w-32 h-20 rounded-lg overflow-hidden bg-base-200">
                    <img
                      src={URL.createObjectURL(watchedImage[0])}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-base-content">
                      {watchedImage[0].name}
                    </p>
                    <p className="text-base-content/60">
                      {(watchedImage[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <p className="text-xs text-base-content/60">
                    Klik atau drag untuk mengganti gambar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center">
                    <FiImage className="h-8 w-8 text-base-content/40" />
                  </div>
                  <div>
                    <p className="font-medium text-base-content">
                      {isDragActive ? "Lepaskan file di sini" : "Drag & drop gambar di sini"}
                    </p>
                    <p className="text-sm text-base-content/60 mt-1">
                      atau klik untuk memilih file
                    </p>
                    <p className="text-xs text-base-content/40 mt-2">
                      PNG, JPG maksimal 2MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errors.image && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.image.message}
              </span>
            )}

            {isEditMode && (
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Kosongkan jika tidak ingin mengubah gambar
                </span>
              </label>
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
              {isEditMode ? "Simpan Perubahan" : "Tambah Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBannerModal;
