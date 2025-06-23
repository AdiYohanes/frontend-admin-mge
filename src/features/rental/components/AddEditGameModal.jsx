import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddGameMutation,
  useUpdateGameMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import {
  PuzzlePieceIcon,
  ComputerDesktopIcon,
  TagIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const gameSchema = z.object({
  name: z.string().min(3, "Nama game minimal 3 karakter"),
  console: z.string().nonempty("Konsol harus dipilih"),
  genre: z.string().nonempty("Genre harus dipilih"),
  imageUrl: z.string().url({ message: "URL gambar tidak valid" }),
});

// Opsi untuk dropdown
const consoleOptions = ["PS5", "PS4", "PS4/PS5"];
const genreOptions = [
  "Action",
  "Adventure",
  "RPG",
  "Sports",
  "Co-op",
  "Strategy",
];

const AddEditGameModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  const [addGame, { isLoading: isAdding }] = useAddGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gameSchema),
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "", console: "", genre: "", imageUrl: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateGame({ ...editingData, ...formData }).unwrap();
        toast.success("Game berhasil diperbarui!");
      } else {
        await addGame(formData).unwrap();
        toast.success("Game baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data game.");
      console.error("Failed to process game:", err);
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
          {isEditMode ? "Edit Game" : "Add New Game"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Game Name</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <PuzzlePieceIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Elden Ring"
                className={`input input-bordered w-full pl-10 ${
                  errors.name ? "input-error" : ""
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Console</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                </span>
                <select
                  {...register("console")}
                  className={`select select-bordered w-full pl-10 ${
                    errors.console ? "select-error" : ""
                  }`}
                >
                  <option value="">Pilih...</option>
                  {consoleOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Genre</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </span>
                <select
                  {...register("genre")}
                  className={`select select-bordered w-full pl-10 ${
                    errors.genre ? "select-error" : ""
                  }`}
                >
                  <option value="">Pilih...</option>
                  {genreOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
          </div>

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
              {isEditMode ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGameModal;
