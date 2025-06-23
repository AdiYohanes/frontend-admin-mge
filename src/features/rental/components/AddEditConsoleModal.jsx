import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddConsoleMutation,
  useUpdateConsoleMutation,
} from "../api/rentalApiSlice";
import { toast } from "react-hot-toast";
import {
  PhotoIcon,
  CpuChipIcon,
  Squares2X2Icon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

const consoleSchema = z.object({
  name: z.string().min(3, "Nama konsol minimal 3 karakter"),
  imageUrl: z.string().url({ message: "URL gambar tidak valid" }),
  amount: z.number().min(1, "Jumlah minimal 1"),
});

const AddEditConsoleModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [addConsole, { isLoading: isAdding }] = useAddConsoleMutation();
  const [updateConsole, { isLoading: isUpdating }] = useUpdateConsoleMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(consoleSchema),
    defaultValues: { amount: 1 },
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "", imageUrl: "", amount: 1 });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateConsole({ ...editingData, ...formData }).unwrap();
        toast.success("Konsol berhasil diperbarui!");
      } else {
        await addConsole(formData).unwrap();
        toast.success("Konsol baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data konsol.");
      console.error("Failed to submit console data:", err);
    }
  };

  const handleAmountChange = (amount) => {
    const currentValue = getValues("amount") || 0;
    const newValue = currentValue + amount;
    if (newValue >= 1) {
      setValue("amount", newValue, { shouldValidate: true });
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
          {isEditMode ? "Edit Console" : "Add New Console"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Console Name</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <CpuChipIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. PlayStation 5"
                className={`input input-bordered w-full pl-10 ${
                  errors.name ? "input-error" : ""
                }`}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-error mt-1">
                {errors.name.message}
              </span>
            )}
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
            {errors.imageUrl && (
              <span className="text-xs text-error mt-1">
                {errors.imageUrl.message}
              </span>
            )}
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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Squares2X2Icon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                className={`input input-bordered w-full pl-10 ${
                  errors.amount ? "input-error" : ""
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex">
                <button
                  type="button"
                  onClick={() => handleAmountChange(-1)}
                  className="btn btn-ghost btn-square btn-sm h-full rounded-l-none"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAmountChange(1)}
                  className="btn btn-ghost btn-square btn-sm h-full rounded-l-none"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {errors.amount && (
              <span className="text-xs text-error mt-1">
                {errors.amount.message}
              </span>
            )}
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
              {isEditMode ? "Save Changes" : "Add Console"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditConsoleModal;
