import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

import {
  useAddConsoleMutation,
  useUpdateConsoleMutation,
} from "../api/rentalApiSlice";
import {
  ArrowUpTrayIcon,
  XCircleIcon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";

const consoleSchema = z.object({
  name: z.string().min(3, "Nama konsol minimal 3 karakter"),
  description: z.string().optional(),
  image: z
    .any()
    .refine((files) => !files || files?.[0], {
      message: "Gambar wajib diunggah.",
    })
    .refine(
      (files) => !files || files?.[0]?.size <= 2 * 1024 * 1024,
      `Ukuran gambar maksimal 2MB.`
    )
    .optional(),
});

const AddEditConsoleModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [preview, setPreview] = useState(null);

  const [addConsole, { isLoading: isAdding }] = useAddConsoleMutation();
  const [updateConsole, { isLoading: isUpdating }] = useUpdateConsoleMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(consoleSchema),
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        setValue("image", acceptedFiles, { shouldValidate: true });
        setPreview(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset({ name: editingData.name, description: editingData.description });
        setPreview(editingData.imageUrl);
      } else {
        reset({ name: "", description: "", image: null });
        setPreview(null);
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const handleRemoveImage = () => {
    setPreview(null);
    setValue("image", null);
  };

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        if (!formData.image) {
          delete formData.image;
        }
        await updateConsole({ id: editingData.id, ...formData }).unwrap();
        toast.success("Konsol berhasil diperbarui!");
      } else {
        await addConsole(formData).unwrap();
        toast.success("Konsol baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Gagal memproses data konsol.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <h3 className="text-xl font-bold">
            {isEditMode ? "Edit Console" : "Add Console"}
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Image <span className="text-error">*</span>
              </span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-brand-gold bg-brand-gold/5"
                : preview
                  ? "border-brand-gold bg-base-100"
                  : "border-base-300 hover:border-brand-gold hover:bg-base-50"
                }`}
            >
              <input {...getInputProps()} />

              {preview ? (
                // Preview Image Mode
                <div className="relative w-full h-48 flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-700">
                          Click to change image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          or drag and drop
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="btn btn-sm btn-circle bg-red-500 hover:bg-red-600 text-white absolute top-2 right-2 shadow-lg"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <div className="p-4 bg-brand-gold/10 rounded-full">
                    <ArrowUpTrayIcon className="h-8 w-8 text-brand-gold" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-base-content">
                      {isDragActive ? "Drop the image here" : "Drop files here or click to upload"}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      PNG, JPG, JPEG (Maks. 2MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.image && (
              <span className="text-xs text-error mt-2">
                {errors.image.message}
              </span>
            )}
          </div>

          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("name")}
                className={`input input-bordered ${errors.name ? "input-error" : ""
                  }`}
                placeholder="Enter console name..."
              />
              {errors.name && (
                <span className="text-xs text-error mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                {...register("description")}
                className="textarea textarea-bordered h-24"
                placeholder="Enter console description (optional)..."
              ></textarea>
            </div>
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
              {isEditMode ? "Save Changes" : "Add Console"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditConsoleModal;
