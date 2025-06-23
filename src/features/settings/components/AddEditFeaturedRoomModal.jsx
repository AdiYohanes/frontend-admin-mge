/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddFeaturedRoomMutation,
  useUpdateFeaturedRoomMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

const roomSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  images: z.string().nonempty("Masukkan setidaknya satu URL gambar"),
});

const AddEditFeaturedRoomModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addRoom, { isLoading: isAdding }] = useAddFeaturedRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] =
    useUpdateFeaturedRoomMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(roomSchema) });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Gabungkan array gambar menjadi string dengan baris baru untuk ditampilkan di textarea
        reset({ ...editingData, images: editingData.images.join("\n") });
      } else {
        reset({ title: "", description: "", images: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      // Ubah string gambar dari textarea kembali menjadi array
      const processedData = {
        ...formData,
        images: formData.images.split("\n").filter((url) => url.trim() !== ""),
      };

      if (isEditMode) {
        await updateRoom({ ...editingData, ...processedData }).unwrap();
        toast.success("Featured room berhasil diperbarui!");
      } else {
        await addRoom(processedData).unwrap();
        toast.success("Featured room baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Failed to process featured room data:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {isEditMode ? "Edit Featured Room" : "Add New Featured Room"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Image URLs</span>
              <span className="label-text-alt">Satu URL per baris</span>
            </label>
            <textarea
              {...register("images")}
              className="textarea textarea-bordered h-24 font-mono text-xs"
            ></textarea>
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
              {isEditMode ? "Save Changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditFeaturedRoomModal;
