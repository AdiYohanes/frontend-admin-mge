import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { PhotoIcon } from "@heroicons/react/24/outline";

const roomSchema = z.object({
  name: z.string().min(3, "Nama ruangan minimal 3 karakter"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url({ message: "URL Gambar tidak valid" })
    .optional()
    .or(z.literal("")),
});

const AddEditRoomModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addRoom, { isLoading: isAdding }] = useAddRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const isLoading = isAdding || isUpdating;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "", description: "", imageUrl: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateRoom({ ...editingData, ...formData }).unwrap();
        toast.success("Ruangan berhasil diperbarui!");
      } else {
        await addRoom(formData).unwrap();
        toast.success("Ruangan baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data ruangan.");
      console.error("Error processing room data:", err);
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
          {isEditMode ? "Edit Room" : "Add New Room"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Room Name</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Ruang VIP 1"
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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
              placeholder="Deskripsi singkat mengenai ruangan..."
            ></textarea>
          </div>
          {/* --- TAMBAHAN BARU: Input untuk Image URL --- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Image URL</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                {...register("imageUrl")}
                placeholder="https://..."
                className={`input input-bordered w-full pl-10 ${
                  errors.imageUrl ? "input-error" : ""
                }`}
              />
            </div>
            {errors.imageUrl && (
              <span className="text-xs text-error mt-1">
                {errors.imageUrl.message}
              </span>
            )}
          </div>

          {/* --- TAMBAHAN BARU: Live Image Preview --- */}
          {watchedImageUrl && !errors.imageUrl && (
            <div className="p-2 border border-dashed rounded-lg flex justify-center bg-base-200">
              <img
                src={watchedImageUrl}
                alt="Preview"
                className="w-auto h-32 object-contain rounded"
                onError={(e) => (e.target.style.display = "none")}
                onLoad={(e) => (e.target.style.display = "block")}
              />
            </div>
          )}
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
              {isEditMode ? "Save Changes" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditRoomModal;
