import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddFaqMutation,
  useUpdateFaqMutation,
} from "../api/settingsApiSlice";
import { toast } from "react-hot-toast";

// Skema validasi untuk form FAQ
const faqSchema = z.object({
  question: z.string().min(10, "Pertanyaan minimal 10 karakter"),
  answer: z.string().min(20, "Jawaban minimal 20 karakter"),
});

const AddEditFaqModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

  // Inisialisasi hooks mutation dari RTK Query
  const [addFaq, { isLoading: isAdding }] = useAddFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const isLoading = isAdding || isUpdating;

  // Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
  });

  // Efek untuk mengisi atau mereset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        // Mode Edit: isi form dengan data yang ada
        reset(editingData);
      } else {
        // Mode Tambah: reset ke form kosong
        reset({ question: "", answer: "" });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  // Fungsi yang dijalankan saat form di-submit
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        // Panggil mutation update jika dalam mode edit
        await updateFaq({ ...editingData, ...formData }).unwrap();
        toast.success("FAQ berhasil diperbarui!");
      } else {
        // Panggil mutation tambah jika dalam mode tambah
        await addFaq(formData).unwrap();
        toast.success("FAQ baru berhasil ditambahkan!");
      }
      onClose(); // Tutup modal setelah sukses
    } catch (err) {
      toast.error("Gagal memproses data FAQ.");
      console.error("Failed to process FAQ:", err);
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
          {isEditMode ? "Edit FAQ" : "Add New FAQ"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Question</span>
            </label>
            <input
              type="text"
              {...register("question")}
              placeholder="e.g. Bagaimana cara booking?"
              className={`input input-bordered ${
                errors.question ? "input-error" : ""
              }`}
            />
            {errors.question && (
              <span className="text-xs text-error mt-1">
                {errors.question.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Answer</span>
            </label>
            <textarea
              {...register("answer")}
              className={`textarea textarea-bordered h-32 ${
                errors.answer ? "textarea-error" : ""
              }`}
              placeholder="Tulis jawaban dari pertanyaan di atas..."
            ></textarea>
            {errors.answer && (
              <span className="text-xs text-error mt-1">
                {errors.answer.message}
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
              {isEditMode ? "Save Changes" : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditFaqModal;
