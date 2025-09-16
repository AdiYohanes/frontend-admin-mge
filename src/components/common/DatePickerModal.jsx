import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

const DatePickerModal = ({
    isOpen,
    onClose,
    selectedDate,
    onDateSelect,
    title = "Select Date Filter",
    yearRange = 15 // Default: 15 years before and after current year
}) => {
    const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate || new Date());

    // Initialize temp values when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSelectedDate(selectedDate || new Date());
        }
    }, [isOpen, selectedDate]);

    const handleConfirm = () => {
        onDateSelect(tempSelectedDate);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {title}
                    </h3>
                    <button
                        onClick={handleCancel}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="mb-6 space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Month</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={tempSelectedDate.getMonth() + 1}
                            onChange={(e) => {
                                const newDate = new Date(tempSelectedDate);
                                newDate.setMonth(parseInt(e.target.value) - 1);
                                setTempSelectedDate(newDate);
                            }}
                        >
                            <option value={1}>January</option>
                            <option value={2}>February</option>
                            <option value={3}>March</option>
                            <option value={4}>April</option>
                            <option value={5}>May</option>
                            <option value={6}>June</option>
                            <option value={7}>July</option>
                            <option value={8}>August</option>
                            <option value={9}>September</option>
                            <option value={10}>October</option>
                            <option value={11}>November</option>
                            <option value={12}>December</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Year</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={tempSelectedDate.getFullYear()}
                            onChange={(e) => {
                                const newDate = new Date(tempSelectedDate);
                                newDate.setFullYear(parseInt(e.target.value));
                                setTempSelectedDate(newDate);
                            }}
                        >
                            {Array.from({ length: yearRange * 2 + 1 }, (_, i) => {
                                const year = new Date().getFullYear() - yearRange + i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        onClick={handleCancel}
                        className="btn btn-outline"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn bg-brand-gold text-white border-none hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatePickerModal;
