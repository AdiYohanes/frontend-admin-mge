import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddFoodDrinkItemMutation,
  useUpdateFoodDrinkItemMutation,
} from "../api/foodDrinkApiSlice";
import { toast } from "react-hot-toast";

const itemSchema = z.object({
  name: z.string().min(3, "Nama item minimal 3 karakter"),
  category: z.string().nonempty("Kategori harus dipilih"),
  price: z.number().min(1000, "Harga minimal 1000"),
  imageUrl: z.string().url("URL Gambar tidak valid"),
  status: z.string().nonempty("Status harus dipilih"),
});

const categoryOptions = [
  "Makanan Berat",
  "Snack",
  "Minuman Dingin",
  "Minuman Panas",
];

const AddEditFoodDrinkModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addItem, { isLoading: isAdding }] = useAddFoodDrinkItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateFoodDrinkItemMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({
          name: "",
          category: "",
          price: 5000,
          imageUrl: "",
          status: "Available",
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateItem({ ...editingData, ...formData }).unwrap();
        toast.success("Item berhasil diperbarui!");
      } else {
        await addItem(formData).unwrap();
        toast.success("Item baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Failed to process item:", err);
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
          {isEditMode ? "Edit Item" : "Add New Food & Drink Item"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Item Name</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              {...register("category")}
              className="select select-bordered"
            >
              <option value="">Pilih Kategori...</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Price</span>
            </label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Image URL</span>
            </label>
            <input
              type="text"
              {...register("imageUrl")}
              className="input input-bordered"
            />
          </div>
          {watchedImageUrl && !errors.imageUrl && (
            <div className="p-2 border border-dashed rounded-lg flex justify-center">
              <img
                src={watchedImageUrl}
                alt="Preview"
                className="w-auto h-32 object-contain rounded"
              />
            </div>
          )}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  {...register("status")}
                  value="Available"
                  className="radio checked:bg-success"
                />{" "}
                <span className="label-text ml-2">Available</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  {...register("status")}
                  value="Sold Out"
                  className="radio checked:bg-error"
                />{" "}
                <span className="label-text ml-2">Sold Out</span>
              </label>
            </div>
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
              {isEditMode ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditFoodDrinkModal;
