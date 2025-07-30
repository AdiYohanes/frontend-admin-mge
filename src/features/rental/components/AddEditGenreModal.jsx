import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import {
    useAddGenreMutation,
    useUpdateGenreMutation,
} from "../api/rentalApiSlice";
import {
    TagIcon,
} from "@heroicons/react/24/outline";

const genreSchema = z.object({
    name: z.string().min(2, "Nama genre minimal 2 karakter").max(50, "Nama genre maksimal 50 karakter"),
});

const AddEditGenreModal = ({ isOpen, onClose, editingData }) => {
    const isEditMode = Boolean(editingData);

    const [addGenre, { isLoading: isAdding }] = useAddGenreMutation();
    const [updateGenre, { isLoading: isUpdating }] = useUpdateGenreMutation();
    const isLoading = isAdding || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(genreSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingData) {
                reset({ name: editingData.name });
            } else {
                reset({ name: "" });
            }
        }
    }, [isOpen, isEditMode, editingData, reset]);

    const onSubmit = async (formData) => {
        try {
            if (isEditMode) {
                await updateGenre({ id: editingData.id, ...formData }).unwrap();
                toast.success("Genre berhasil diperbarui!");
            } else {
                await addGenre(formData).unwrap();
                toast.success("Genre baru berhasil ditambahkan!");
            }
            onClose();
        } catch (err) {
            toast.error(err.data?.message || "Gagal memproses data genre.");
        }
    };

    return (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box w-11/12 max-w-md">
                <div className="flex items-center justify-between pb-4 border-b border-base-300">
                    <div className="flex items-center gap-2">
                        <TagIcon className="h-6 w-6 text-brand-gold" />
                        <h3 className="text-xl font-bold">
                            {isEditMode ? "Edit Genre" : "Add Genre"}
                        </h3>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Genre Name <span className="text-error">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            className={`input input-bordered ${errors.name ? "input-error" : ""}`}
                            placeholder="Enter genre name..."
                        />
                        {errors.name && (
                            <span className="text-xs text-error mt-1">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    <div className="modal-action pt-4 border-t border-base-300">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-brand-gold hover:bg-amber-600 text-white"
                            disabled={isLoading}
                        >
                            {isLoading && <span className="loading loading-spinner"></span>}
                            {isEditMode ? "Save Changes" : "Add Genre"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditGenreModal; 