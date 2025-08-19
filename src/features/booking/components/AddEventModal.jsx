import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddEventBookingMutation,
  useUpdateEventBookingMutation,
} from "../api/eventBookingApiSlice";
import { toast } from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDaysIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const eventSchema = z.object({
  eventName: z.string().min(1, { message: "Nama event harus diisi" }),
  eventDescription: z.string().optional().default(""),
  unitId: z.number().min(1, { message: "Pilih unit" }),
  totalPerson: z.number().min(1, { message: "Jumlah orang minimal 1" }),
  tanggalBooking: z.date({ required_error: "Tanggal booking harus diisi" }),
  startTime: z.string().min(1, { message: "Waktu mulai harus diisi" }),
  duration: z.number().min(1, { message: "Durasi minimal 1 jam" }),
});

const unitOptions = [
  { id: 1, name: "Reguler 1" },
  { id: 2, name: "Reguler 2" },
  { id: 3, name: "VIP 1" },
  { id: 4, name: "VIP 2" },
];

// Generate time options with 10-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

// Helper function to format date for API
const formatDateTimeForAPI = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const AddEventModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [addEventBooking, { isLoading: isAdding }] =
    useAddEventBookingMutation();
  const [updateEventBooking, { isLoading: isUpdating }] =
    useUpdateEventBookingMutation();
  const isLoading = isAdding || isUpdating;

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

  const watchedDuration = watch("duration");

  // Watch all form values for debugging
  const watchedValues = watch();

  useEffect(() => {
    if (isEditMode) {
      console.log('=== FORM VALUES WATCH ===');
      console.log('Current form values:', watchedValues);
      console.log('=== END FORM WATCH ===');
    }
  }, [watchedValues, isEditMode]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        console.log('=== EDIT MODE DEBUG ===');
        console.log('Editing data received:', editingData);
        console.log('Raw event data:', editingData.rawEvent);
        console.log('Raw booking data:', editingData.rawBooking);

        // Calculate duration from start and end time
        let calculatedDuration = 1;
        if (editingData.startTime && editingData.endTime) {
          const startTime = new Date(editingData.startTime);
          const endTime = new Date(editingData.endTime);
          calculatedDuration = Math.round((endTime - startTime) / (1000 * 60 * 60));
        }

        // Extract time from start_time string
        let startTimeString = "19:00";
        if (editingData.startTime) {
          const startDate = new Date(editingData.startTime);
          startTimeString = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        }

        const editData = {
          eventName: editingData.eventName || "",
          eventDescription: editingData.eventDescription || "",
          unitId: editingData.unitId || 1,
          totalPerson: editingData.totalPerson || 10,
          startTime: startTimeString,
          duration: calculatedDuration,
          tanggalBooking: editingData.tanggalBooking ? new Date(editingData.tanggalBooking) : new Date(),
        };

        console.log('Processed edit data:', editData);
        console.log('=== END EDIT DEBUG ===');
        reset(editData);
      } else {
        const defaultData = {
          eventName: "",
          eventDescription: "",
          unitId: 1,
          totalPerson: 10,
          startTime: "19:00",
          duration: 1,
          tanggalBooking: new Date(),
        };
        console.log('Resetting form with default data:', defaultData);
        reset(defaultData);
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const handleDurationChange = (increment) => {
    const newDuration = Math.max(1, Math.min(24, watchedDuration + increment));
    setValue("duration", newDuration);
  };

  const onSubmit = async (formData) => {
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Form data received:', formData);
    console.log('Form data type:', typeof formData);
    console.log('Form data is object:', formData && typeof formData === 'object');
    console.log('Form data keys:', formData ? Object.keys(formData) : 'NO DATA');
    console.log('Form data values:', formData ? Object.values(formData) : 'NO DATA');
    console.log('=== END DEBUG ===');

    try {
      console.log('Form data received:', formData);
      console.log('Form data keys:', Object.keys(formData));
      console.log('Form data values:', Object.values(formData));

      // Validate required fields
      if (!formData.eventName || !formData.unitId || !formData.totalPerson || !formData.tanggalBooking || !formData.startTime || !formData.duration) {
        console.error('Missing required fields:', {
          eventName: !!formData.eventName,
          unitId: !!formData.unitId,
          totalPerson: !!formData.totalPerson,
          tanggalBooking: !!formData.tanggalBooking,
          startTime: !!formData.startTime,
          duration: !!formData.duration
        });
        toast.error("Mohon isi semua field yang diperlukan");
        return;
      }

      const [hours, minutes] = formData.startTime.split(":");
      const startTimeDate = new Date(formData.tanggalBooking);
      startTimeDate.setHours(hours, minutes, 0, 0);
      const durationInMs = formData.duration * 60 * 60 * 1000;
      const endTimeDate = new Date(startTimeDate.getTime() + durationInMs);

      console.log('Date processing debug:', {
        originalDate: formData.tanggalBooking,
        startTime: formData.startTime,
        duration: formData.duration,
        startTimeDate: startTimeDate,
        endTimeDate: endTimeDate,
        startTimeFormatted: startTimeDate.toISOString().slice(0, 16).replace('T', ' '),
        endTimeFormatted: endTimeDate.toISOString().slice(0, 16).replace('T', ' ')
      });

      // FIX: Payload sesuai API
      const finalData = {
        name: formData.eventName,
        description: formData.eventDescription || "",
        start_time: formatDateTimeForAPI(startTimeDate),
        end_time: formatDateTimeForAPI(endTimeDate),
        total_visitors: formData.totalPerson,
        unit_id: formData.unitId,
      };

      console.log('Payload to API:', finalData);

      if (isEditMode) {
        console.log('=== UPDATE MODE DEBUG ===');
        console.log('Editing data:', editingData);
        console.log('Raw event ID:', editingData.rawEvent?.id);
        console.log('Direct ID:', editingData.id);

        // Use the correct ID for update
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
            {isEditMode ? "Edit Event" : "Add New Event"}
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
          console.log('Form errors object:', errors);
        })} className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-700 border-l-4 border-brand-gold pl-3">
              Event Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Event Name *</span>
                </label>
                <input
                  type="text"
                  {...register("eventName")}
                  className={`input input-bordered focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.eventName ? "input-error" : ""
                    }`}
                  placeholder="Enter event name"
                />
                {errors.eventName && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.eventName.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  {...register("eventDescription")}
                  className="textarea textarea-bordered focus:border-brand-gold focus:ring-1 focus:ring-brand-gold h-20"
                  placeholder="Enter event description"
                />
              </div>
            </div>


          </div>

          {/* Rental Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-700 border-l-4 border-brand-gold pl-3">
              Rental Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Unit *</span>
                </label>
                <select
                  {...register("unitId", { valueAsNumber: true })}
                  className={`select select-bordered focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.unitId ? "select-error" : ""
                    }`}
                >
                  <option value="">Select unit...</option>
                  {unitOptions.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.unitId.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Total Person *</span>
                </label>
                <input
                  type="number"
                  {...register("totalPerson", { valueAsNumber: true })}
                  className={`input input-bordered focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.totalPerson ? "input-error" : ""
                    }`}
                  min="1"
                  placeholder="Number of people"
                />
                {errors.totalPerson && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.totalPerson.message}
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-700 border-l-4 border-brand-gold pl-3">
              Schedule
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date *</span>
                </label>
                <Controller
                  name="tanggalBooking"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        type="text"
                        className={`input input-bordered w-full pr-10 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.tanggalBooking ? "input-error" : ""
                          }`}
                        placeholder="Select date..."
                        value={field.value ? format(field.value, "PPP", { locale: id }) : ""}
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Start Time *</span>
                </label>
                <select
                  {...register("startTime")}
                  className={`select select-bordered focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.startTime ? "select-error" : ""
                    }`}
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
                <label className="label">
                  <span className="label-text font-medium">Duration (Hours) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                    className={`input input-bordered w-full pr-16 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold ${errors.duration ? "input-error" : ""
                      }`}
                    min="1"
                    max="24"
                    placeholder="Hours"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs p-0 h-4 w-4"
                      onClick={() => handleDurationChange(1)}
                      disabled={watchedDuration >= 24}
                    >
                      <ChevronUpIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs p-0 h-4 w-4"
                      onClick={() => handleDurationChange(-1)}
                      disabled={watchedDuration <= 1}
                    >
                      <ChevronDownIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {errors.duration && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.duration.message}
                    </span>
                  </label>
                )}
              </div>
            </div>
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
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
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

export default AddEventModal;
