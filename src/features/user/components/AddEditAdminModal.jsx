import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddUserMutation, useUpdateUserMutation } from "../api/userApiSlice";
import { toast } from "react-hot-toast";

// --- PERUBAHAN 1: Ganti validasi 'permissions' menjadi 'role' ---
const adminSchema = z.object({
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
  role: z
    .string({ required_error: "Role harus dipilih" })
    .nonempty("Role harus dipilih"),
});

const AddEditAdminModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        // Set role default ke 'Admin' untuk form baru
        reset({
          name: "",
          username: "",
          email: "",
          phoneNumber: "",
          role: "Admin",
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateUser({ ...editingData, ...formData }).unwrap();
        toast.success("Data admin berhasil diperbarui!");
      } else {
        await addUser({ ...formData, type: "admin" }).unwrap();
        toast.success("Admin baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses data admin.");
      console.error("Failed to process admin:", err);
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
          {isEditMode ? "Edit User Admin" : "Add New User Admin"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className={`input input-bordered ${
                  errors.name ? "input-error" : ""
                }`}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                {...register("username")}
                className={`input input-bordered ${
                  errors.username ? "input-error" : ""
                }`}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className={`input input-bordered ${
                  errors.email ? "input-error" : ""
                }`}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                {...register("phoneNumber")}
                className={`input input-bordered ${
                  errors.phoneNumber ? "input-error" : ""
                }`}
              />
            </div>
          </div>

          {/* --- PERUBAHAN 2: Ganti checkbox menjadi radio button --- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <div className="p-4 bg-base-200 rounded-lg flex gap-6">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  {...register("role")}
                  value="Admin"
                  className="radio checked:bg-blue-500"
                />
                <span className="label-text">Admin</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  {...register("role")}
                  value="Superadmin"
                  className="radio checked:bg-red-500"
                />
                <span className="label-text">Superadmin</span>
              </label>
            </div>
            {errors.role && (
              <span className="text-xs text-error mt-1">
                {errors.role.message}
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
              disabled={isAdding || isUpdating}
            >
              {(isAdding || isUpdating) && (
                <span className="loading loading-spinner"></span>
              )}
              {isEditMode ? "Save Changes" : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditAdminModal;
