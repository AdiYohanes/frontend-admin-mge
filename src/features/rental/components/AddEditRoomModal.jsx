import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import {
  UsersIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

// Skema validasi untuk form, termasuk max_visitors
const roomSchema = z.object({
  name: z.string().min(3, "Nama ruangan minimal 3 karakter"),
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
  max_visitors: z.number().min(1, "Kapasitas minimal 1 orang"),
});

const AddEditRoomModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [preview, setPreview] = useState(null);

  // Inisialisasi hooks mutation dari RTK Query
  const [addRoom, { isLoading: isAdding }] = useAddRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
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

  // Efek untuk mengisi form saat modal dibuka atau data edit berubah
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Mode Edit: isi form dengan data yang ada
        reset({
          name: editingData.name,
          description: editingData.description,
          max_visitors: editingData.max_visitors
        });
        setPreview(editingData.imageUrl);
      } else {
        // Mode Tambah: reset ke form kosong dengan nilai default
        reset({ name: "", description: "", image: null, max_visitors: 4 });
        setPreview(null);
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const handleRemoveImage = () => {
    setPreview(null);
    setValue("image", null);
  };

  // Fungsi yang dijalankan saat form di-submit
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        // Hapus field gambar jika tidak ada file baru yang dipilih saat edit
        if (!formData.image) {
          delete formData.image;
        }
        await updateRoom({ id: editingData.id, ...formData }).unwrap();
        toast.success("Ruangan berhasil diperbarui!");
      } else {
        await addRoom(formData).unwrap();
        toast.success("Ruangan baru berhasil ditambahkan!");
      }
      onClose(); // Tutup modal setelah sukses
    } catch (err) {
      toast.error("Gagal memproses data ruangan.");
      console.error(err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-6 w-6 text-brand-gold" />
            <h3 className="text-xl font-bold">
              {isEditMode ? "Edit Room" : "Add New Room"}
            </h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Image Upload Section */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Room Image <span className="text-error">*</span>
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
                    alt="Room Preview"
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

          {/* Room Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Room Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Ruang VIP 1"
                className={`input input-bordered ${errors.name ? "input-error" : ""
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
                <span className="label-text font-medium">
                  Max Visitors <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="number"
                  {...register("max_visitors", { valueAsNumber: true })}
                  placeholder="4"
                  className={`input input-bordered w-full ${errors.max_visitors ? "input-error" : ""
                    }`}
                />
              </div>
              {errors.max_visitors && (
                <span className="text-xs text-error mt-1">
                  {errors.max_visitors.message}
                </span>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
              placeholder="Deskripsi singkat mengenai ruangan, fasilitas, dan suasana..."
            ></textarea>
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
              {isEditMode ? "Save Changes" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditRoomModal;
