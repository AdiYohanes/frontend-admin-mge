import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import {
    useAddPricelistMutation,
    useUpdatePricelistMutation,
} from "../api/settingsApiSlice";
import {
    ArrowUpTrayIcon,
    XCircleIcon,
    DocumentIcon,
} from "@heroicons/react/24/outline";

const pricelistSchema = z.object({
    title: z.string().min(3, "Title minimal 3 karakter"),
    file: z
        .any()
        .refine((files) => !files || files?.[0], {
            message: "File wajib diunggah.",
        })
        .refine(
            (files) => !files || files?.[0]?.size <= 10 * 1024 * 1024,
            `Ukuran file maksimal 10MB.`
        )
        .optional(),
    is_active: z.boolean().default(true),
});

const AddEditPricelistModal = ({ isOpen, onClose, editingData }) => {
    const isEditMode = Boolean(editingData);
    const [preview, setPreview] = useState(null);

    const [addPricelist, { isLoading: isAdding }] = useAddPricelistMutation();
    const [updatePricelist, { isLoading: isUpdating }] = useUpdatePricelistMutation();
    const isLoading = isAdding || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(pricelistSchema),
        defaultValues: {
            title: "",
            file: null,
            is_active: true,
        },
    });

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles?.[0]) {
                setValue("file", acceptedFiles, { shouldValidate: true });
                setPreview(URL.createObjectURL(acceptedFiles[0]));
            }
        },
        [setValue]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
        },
        maxFiles: 1,
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingData) {
                reset({
                    title: editingData.title || "",
                    file: null,
                    is_active: editingData.is_active === 1,
                });
                // Show existing file if available
                if (editingData.file_url) {
                    setPreview(editingData.file_url);
                } else {
                    setPreview(null);
                }
            } else {
                reset({
                    title: "",
                    file: null,
                    is_active: true,
                });
                setPreview(null);
            }
        }
    }, [isOpen, isEditMode, editingData, reset]);

    const handleRemoveFile = () => {
        setPreview(null);
        setValue("file", null);
    };

    const onSubmit = async (formData) => {
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('is_active', formData.is_active ? '1' : '0');

            if (formData.file && formData.file[0]) {
                submitData.append('file', formData.file[0]);
            }

            if (isEditMode) {
                await updatePricelist({ id: editingData.id, data: submitData }).unwrap();
                toast.success("Pricelist berhasil diperbarui!");
            } else {
                await addPricelist(submitData).unwrap();
                toast.success("Pricelist baru berhasil ditambahkan!");
            }
            onClose();
        } catch (err) {
            toast.error(err.data?.message || "Gagal memproses data pricelist.");
        }
    };

    return (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box w-11/12 max-w-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-base-300">
                    <div className="flex items-center gap-2">
                        <DocumentIcon className="h-6 w-6 text-brand-gold" />
                        <h3 className="text-xl font-bold">
                            {isEditMode ? "Edit Pricelist" : "Add Pricelist"}
                        </h3>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    {/* File Upload Section */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                File <span className="text-error">*</span>
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
                                // Preview File Mode
                                <div className="relative w-full h-48 flex items-center justify-center">
                                    <div className="text-center">
                                        <DocumentIcon className="h-16 w-16 text-brand-gold mx-auto mb-4" />
                                        <p className="font-medium text-base-content">
                                            {editingData?.file_name || "File uploaded"}
                                        </p>
                                        <p className="text-sm text-base-content/60 mt-1">
                                            Click to change file or drag and drop
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile();
                                        }}
                                        className="btn btn-sm btn-circle bg-red-500 hover:bg-red-600 text-white absolute top-2 right-2 shadow-lg"
                                    >
                                        <XCircleIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                // Upload Mode
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <div className="p-4 bg-brand-gold/10 rounded-full">
                                        <ArrowUpTrayIcon className="h-8 w-8 text-brand-gold" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-base-content">
                                            {isDragActive ? "Drop the file here" : "Drop files here or click to upload"}
                                        </p>
                                        <p className="text-xs text-base-content/60 mt-1">
                                            PDF, DOC, DOCX, XLS, XLSX (Maks. 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.file && (
                            <span className="text-xs text-error mt-2">
                                {errors.file.message}
                            </span>
                        )}
                    </div>

                    {/* Title & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Title <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                {...register("title")}
                                placeholder="Enter pricelist title..."
                                className={`input input-bordered ${errors.title ? "input-error" : ""
                                    }`}
                            />
                            {errors.title && (
                                <span className="text-xs text-error mt-1">
                                    {errors.title.message}
                                </span>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Status</span>
                            </label>
                            <label className="label cursor-pointer">
                                <span className="label-text">Active</span>
                                <input
                                    type="checkbox"
                                    {...register("is_active")}
                                    className="toggle toggle-primary"
                                />
                            </label>
                        </div>
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
                            {isEditMode ? "Save Changes" : "Add Pricelist"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditPricelistModal; 