import React, { useState, useEffect } from "react";
import { useUpdateUserMutation } from "../api/userApiSlice";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

const AddEditCustomerModal = ({ isOpen, onClose, editingData }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
    });

    const [updateUser, { isLoading }] = useUpdateUserMutation();

    useEffect(() => {
        if (editingData) {
            setFormData({
                name: editingData.name || "",
                email: editingData.email || "",
                phone: editingData.phone || "",
                username: editingData.username || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                phone: "",
                username: "",
            });
        }
    }, [editingData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("🔍 DEBUG - Update Customer:", {
            customerId: editingData.id,
            formData: formData,
            editingData: editingData
        });

        try {
            const result = await updateUser({
                id: editingData.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                username: formData.username,
            }).unwrap();

            console.log("✅ DEBUG - Update Success:", result);
            toast.success("Customer berhasil diperbarui!");
            onClose();
        } catch (err) {
            console.error("❌ DEBUG - Update Error:", err);
            toast.error(err.data?.message || "Gagal memperbarui customer.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-96">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                        {editingData ? "Edit Customer" : "Add Customer"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="input input-bordered"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Phone</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Username</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
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
                                "Save"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditCustomerModal; 