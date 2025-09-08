import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useGetUnitsQuery } from "../../rental/api/rentalApiSlice";
import { useGetFoodDrinkItemsQuery } from "../../food-drink/api/foodDrinkApiSlice";

const generateVoucher = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
    return `MGE${code}`.slice(0, 8); // ensure 8-length sample like screenshot
};

import { useAddRewardMutation, useUpdateRewardMutation } from "../api/settingsApiSlice";

const AddRewardModal = ({ isOpen, onClose, editingData }) => {
    const [voucher, setVoucher] = useState("");
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [points, setPoints] = useState(0);
    const [unitId, setUnitId] = useState("");
    const [duration, setDuration] = useState("");
    const [foodRows, setFoodRows] = useState([{ key: 1, foodId: "", qty: "" }]);
    const [drinkRows, setDrinkRows] = useState([{ key: 1, drinkId: "", qty: "" }]);

    // Fetch units and FNB categories for selects
    const { data: unitsData } = useGetUnitsQuery({ page: 1, limit: 9999, search: "" });
    const { data: fnbItemsData, isLoading: isLoadingFnbItems } = useGetFoodDrinkItemsQuery({ page: 1, limit: 9999, search: "" });
    const fnbItems = useMemo(() => fnbItemsData?.items || [], [fnbItemsData?.items]);

    const getCategoryType = (item) => {
        const raw = item?.fnb_category?.type
            ?? item?.fnb_category?.category
            ?? item?.category?.type
            ?? item?.category
            ?? "";
        return String(raw).toLowerCase();
    };

    const foodItems = useMemo(() => fnbItems.filter((i) => getCategoryType(i).includes("food")), [fnbItems]);
    const drinkItems = useMemo(() => fnbItems.filter((i) => getCategoryType(i).includes("drink")), [fnbItems]);

    useEffect(() => {
        if (isOpen) {
            setVoucher(generateVoucher());
            setPreview(null);
            setImageFile(null);
            if (editingData) {
                // Set preview for existing image when editing
                if (editingData.imageUrl) {
                    setPreview(editingData.imageUrl);
                }
                setName(editingData.name || "");
                setDescription(editingData.description || "");
                setType(editingData.rewardType || editingData.effects?.type || "");
                setPoints(Number(editingData.pointsRequired ?? 0));
                if ((editingData.effects?.type || editingData.rewardType) === "free_play") {
                    setUnitId(String(editingData.effects?.unit_id || editingData.unit?.id || ""));
                    setDuration(String(editingData.effects?.duration_hours || ""));
                } else if ((editingData.effects?.type || editingData.rewardType) === "free_fnb") {
                    // Only process FNB data if FNB items are loaded
                    if (!isLoadingFnbItems && fnbItems.length > 0) {
                        const fnbs = editingData.effects?.fnbs || [];
                        console.log("Editing FNB data:", fnbs);
                        console.log("Available FNB items:", fnbItems);

                        // Separate food and drink items
                        const foodItemsData = [];
                        const drinkItemsData = [];

                        fnbs.forEach((f) => {
                            if (f.fnb_id && f.quantity) {
                                // Check if this item is food or drink by looking at the item data
                                const item = fnbItems.find(item => item.id === f.fnb_id);
                                console.log(`Processing FNB item ${f.fnb_id}:`, item);
                                if (item) {
                                    const categoryType = getCategoryType(item);
                                    console.log(`Category type for item ${f.fnb_id}:`, categoryType);
                                    if (categoryType.includes("food")) {
                                        foodItemsData.push({ key: Date.now() + Math.random(), foodId: String(f.fnb_id), qty: String(f.quantity) });
                                    } else if (categoryType.includes("drink")) {
                                        drinkItemsData.push({ key: Date.now() + Math.random(), drinkId: String(f.fnb_id), qty: String(f.quantity) });
                                    }
                                } else {
                                    console.warn(`FNB item with ID ${f.fnb_id} not found in available items`);
                                }
                            }
                        });

                        console.log("Processed food items:", foodItemsData);
                        console.log("Processed drink items:", drinkItemsData);

                        setFoodRows(foodItemsData.length ? foodItemsData : [{ key: 1, foodId: "", qty: "" }]);
                        setDrinkRows(drinkItemsData.length ? drinkItemsData : [{ key: 1, drinkId: "", qty: "" }]);
                    } else {
                        // If FNB items are still loading, set default empty rows
                        console.log("FNB items still loading, setting default rows");
                        setFoodRows([{ key: 1, foodId: "", qty: "" }]);
                        setDrinkRows([{ key: 1, drinkId: "", qty: "" }]);
                    }
                }
            } else {
                setName("");
                setDescription("");
                setType("");
                setPoints(0);
                setUnitId("");
                setDuration("");
                setFoodRows([{ key: 1, foodId: "", qty: "" }]);
                setDrinkRows([{ key: 1, drinkId: "", qty: "" }]);
            }
        }
    }, [isOpen, editingData, fnbItems, isLoadingFnbItems]);

    const onDrop = useCallback((files) => {
        if (files?.[0]) {
            const file = files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image file (JPEG, JPG, or PNG)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert('Image file size must be less than 5MB');
                return;
            }

            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
        maxFiles: 1,
    });

    const [addReward, { isLoading: isAdding }] = useAddRewardMutation();
    const [updateReward, { isLoading: isUpdating }] = useUpdateRewardMutation();

    const handleSubmit = async () => {
        // Validation
        if (!name.trim()) {
            alert("Name is required");
            return;
        }
        if (!description.trim()) {
            alert("Description is required");
            return;
        }
        if (!type) {
            alert("Reward type is required");
            return;
        }
        if (points <= 0) {
            alert("Points required must be greater than 0");
            return;
        }
        if (!imageFile && !editingData?.imageUrl) {
            alert("Image is required");
            return;
        }

        let effects = [];

        if (type === "free_play") {
            if (!unitId) {
                alert("Unit is required for room reward");
                return;
            }
            if (!duration || Number(duration) <= 0) {
                alert("Duration must be greater than 0");
                return;
            }
            effects = [{ type, unit_id: Number(unitId), duration_hours: Number(duration) }];
        } else if (type === "free_fnb") {
            const fnbs = [
                ...foodRows.filter((r) => r.foodId && r.qty).map((r) => ({ fnb_id: Number(r.foodId), quantity: Number(r.qty) })),
                ...drinkRows.filter((r) => r.drinkId && r.qty).map((r) => ({ fnb_id: Number(r.drinkId), quantity: Number(r.qty) })),
            ];

            if (fnbs.length === 0) {
                alert("Please select at least one food or drink item");
                return;
            }

            effects = [{ type, fnbs }];
        }

        // Create FormData for file upload
        const formData = new FormData();

        // Add basic data
        formData.append('name', name);
        formData.append('description', description);
        formData.append('points_required', points);

        // Add effects as individual fields
        if (effects.length > 0) {
            const effect = effects[0]; // Take first effect
            formData.append('effects[type]', effect.type);
            if (effect.unit_id) {
                formData.append('effects[unit_id]', effect.unit_id);
            }
            if (effect.duration_hours) {
                formData.append('effects[duration_hours]', effect.duration_hours);
            }
            if (effect.fnbs) {
                effect.fnbs.forEach((fnb, fnbIndex) => {
                    formData.append(`effects[fnbs][${fnbIndex}][fnb_id]`, fnb.fnb_id);
                    formData.append(`effects[fnbs][${fnbIndex}][quantity]`, fnb.quantity);
                });
            }
        }

        // Add image if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }

        console.log("Submitting reward:", {
            name,
            description,
            points_required: points,
            effects,
            hasImage: !!imageFile,
            imageType: imageFile?.type,
            imageSize: imageFile?.size
        });

        try {
            if (editingData?.id) {
                await updateReward({ id: editingData.id, formData }).unwrap();
            } else {
                await addReward(formData).unwrap();
            }
            onClose();
        } catch (e) {
            console.error("Failed to save reward", e);
            alert("Failed to save reward. Please try again.");
        }
    };

    return (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box w-11/12 max-w-3xl">
                <div className="flex items-center justify-between pb-3 border-b border-base-300">
                    <h3 className="text-lg font-semibold">Add Rewards</h3>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="space-y-4 mt-4">
                    {/* Voucher Code - readonly */}
                    <div className="form-control flex flex-col">
                        <label className="label">
                            <span className="label-text">Voucher Code <span className="text-error">*</span></span>
                        </label>
                        <input value={voucher} readOnly className="input input-bordered bg-base-200 w-full" aria-label="Voucher Code" />
                    </div>

                    {/* Image Upload */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Image <span className="text-error">*</span></span>
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive ? "border-brand-gold bg-brand-gold/5" : "border-brand-gold/50"
                                }`}
                            aria-label="Upload image"
                            tabIndex={0}
                        >
                            <input {...getInputProps()} />
                            {preview ? (
                                <div className="flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="max-h-40 object-contain" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 py-6">
                                    <FiUpload className="h-7 w-7 text-brand-gold" />
                                    <p className="text-sm">Drop files here or click to upload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="form-control flex flex-col">
                        <label className="label"><span className="label-text">Name <span className="text-error">*</span></span></label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input input-bordered w-full" />
                    </div>

                    {/* Description */}
                    <div className="form-control flex flex-col">
                        <label className="label"><span className="label-text">Description <span className="text-error">*</span></span></label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="textarea textarea-bordered h-28 w-full" />
                    </div>

                    {/* Reward Type */}
                    <div className="form-control flex flex-col">
                        <label className="label"><span className="label-text">Reward Type <span className="text-error">*</span></span></label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="select select-bordered w-full cursor-pointer">
                            <option value="" disabled>Type</option>
                            <option value="free_fnb">Food & Drink</option>
                            <option value="free_play">Room</option>
                        </select>
                    </div>

                    {/* Conditional: free_play (Room) */}
                    {type === "free_play" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control flex flex-col">
                                <label className="label"><span className="label-text">Unit <span className="text-error">*</span></span></label>
                                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="select select-bordered w-full">
                                    <option value="" disabled>Unit</option>
                                    {unitsData?.units?.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name || u.title || u.unit_name || u.id}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control flex flex-col">
                                <label className="label"><span className="label-text">Duration (hours)<span className="text-error">*</span></span></label>
                                <input type="number" min={0} step="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration" className="input input-bordered w-full" />
                            </div>
                        </div>
                    )}

                    {/* Conditional: free_fnb (Food & Drink) */}
                    {type === "free_fnb" && (
                        <div className="space-y-4">
                            <div className="alert alert-info">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>You can add food items, drink items, or both. At least one item is required.</span>
                            </div>

                            {isLoadingFnbItems ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <span className="ml-2">Loading food & drink items...</span>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Food Items</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="label"><span className="label-text">Food</span></label>
                                            <label className="label"><span className="label-text">Quantity</span></label>
                                        </div>
                                        {foodRows.map((row, idx) => (
                                            <div key={row.key} className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                                                <select value={row.foodId} onChange={(e) => {
                                                    const v = e.target.value; setFoodRows((r) => r.map(rr => rr.key === row.key ? { ...rr, foodId: v } : rr));
                                                }} className="select select-bordered w-full">
                                                    <option value="">Food</option>
                                                    {foodItems?.map((i) => (
                                                        <option key={`food-${i.id}`} value={i.id}>{i.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={row.qty}
                                                    onChange={(e) => {
                                                        const v = e.target.value; setFoodRows((r) => r.map(rr => rr.key === row.key ? { ...rr, qty: v } : rr));
                                                    }}
                                                    placeholder="Qty"
                                                    className="input input-bordered w-full"
                                                />
                                                <div className="flex justify-end">
                                                    {idx === 0 ? (
                                                        <button type="button" className="btn btn-square bg-brand-gold hover:bg-amber-600 text-white" onClick={() => setFoodRows((r) => [...r, { key: Date.now(), foodId: "", qty: "" }])} aria-label="Add food row">
                                                            <PlusIcon className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="btn btn-square btn-outline btn-error" onClick={() => setFoodRows((r) => r.filter(rr => rr.key !== row.key))} aria-label="Remove food row">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Drink Items</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="label"><span className="label-text">Drink</span></label>
                                            <label className="label"><span className="label-text">Quantity</span></label>
                                        </div>
                                        {drinkRows.map((row, idx) => (
                                            <div key={row.key} className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                                                <select value={row.drinkId} onChange={(e) => {
                                                    const v = e.target.value; setDrinkRows((r) => r.map(rr => rr.key === row.key ? { ...rr, drinkId: v } : rr));
                                                }} className="select select-bordered w-full">
                                                    <option value="">Drink</option>
                                                    {drinkItems?.map((i) => (
                                                        <option key={`drink-${i.id}`} value={i.id}>{i.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={row.qty}
                                                    onChange={(e) => {
                                                        const v = e.target.value; setDrinkRows((r) => r.map(rr => rr.key === row.key ? { ...rr, qty: v } : rr));
                                                    }}
                                                    placeholder="Qty"
                                                    className="input input-bordered w-full"
                                                />
                                                <div className="flex justify-end">
                                                    {idx === 0 ? (
                                                        <button type="button" className="btn btn-square bg-brand-gold hover:bg-amber-600 text-white" onClick={() => setDrinkRows((r) => [...r, { key: Date.now(), drinkId: "", qty: "" }])} aria-label="Add drink row">
                                                            <PlusIcon className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="btn btn-square btn-outline btn-error" onClick={() => setDrinkRows((r) => r.filter(rr => rr.key !== row.key))} aria-label="Remove drink row">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Points Required */}
                    <div className="form-control flex flex-col">
                        <label className="label"><span className="label-text">Points Required <span className="text-error">*</span></span></label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value) || 0)}
                            className="input input-bordered w-full"
                            min={0}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="modal-action pt-4 border-t border-base-300">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn bg-brand-gold hover:bg-amber-600 text-white" type="button" onClick={handleSubmit} disabled={isAdding || isUpdating}>{editingData ? "Save" : "Add Rewards"}</button>
                </div>
            </div>
        </div>
    );
};

export default AddRewardModal;