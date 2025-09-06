import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useAddEventBookingMutation,
    useUpdateEventBookingMutation,
} from "../api/eventBookingApiSlice";
import { useGetAllUnitsAdminQuery, useGetAllConsolesQuery, useGetAllRoomsQuery } from "../../rental/api/rentalApiSlice";
import { toast } from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDaysIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

const eventSchema = z.object({
    eventName: z.string().min(1, { message: "Event Name harus diisi" }),
    eventDescription: z.string().min(1, { message: "Event Description harus diisi" }),
    consoleId: z.number().min(1, { message: "Console harus dipilih" }),
    roomId: z.number().min(1, { message: "Room harus dipilih" }),
    unitIds: z.array(z.number()).min(1, { message: "Pilih minimal satu unit" }),
    totalPerson: z.number().min(1, { message: "Total Person minimal 1" }),
    startTime: z.string().min(1, { message: "Start Time harus diisi" }),
    endTime: z.string().min(1, { message: "End Time harus diisi" }),
    duration: z.number().optional(),
    tanggalBooking: z.date({ required_error: "Tanggal Booking harus diisi" }),
});

// Generate time options with 30-minute intervals
const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(timeString);
        }
    }
    return times;
};

const timeOptions = generateTimeOptions();

// Generate end time options based on start time
const generateEndTimeOptions = (startTime) => {
    if (!startTime) return timeOptions;

    const startTimeIndex = timeOptions.indexOf(startTime);
    if (startTimeIndex === -1) return timeOptions;

    // Return only times after the selected start time
    return timeOptions.slice(startTimeIndex + 1);
};

