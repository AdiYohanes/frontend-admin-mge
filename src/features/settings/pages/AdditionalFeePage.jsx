import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useGetTaxesQuery, useUpdateTaxMutation, useGetServiceFeesQuery, useUpdateServiceFeeMutation } from "../api/settingsApiSlice";

const AdditionalFeePage = () => {
    const [tax, setTax] = useState("");
    const [serviceFee, setServiceFee] = useState("");

    // Fetch tax on mount
    const { data: taxesData, isLoading: isLoadingTax } = useGetTaxesQuery();
    const [updateTax, { isLoading: isUpdatingTax }] = useUpdateTaxMutation();
    const { data: serviceFeeData, isLoading: isLoadingService } = useGetServiceFeesQuery();
    const [updateServiceFee, { isLoading: isUpdatingService }] = useUpdateServiceFeeMutation();

    useEffect(() => {
        if (taxesData?.taxes?.length) {
            setTax(String(taxesData.taxes[0].percentage ?? 0));
        }
    }, [taxesData]);

    useEffect(() => {
        if (serviceFeeData?.services?.length) {
            setServiceFee(String(serviceFeeData.services[0].amount ?? 0));
        }
    }, [serviceFeeData]);

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Additional Fee</h2>

                {/* Tax Section */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-xl font-semibold">Tax</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Amount <span className="text-error">*</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={tax}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = Number(value);
                                    if (numValue < 0) {
                                        setTax("0");
                                    } else if (numValue > 100) {
                                        setTax("100");
                                    } else {
                                        setTax(value);
                                    }
                                }}
                                className="input input-bordered w-full pr-10"
                                min={0}
                                max={100}
                                aria-label="Tax percentage"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.target.blur();
                                    }
                                }}
                            />
                            {/* The % symbol is visually inside the input using absolute positioning */}
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 select-none pointer-events-none"
                                aria-hidden="true"
                            >
                                %
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="btn bg-brand-gold hover:bg-amber-600 text-white"
                            disabled={isLoadingTax || isUpdatingTax}
                            onClick={async () => {
                                try {
                                    const percentage = Number(tax);
                                    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
                                        toast.error("Percentage harus antara 0-100%");
                                        return;
                                    }
                                    await updateTax({ id: 1, percentage }).unwrap();
                                    toast.success("Tax updated");
                                } catch (err) {
                                    toast.error(err?.data?.message || "Gagal update tax");
                                }
                            }}
                        >
                            {isUpdatingTax && <span className="loading loading-spinner"></span>}
                            Save
                        </button>
                    </div>
                </div>

                {/* Service Fee Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Service Fee</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Amount <span className="text-error">*</span></span>
                        </label>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={serviceFee}
                            onChange={(e) => setServiceFee(e.target.value)}
                            className="input input-bordered w-full"
                            min={0}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="btn bg-brand-gold hover:bg-amber-600 text-white"
                            disabled={isLoadingService || isUpdatingService}
                            onClick={async () => {
                                try {
                                    const amount = Number(serviceFee);
                                    if (Number.isNaN(amount) || amount < 0) {
                                        toast.error("Amount tidak valid");
                                        return;
                                    }
                                    await updateServiceFee({ id: 1, amount }).unwrap();
                                    toast.success("Service fee updated");
                                } catch (err) {
                                    toast.error(err?.data?.message || "Gagal update service fee");
                                }
                            }}
                        >
                            {isUpdatingService && <span className="loading loading-spinner"></span>}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalFeePage;


