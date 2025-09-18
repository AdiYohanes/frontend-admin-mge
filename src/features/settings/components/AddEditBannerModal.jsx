import React, { useEffect, useCallback, useState } from "react";
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

// Component untuk preview gambar
const ImagePreview = ({ watchedImage, isEditMode, editingData, isDragActive }) => {
  console.log("ImagePreview render:", {
    watchedImage,
    isEditMode,
    editingData,
    isDragActive,
    hasWatchedImage: !!(watchedImage && Array.isArray(watchedImage) && watchedImage.length > 0)
  });

  if (watchedImage && Array.isArray(watchedImage) && watchedImage.length > 0) {
    console.log("Showing new image preview");
    return (
      <div className="space-y-3">
        <div className="mx-auto w-32 h-20 rounded-lg overflow-hidden bg-base-200">
          <img
            src={URL.createObjectURL(watchedImage[0])}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Error loading image preview:", e);
              e.target.style.display = 'none';
            }}
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
    );
  }

  if (isEditMode && editingData?.imageUrl) {
    console.log("Showing existing image preview");
    return (
      <div className="space-y-3">
        <div className="mx-auto w-32 h-20 rounded-lg overflow-hidden bg-base-200">
          <img
            src={editingData.imageUrl}
            alt="Current Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-sm">
          <p className="font-medium text-base-content">
            Gambar saat ini
          </p>
          <p className="text-base-content/60">
            Klik atau drag untuk mengganti gambar
          </p>
        </div>
      </div>
    );
  }

  console.log("Showing default upload area");
  return (
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
  );
};

// --- AWAL BLOK PERBAIKAN ---
// Kita buat fungsi untuk menghasilkan skema secara dinamis
const createBannerSchema = (isEditMode = false) =>
  z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().min(5, "Deskripsi minimal 5 karakter"),
    // Logika validasi gambar sekarang kondisional
    image: z
      .any()
      .optional()
      .refine((files) => {
        console.log("Validating image:", files, "isEditMode:", isEditMode);
        console.log("Files type:", typeof files);
        console.log("Files isArray:", Array.isArray(files));
        console.log("Files length:", files?.length);

        // Untuk mode edit, image tidak wajib
        if (isEditMode) {
          console.log("Edit mode - image not required");
          return true;
        }

        // Untuk mode add, image wajib dan harus array dengan length > 0
        const isValid = files && Array.isArray(files) && files.length > 0;
        console.log("Add mode - image validation result:", isValid);
        return isValid;
      }, {
        message: "Gambar wajib diunggah untuk banner baru.",
      })
      .refine((files) => {
        // Validasi ukuran hanya jika ada file
        if (!files || !Array.isArray(files) || files.length === 0) {
          console.log("No files to validate size");
          return true;
        }
        const fileSize = files[0]?.size;
        const maxSize = 2 * 1024 * 1024; // 2MB
        const isValidSize = fileSize <= maxSize;
        console.log("File size validation:", fileSize, "bytes, max:", maxSize, "valid:", isValidSize);
        return isValidSize;
      }, {
        message: "Ukuran gambar maksimal 2MB. Silakan pilih gambar yang lebih kecil.",
      }),
  });
// --- AKHIR BLOK PERBAIKAN ---

const AddEditBannerModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [fileError, setFileError] = useState(null);
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

  // Debug logging - remove in production
  console.log("=== AddEditBannerModal Debug ===");
  console.log("watchedImage:", watchedImage);
  console.log("watchedImage type:", typeof watchedImage);
  console.log("watchedImage isArray:", Array.isArray(watchedImage));
  console.log("isEditMode:", isEditMode);
  console.log("editingData:", editingData);
  console.log("isLoading:", isLoading);
  console.log("form errors:", errors);
  console.log("image error:", errors.image);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log("Files dropped:", acceptedFiles);
    console.log("Rejected files:", rejectedFiles);

    // Clear previous errors
    setFileError(null);

    // Handle rejected files (too large, wrong type, etc.)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      if (rejectedFile.errors.some(error => error.code === 'file-too-large')) {
        const fileSize = (rejectedFile.file.size / 1024 / 1024).toFixed(2);
        setFileError(`Ukuran gambar terlalu besar! File: ${fileSize}MB, Maksimal: 2MB`);
        return;
      }
      if (rejectedFile.errors.some(error => error.code === 'file-invalid-type')) {
        setFileError("Format file tidak didukung! Gunakan JPG, JPEG, atau PNG.");
        return;
      }
      setFileError("File tidak valid. Silakan coba lagi.");
      return;
    }

    console.log("Setting image value to:", acceptedFiles);
    setValue("image", acceptedFiles, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    console.log("Image value set, current form state:", watch());
  }, [setValue, watch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    disabled: isLoading,
  });

  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, resetting form...");
      setFileError(null); // Clear file error when modal opens
      if (isEditMode && editingData) {
        console.log("Edit mode - resetting with existing data");
        reset({
          title: editingData.title || "",
          description: editingData.description || "",
          image: undefined, // Use undefined instead of null
        });
      } else {
        console.log("Add mode - resetting with empty data");
        reset({
          title: "",
          description: "",
          image: undefined // Use undefined instead of null
        });
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
      console.error("Banner submission error:", err);
      const errorMessage = err.data?.message || err.data?.error || err.message || "Gagal memproses data banner.";
      toast.error(errorMessage);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6" noValidate>
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
              disabled={isLoading}
            />
            {errors.title && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-control flex flex-col gap-2">
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
              disabled={isLoading}
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
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${isLoading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
                } ${isDragActive
                  ? "border-brand-gold bg-brand-gold/5"
                  : watchedImage && Array.isArray(watchedImage) && watchedImage.length > 0
                    ? "border-brand-gold bg-brand-gold/5"
                    : "border-base-300 hover:border-brand-gold/50"
                } ${(errors.image || fileError) ? "border-error bg-error/5" : ""}`}
            >
              <input {...getInputProps()} />

              <ImagePreview
                watchedImage={watchedImage}
                isEditMode={isEditMode}
                editingData={editingData}
                isDragActive={isDragActive}
              />
            </div>

            {(errors.image || fileError) && (
              <span className="text-xs text-error mt-1 flex items-center gap-1">
                {fileError || errors.image?.message}
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
              disabled={isLoading}
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