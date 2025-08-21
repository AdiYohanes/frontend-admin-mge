import React, { useCallback, useEffect, useState } from "react";
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
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [points, setPoints] = useState(0);
    const [unitId, setUnitId] = useState("");
    const [duration, setDuration] = useState("");
    const [foodRows, setFoodRows] = useState([{ key: 1, foodId: "", qty: "" }]);
    const [drinkRows, setDrinkRows] = useState([{ key: 1, drinkId: "", qty: "" }]);

    useEffect(() => {
        if (isOpen) {
            setVoucher(generateVoucher());
            setPreview(null);
            if (editingData) {
                setName(editingData.name || "");
                setDescription(editingData.description || "");
                setType(editingData.rewardType || editingData.effects?.type || "");
                setPoints(Number(editingData.pointsRequired ?? 0));
                if ((editingData.effects?.type || editingData.rewardType) === "free_play") {
                    setUnitId(String(editingData.effects?.unit_id || editingData.unit?.id || ""));
                    setDuration(String(editingData.effects?.duration_hours || ""));
                } else if ((editingData.effects?.type || editingData.rewardType) === "free_fnb") {
                    const fnbs = editingData.effects?.fnbs || [];
                    const foods = fnbs.filter((f) => f.fnb_id && f.quantity);
                    setFoodRows(foods.length ? foods.map((f, idx) => ({ key: idx + 1, foodId: String(f.fnb_id), qty: String(f.quantity) })) : [{ key: 1, foodId: "", qty: "" }]);
                    setDrinkRows([{ key: 1, drinkId: "", qty: "" }]);
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
    }, [isOpen, editingData]);

    const onDrop = useCallback((files) => {
        if (files?.[0]) setPreview(URL.createObjectURL(files[0]));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
        maxFiles: 1,
    });

    // Fetch units and FNB categories for selects
    const { data: unitsData } = useGetUnitsQuery({ page: 1, limit: 9999, search: "" });
    const { data: fnbItemsData } = useGetFoodDrinkItemsQuery({ page: 1, limit: 9999, search: "" });
    const fnbItems = fnbItemsData?.items || [];
    const getCategoryType = (item) => {
        const raw = item?.fnb_category?.type
            ?? item?.fnb_category?.category
            ?? item?.category?.type
            ?? item?.category
            ?? "";
        return String(raw).toLowerCase();
    };
    const foodItems = fnbItems.filter((i) => getCategoryType(i).includes("food"));
    const drinkItems = fnbItems.filter((i) => getCategoryType(i).includes("drink"));

    const [addReward, { isLoading: isAdding }] = useAddRewardMutation();
    const [updateReward, { isLoading: isUpdating }] = useUpdateRewardMutation();

    const handleSubmit = async () => {
        const base = {
            name,
            description,
            points_required: Number(points) || 0,
        };
        let effects = {};
        if (type === "free_play") {
            effects = { type, unit_id: Number(unitId), duration_hours: Number(duration) };
        } else if (type === "free_fnb") {
            const fnbs = [
                ...foodRows.filter((r) => r.foodId && r.qty).map((r) => ({ fnb_id: Number(r.foodId), quantity: Number(r.qty) })),
                ...drinkRows.filter((r) => r.drinkId && r.qty).map((r) => ({ fnb_id: Number(r.drinkId), quantity: Number(r.qty) })),
            ];
            effects = { type, fnbs };
        }
        const payload = { ...base, effects };

        try {
            if (editingData?.id) {
                await updateReward({ id: editingData.id, ...payload }).unwrap();
            } else {
                await addReward(payload).unwrap();
            }
            onClose();
        } catch (e) {
            console.error("Failed to save reward", e);
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
                            <option value="free_fnb">free_fnb</option>
                            <option value="free_play">free_play</option>
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
                                <label className="label"><span className="label-text">Duration <span className="text-error">*</span></span></label>
                                <input type="number" min={0} step="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration" className="input input-bordered w-full" />
                            </div>
                        </div>
                    )}

                    {/* Conditional: free_fnb (Food & Drink) */}
                    {type === "free_fnb" && (
                        <div className="space-y-4">
                            <div>
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
                                        <select value={row.qty} onChange={(e) => {
                                            const v = e.target.value; setFoodRows((r) => r.map(rr => rr.key === row.key ? { ...rr, qty: v } : rr));
                                        }} className="select select-bordered w-full">
                                            <option value="">Quantity</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
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
                                        <select value={row.qty} onChange={(e) => {
                                            const v = e.target.value; setDrinkRows((r) => r.map(rr => rr.key === row.key ? { ...rr, qty: v } : rr));
                                        }} className="select select-bordered w-full">
                                            <option value="">Quantity</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
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


