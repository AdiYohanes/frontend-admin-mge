/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddUserMutation, useUpdateUserMutation } from "../api/userApiSlice";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Updated schema to match API requirements
const adminSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
    phone: z.string().min(10, "Nomor telepon tidak valid"),
    role: z.string().nonempty("Role harus dipilih"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Hanya jalankan validasi ini jika field password sedang diisi.
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      // Jika password tidak diisi (mode edit), lewati validasi ini.
      return true;
    },
    {
      message: "Password tidak cocok",
      path: ["confirmPassword"], // Tampilkan error di field konfirmasi password
    }
  );

const AddEditAdminModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isAdding || isUpdating;

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
        // Saat edit, reset password ke string kosong agar tidak terkirim jika tidak diubah
        reset({
          ...editingData,
          password: "",
          confirmPassword: "",
          email: editingData.email || "" // Ensure email is not undefined
        });
      } else {
        reset({
          name: "",
          username: "",
          email: "",
          phone: "",
          role: "Admin",
          password: "",
          confirmPassword: "",
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      const { confirmPassword, ...dataToSend } = formData;

      if (isEditMode) {
        // Jika password tidak diisi saat edit, jangan kirim field password ke backend
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        // Remove email if it's empty for edit mode
        if (!dataToSend.email) {
          delete dataToSend.email;
        }
        await updateUser({ id: editingData.id, ...dataToSend }).unwrap();
        toast.success("Data admin berhasil diperbarui!");
      } else {
        // For add mode, ensure required fields are present
        const addData = {
          username: dataToSend.username,
          name: dataToSend.name,
          phone: dataToSend.phone,
          password: dataToSend.password,
          role: dataToSend.role
        };
        // Add email only if it's not empty
        if (dataToSend.email) {
          addData.email = dataToSend.email;
        }
        await addUser(addData).unwrap();
        toast.success("Admin baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      const errorMessages = err.data?.errors
        ? Object.values(err.data.errors).flat().join("\n")
        : "Gagal memproses data admin.";
      toast.error(errorMessages);
      console.error("Failed to process admin:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl">
              {isEditMode ? "Edit User Admin" : "Add New User Admin"}
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              {isEditMode ? "Update informasi user admin" : "Tambahkan user admin baru ke sistem"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand-gold rounded"></div>
              <h4 className="font-semibold text-lg">Informasi Pribadi</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  {...register("name")}
                  className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && (
                  <span className="text-xs text-error mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username *</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  {...register("username")}
                  className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
                />
                {errors.username && (
                  <span className="text-xs text-error mt-1">
                    {errors.username.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email (opsional)"
                  {...register("email")}
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && (
                  <span className="text-xs text-error mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  placeholder="Masukkan nomor telepon"
                  {...register("phone")}
                  className={`input input-bordered w-full ${errors.phone ? "input-error" : ""}`}
                />
                {errors.phone && (
                  <span className="text-xs text-error mt-1">
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand-gold rounded"></div>
              <h4 className="font-semibold text-lg">Role & Permissions</h4>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Role *</span>
              </label>
              <div className="p-4 bg-base-200 rounded-lg">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    {...register("role")}
                    value="Admin"
                    className="radio radio-primary checked:bg-brand-gold"
                  />
                  <div>
                    <span className="label-text font-medium">Admin</span>
                    <span className="text-xs text-base-content/60 block">Akses penuh ke sistem admin</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <span className="text-xs text-error mt-1">
                  {errors.role.message}
                </span>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand-gold rounded"></div>
              <h4 className="font-semibold text-lg">Security</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    {isEditMode ? "New Password" : "Password *"}
                  </span>
                </label>
                <input
                  type="password"
                  placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                  {...register("password")}
                  className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                />
                {errors.password && (
                  <span className="text-xs text-error mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Konfirmasi password"
                  {...register("confirmPassword")}
                  className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`}
                />
                {errors.confirmPassword && (
                  <span className="text-xs text-error mt-1">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action pt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white border-brand-gold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                isEditMode ? "Save Changes" : "Add Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditAdminModal;