// Helper function to format date for API
const formatDateTimeForAPI = (date) => {
    // Ensure we're working with local time and format as ISO string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format as YYYY-MM-DD HH:mm (24-hour format)
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const AddEditEventModal = ({ isOpen, onClose, editingData }) => {
    const isEditMode = Boolean(editingData);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

    const [addEventBooking, { isLoading: isAdding }] = useAddEventBookingMutation();
    const [updateEventBooking, { isLoading: isUpdating }] = useUpdateEventBookingMutation();
    const isLoading = isAdding || isUpdating;

    // Fetch data for dropdowns
    const { data: consolesData, isLoading: consolesLoading } = useGetAllConsolesQuery();
    const { data: roomsData, isLoading: roomsLoading } = useGetAllRoomsQuery();

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(eventSchema),
    });

    // Watch form values
    const watchedStartTime = watch("startTime");
    const watchedEndTime = watch("endTime");
    const watchedRoomId = watch("roomId");

    // Watch room selection to filter units
    const selectedRoomId = watch("roomId");
    const selectedRoom = roomsData?.find(room => room.id === selectedRoomId);
    const roomName = selectedRoom?.name;

    const { data: unitsData, isLoading: unitsLoading } = useGetAllUnitsAdminQuery(
        roomName ? { room_name: roomName } : {}
    );

    // Calculate duration automatically
    useEffect(() => {
        if (watchedStartTime && watchedEndTime) {
            const startTime = new Date(`2000-01-01T${watchedStartTime}`);
            const endTime = new Date(`2000-01-01T${watchedEndTime}`);

            if (endTime > startTime) {
                const durationMs = endTime - startTime;
                const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
                setValue("duration", durationHours);
            }
        }
    }, [watchedStartTime, watchedEndTime, setValue]);

    // Reset unit selection when room changes
    useEffect(() => {
        if (watchedRoomId) {
            setValue("unitIds", []);
        }
    }, [watchedRoomId, setValue]);

    // Reset end time when start time changes and end time is before start time
    useEffect(() => {
        if (watchedStartTime && watchedEndTime) {
            const startTimeIndex = timeOptions.indexOf(watchedStartTime);
            const endTimeIndex = timeOptions.indexOf(watchedEndTime);

            if (endTimeIndex <= startTimeIndex) {
                // Reset end time to next available time or empty
                const nextTimeIndex = startTimeIndex + 1;
                if (nextTimeIndex < timeOptions.length) {
                    setValue("endTime", timeOptions[nextTimeIndex]);
                } else {
                    setValue("endTime", "");
                }
            }
        }
    }, [watchedStartTime, watchedEndTime, setValue]);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDatePicker && !event.target.closest('.date-picker-container')) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDatePicker]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingData) {
                console.log('=== EDIT MODE DEBUG ===');
                console.log('Editing data received:', editingData);
                console.log('Raw event data:', editingData.rawEvent);
                console.log('Raw booking data:', editingData.rawBooking);

                // Extract time from start_time string
                let startTimeString = "09:00";
                let endTimeString = "10:00";
                if (editingData.startTime) {
                    const startDate = new Date(editingData.startTime);
                    startTimeString = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
                }
                if (editingData.endTime) {
                    const endDate = new Date(editingData.endTime);
                    endTimeString = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
                }

                const editData = {
                    eventName: editingData.eventName || "",
                    eventDescription: editingData.eventDescription || "",
                    consoleId: editingData.rawBooking?.unit?.consoles?.[0]?.id || 1,
                    roomId: editingData.rawBooking?.unit?.room?.id || 1,
                    unitIds: (editingData.unitIds && editingData.unitIds.length > 0)
                        ? editingData.unitIds
                        : (editingData.unitId ? [editingData.unitId] : (editingData.rawBooking?.unit?.id ? [editingData.rawBooking.unit.id] : [])),
                    totalPerson: editingData.totalPerson || 10,
                    startTime: startTimeString,
                    endTime: endTimeString,
                    tanggalBooking: editingData.tanggalBooking ? new Date(editingData.tanggalBooking) : new Date(),
                };

                console.log('Processed edit data:', editData);
                console.log('=== END EDIT DEBUG ===');
                reset(editData);
            } else {
                const defaultData = {
                    eventName: "",
                    eventDescription: "",
                    consoleId: 1,
                    roomId: 1,
                    unitIds: [],
                    totalPerson: 10,
                    startTime: "09:00",
                    endTime: "10:00",
                    tanggalBooking: new Date(),
                };
                console.log('Resetting form with default data:', defaultData);
                reset(defaultData);
            }
        }
    }, [isOpen, isEditMode, editingData, reset]);

    const onSubmit = async (formData) => {
        console.log('=== FORM SUBMIT DEBUG ===');
        console.log('Form data received:', formData);

        try {
            // Validate required fields
            if (!formData.eventName || !formData.eventDescription || !formData.unitIds || formData.unitIds.length === 0 || !formData.totalPerson || !formData.tanggalBooking || !formData.startTime || !formData.endTime) {
                console.error('Missing required fields:', {
                    eventName: !!formData.eventName,
                    eventDescription: !!formData.eventDescription,
                    unitIds: !!formData.unitIds && formData.unitIds.length > 0,
                    totalPerson: !!formData.totalPerson,
                    tanggalBooking: !!formData.tanggalBooking,
                    startTime: !!formData.startTime,
                    endTime: !!formData.endTime
                });
                toast.error("Mohon isi semua field yang diperlukan");
                return;
            }

            const [startHours, startMinutes] = formData.startTime.split(":");
            const [endHours, endMinutes] = formData.endTime.split(":");

            const startTimeDate = new Date(formData.tanggalBooking);
            startTimeDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

            const endTimeDate = new Date(formData.tanggalBooking);
            endTimeDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

            // Validate business hours (10 AM to 11:30 PM)
            const startHour = parseInt(startHours);
            const endHour = parseInt(endHours);
            const endMinutesInt = parseInt(endMinutes);

            if (startHour < 10 || startHour >= 23) {
                toast.error("Start time must be between 10:00 and 22:30");
                return;
            }

            if (startHour === 22 && parseInt(startMinutes) > 30) {
                toast.error("Start time cannot be after 22:30");
                return;
            }

            if (endHour < 10 || endHour > 23) {
                toast.error("End time must be between 10:00 and 23:30");
                return;
            }

            if (endHour === 23 && endMinutesInt > 30) {
                toast.error("End time cannot be after 23:30");
                return;
            }

            console.log('=== BUSINESS HOURS DEBUG ===');
            console.log('Frontend Business Hours: 10:00 - 23:30');
            console.log('Selected Start Time:', formData.startTime, '(Hour:', startHour, ')');
            console.log('Selected End Time:', formData.endTime, '(Hour:', endHour, ')');
            console.log('Date:', formData.tanggalBooking);
            console.log('Start Time Formatted for API:', formatDateTimeForAPI(startTimeDate));
            console.log('End Time Formatted for API:', formatDateTimeForAPI(endTimeDate));
            console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
            console.log('Local Time:', startTimeDate.toLocaleString());
            console.log('UTC Time:', startTimeDate.toISOString());
            console.log('=== END DEBUG ===');

            // Payload sesuai API
            const finalData = {
                name: formData.eventName,
                description: formData.eventDescription,
                start_time: formatDateTimeForAPI(startTimeDate),
                end_time: formatDateTimeForAPI(endTimeDate),
                unit_ids: formData.unitIds,
            };

            console.log('Payload to API:', finalData);

            if (isEditMode) {
                console.log('=== UPDATE MODE DEBUG ===');
                console.log('Editing data:', editingData);
                const eventId = editingData.rawEvent?.id || editingData.rawBooking?.event_id || editingData.id;
                console.log('Final event ID for update:', eventId);
                console.log('=== END UPDATE DEBUG ===');

                await updateEventBooking({ id: eventId, ...finalData }).unwrap();
                toast.success("Event berhasil diperbarui!");
            } else {
                console.log('Adding new event');
                await addEventBooking(finalData).unwrap();
                toast.success("Event baru berhasil ditambahkan!");
            }
            onClose();
        } catch (err) {
            console.error("Failed to process event:", err);
            console.error("Error details:", {
                status: err?.status,
                data: err?.data,
                message: err?.message,
                originalError: err
            });

            // Display specific error message if available
            if (err?.data?.message) {
                toast.error(`Error: ${err.data.message}`);
            } else if (err?.data?.error) {
                toast.error(`Error: ${err.data.error}`);
            } else if (err?.message) {
                toast.error(`Error: ${err.message}`);
            } else {
                toast.error("Gagal memproses event.");
            }
        }
    };

    return (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box w-11/12 max-w-2xl bg-base-100">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                    <h3 className="font-bold text-xl text-gray-800">
                        {isEditMode ? "Edit Event" : "Add Event"}
                    </h3>
                    <button
                        className="btn btn-ghost btn-sm btn-circle"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.error('Form validation errors:', errors);
                })} className="flex flex-col space-y-4">
                    {/* Event Name */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Event Name <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            {...register("eventName")}
                            className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.eventName ? "input-error" : ""}`}
                            placeholder="Name"
                        />
                        {errors.eventName && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.eventName.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Event Description */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Event Description <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            {...register("eventDescription")}
                            className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.eventDescription ? "input-error" : ""}`}
                            placeholder="Name"
                        />
                        {errors.eventDescription && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.eventDescription.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Console */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Console <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <select
                            {...register("consoleId", { valueAsNumber: true })}
                            className={`select select-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.consoleId ? "select-error" : ""}`}
                            disabled={consolesLoading}
                        >
                            <option value="">Status</option>
                            {consolesData?.map((console) => (
                                <option key={console.id} value={console.id}>
                                    {console.name}
                                </option>
                            ))}
                        </select>
                        {errors.consoleId && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.consoleId.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Room */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Room <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <select
                            {...register("roomId", { valueAsNumber: true })}
                            className={`select select-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.roomId ? "select-error" : ""}`}
                            disabled={roomsLoading}
                        >
                            <option value="">Status</option>
                            {roomsData?.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                        {errors.roomId && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.roomId.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Unit (Multi-select like console picker) */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Unit <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <Controller
                            name="unitIds"
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => {
                                const selectedUnitIds = field.value || [];
                                return (
                                    <div className="w-full">
                                        {/* Trigger */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                                                className={`w-full btn btn-outline justify-between text-left font-normal border-base-300 hover:border-brand-gold hover:bg-brand-gold/5 ${errors.unitIds ? 'border-error' : ''}`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {selectedUnitIds.length > 0
                                                        ? `${selectedUnitIds.length} unit${selectedUnitIds.length > 1 ? 's' : ''} selected`
                                                        : 'Pilih unit...'}
                                                </span>
                                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown */}
                                            {isUnitDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                                                    {unitsLoading ? (
                                                        <div className="px-4 py-2 text-center text-sm text-gray-500">
                                                            Loading units...
                                                        </div>
                                                    ) : unitsData && unitsData.length > 0 ? (
                                                        unitsData.map(unit => (
                                                            <label
                                                                key={unit.id}
                                                                className="flex items-center justify-between px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
                                                            >
                                                                <span className="text-sm">{unit.name} - {unit.room?.name}</span>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-sm checkbox-primary"
                                                                    checked={selectedUnitIds.includes(unit.id)}
                                                                    onChange={() => {
                                                                        const isSelected = selectedUnitIds.includes(unit.id);
                                                                        const newSelection = isSelected
                                                                            ? selectedUnitIds.filter(id => id !== unit.id)
                                                                            : [...selectedUnitIds, unit.id];
                                                                        field.onChange(newSelection);
                                                                    }}
                                                                />
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-center text-sm text-gray-500">
                                                            {roomName ? `No units available in ${roomName}` : 'Please select a room first'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected badges */}
                                        {selectedUnitIds.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {selectedUnitIds.map(uid => {
                                                    const u = unitsData?.find(x => x.id === uid);
                                                    if (!u) return null;
                                                    return (
                                                        <div key={uid} className="badge badge-sm badge-outline gap-1 border-brand-gold text-brand-gold">
                                                            {u.name}
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-circle btn-ghost hover:bg-red-500 hover:text-white -ml-1"
                                                                onClick={() => field.onChange(selectedUnitIds.filter(id => id !== uid))}
                                                                aria-label="Remove unit"
                                                            >
                                                                <XMarkIcon className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {errors.unitIds && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">
                                                    {errors.unitIds.message}
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* Total Person */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Total Person <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <input
                            type="number"
                            {...register("totalPerson", { valueAsNumber: true })}
                            className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.totalPerson ? "input-error" : ""}`}
                            min="1"
                            placeholder="Durasi"
                        />
                        {errors.totalPerson && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.totalPerson.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Start Time & End Time - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label mb-2">
                                <span className="label-text font-medium">
                                    Start Time <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <select
                                {...register("startTime")}
                                className={`select select-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.startTime ? "select-error" : ""}`}
                            >
                                {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                            {errors.startTime && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.startTime.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label mb-2">
                                <span className="label-text font-medium">
                                    End Time <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <select
                                {...register("endTime")}
                                className={`select select-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.endTime ? "select-error" : ""}`}
                            >
                                <option value="">Pilih End Time</option>
                                {generateEndTimeOptions(watchedStartTime).map((time) => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                            {errors.endTime && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.endTime.message}
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Duration (Read-only) */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Durasi <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            {...register("duration")}
                            className="input input-bordered w-full bg-gray-100 border-dashed border-l-4 border-l-gray-400"
                            readOnly
                            placeholder="Durasi"
                        />
                    </div>

                    {/* Tanggal Booking */}
                    <div className="form-control">
                        <label className="label mb-2">
                            <span className="label-text font-medium">
                                Tanggal Booking <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <Controller
                            name="tanggalBooking"
                            control={control}
                            render={({ field }) => (
                                <div className="relative date-picker-container">
                                    <input
                                        type="text"
                                        className={`input input-bordered w-full focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.tanggalBooking ? "input-error" : ""}`}
                                        value={field.value ? field.value.toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : ''}
                                        placeholder="Pilih tanggal booking"
                                        readOnly
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                    />
                                    <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                                        onClick={() => setShowDatePicker(!showDatePicker)} />

                                    {showDatePicker && (
                                        <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-4 mt-1">
                                            <DayPicker
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setShowDatePicker(false);
                                                }}
                                                disabled={{ before: new Date() }}
                                                locale={id}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        {errors.tanggalBooking && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.tanggalBooking.message}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
                            className="btn bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : isEditMode ? (
                                "Update Event"
                            ) : (
                                "Add Event"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

export default AddEditEventModal;
