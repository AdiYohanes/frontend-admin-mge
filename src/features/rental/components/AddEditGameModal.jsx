import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import {
  FiUpload,
  FiX,
  FiMonitor
} from "react-icons/fi";

import {
  useAddGameMutation,
  useUpdateGameMutation,
} from "../api/rentalApiSlice";

// Skema validasi yang lebih fleksibel
const gameSchema = z.object({
  title: z.string().min(3, "Judul game minimal 3 karakter"),
  genre: z.string().nonempty("Genre harus dipilih"),
  description: z.string().optional().or(z.literal("")),
  image: z.any().optional(), // Lebih fleksibel untuk image
});

const genreOptions = [
  "Action",
  "Adventure",
  "RPG",
  "Sports",
  "Co-op",
  "Strategy",
  "Fighting",
];

const AddEditGameModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [preview, setPreview] = useState(null);

  const [addGame, { isLoading: isAdding }] = useAddGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      genre: "",
      description: "",
      image: null,
    },
  });

  // Watch image field untuk debugging
  const imageField = watch("image");

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
        reset({
          title: editingData.name || editingData.title || "",
          genre: editingData.genre || "",
          description: editingData.description || "",
          image: null,
        });
        setPreview(editingData.imageUrl);
      } else {
        reset({
          title: "",
          genre: "",
          description: "",
          image: null,
        });
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
      console.log("Form data being submitted:", formData); // Debug log

      if (isEditMode) {
        if (!formData.image || formData.image.length === 0) {
          delete formData.image;
        }
        await updateGame({ id: editingData.id, ...formData }).unwrap();
        toast.success("Game berhasil diperbarui!");
      } else {
        await addGame(formData).unwrap();
        toast.success("Game baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      console.error("Submit error:", err); // Debug log
      toast.error(err.data?.message || "Gagal memproses data game.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FiMonitor className="h-6 w-6 text-brand-gold" />
            <h3 className="text-xl font-bold">
              {isEditMode ? "Edit Game" : "Add Game"}
            </h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Game Image <span className="text-error">*</span>
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
                    alt="Game Preview"
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
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <div className="p-4 bg-brand-gold/10 rounded-full">
                    <FiUpload className="h-8 w-8 text-brand-gold" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Game Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Enter game name..."
                className={`input input-bordered ${errors.title ? "input-error" : ""
                  }`}
              />
              {errors.title && (
                <span className="text-xs text-error mt-1">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Genre <span className="text-error">*</span>
                </span>
              </label>
              <select
                {...register("genre")}
                className={`select select-bordered ${errors.genre ? "select-error" : ""
                  }`}
              >
                <option value="">Select Genre...</option>
                {genreOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.genre && (
                <span className="text-xs text-error mt-1">
                  {errors.genre.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Enter game description..."
              className="textarea textarea-bordered h-24"
            ></textarea>
            {errors.description && (
              <span className="text-xs text-error mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Debug info - remove in production */}
          {import.meta.env.DEV && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Debug: Image field value: {JSON.stringify(imageField)}
            </div>
          )}

          <div className="modal-action pt-4 border-t border-base-300">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              {isEditMode ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGameModal;
