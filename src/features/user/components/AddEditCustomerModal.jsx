import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddUserMutation, useUpdateUserMutation } from "../api/userApiSlice";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  AtSymbolIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const customerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  username: z
    .string()
    .min(4, "Username minimal 4 karakter")
    .regex(
      /^[a-z0-9_.]+$/,
      "Username hanya boleh berisi huruf kecil, angka, titik, dan underscore"
    ),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(10, "Nomor telepon tidak valid"),
});

const AddEditCustomerModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        reset({ name: "", username: "", email: "", phoneNumber: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateUser({ ...editingData, ...formData }).unwrap();
        toast.success("Data customer berhasil diperbarui!");
      } else {
        await addUser(formData).unwrap();
        toast.success("Customer baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data customer.");
      console.error("Failed to process customer:", err);
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
          {isEditMode ? "Edit Customer" : "Add New Customer"}
        </h3>

        {/* --- AWAL BLOK FORM YANG DIPERBARUI --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Grup Informasi Akun */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Informasi Akun</h4>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. Budi Hartono"
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
                <span className="label-text">Username</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  {...register("username")}
                  placeholder="e.g. budi_h"
                  className={`input input-bordered w-full pl-10 ${
                    errors.username ? "input-error" : ""
                  }`}
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Hanya huruf kecil, angka, `.` dan `_`.
                </span>
              </label>
              {errors.username && (
                <span className="text-xs text-error mt-1">
                  {errors.username.message}
                </span>
              )}
            </div>
          </div>

          {/* Grup Informasi Kontak */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Informasi Kontak</h4>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="e.g. budi@example.com"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? "input-error" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-error mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="tel"
                  {...register("phoneNumber")}
                  placeholder="e.g. 081234567890"
                  className={`input input-bordered w-full pl-10 ${
                    errors.phoneNumber ? "input-error" : ""
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <span className="text-xs text-error mt-1">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
          </div>

          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isAdding || isUpdating}
            >
              {(isAdding || isUpdating) && (
                <span className="loading loading-spinner"></span>
              )}
              {isEditMode ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
        {/* --- AKHIR BLOK FORM YANG DIPERBARUI --- */}
      </div>
    </div>
  );
};

export default AddEditCustomerModal;
