/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddFoodDrinkItemMutation,
  useUpdateFoodDrinkItemMutation,
  useGetAllCategoriesQuery,
} from "../api/foodDrinkApiSlice";
import { toast } from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiX, FiCoffee } from "react-icons/fi";

const itemSchema = z.object({
  name: z.string().min(3, "Nama item minimal 3 karakter"),
  fnb_category_id: z.coerce.number().min(1, "Kategori harus dipilih"),
  price: z.coerce.number().min(1000, "Harga minimal 1000"),
  description: z.string().optional(),
  image: z.any().optional(),
  is_available: z.boolean(),
});

const AddEditFoodDrinkModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [preview, setPreview] = useState(null);

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();

  const [addItem, { isLoading: isAdding }] = useAddFoodDrinkItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateFoodDrinkItemMutation();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
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
        reset(editingData);
        setPreview(editingData.imageUrl || null);
      } else {
        reset({
          name: "",
          fnb_category_id: "",
          price: 5000,
          description: "",
          image: null,
          is_available: true,
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
      if (isEditMode) {
        if (!formData.image || formData.image.length === 0) {
          delete formData.image;
        }
        await updateItem({ id: editingData.id, ...formData }).unwrap();
        toast.success("Item berhasil diperbarui!");
      } else {
        await addItem(formData).unwrap();
        toast.success("Item baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Form submission error:", err);
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
        <div className="flex items-center gap-2 mb-2">
          <FiCoffee className="h-6 w-6 text-brand-gold" />
          <h3 className="font-bold text-lg text-brand-gold">
            {isEditMode ? "Edit Item" : "Add New Food & Drink Item"}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-brand-gold">
                  Item Name
                </span>
              </label>
              <input
                type="text"
                {...register("name")}
                className={`input input-bordered focus:border-brand-gold focus:ring-brand-gold ${errors.name ? "input-error" : ""}`}
                placeholder="e.g. Cheeseburger"
              />
              {errors.name && (
                <span className="text-xs text-error mt-1">{errors.name.message}</span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-brand-gold">
                  Category
                </span>
              </label>
              <select
                {...register("fnb_category_id")}
                className={`select select-bordered focus:border-brand-gold focus:ring-brand-gold ${errors.fnb_category_id ? "select-error" : ""}`}
              >
                <option value="">Pilih Kategori...</option>
                {isLoadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categoriesData?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))
                )}
              </select>
              {errors.fnb_category_id && (
                <span className="text-xs text-error mt-1">{errors.fnb_category_id.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-brand-gold">
                  Price
                </span>
              </label>
              <input
                type="number"
                {...register("price")}
                className={`input input-bordered focus:border-brand-gold focus:ring-brand-gold ${errors.price ? "input-error" : ""}`}
                placeholder="e.g. 15000"
              />
              {errors.price && (
                <span className="text-xs text-error mt-1">{errors.price.message}</span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-brand-gold">
                  Is Available?
                </span>
              </label>
              <input
                type="checkbox"
                {...register("is_available")}
                className="toggle toggle-success border-brand-gold"
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-brand-gold">
                Description
              </span>
            </label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered focus:border-brand-gold focus:ring-brand-gold"
              placeholder="Deskripsi singkat..."
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-brand-gold">
                Image
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
                <div className="relative w-full h-40 flex items-center justify-center">
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
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
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
              {isEditMode ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditFoodDrinkModal;
