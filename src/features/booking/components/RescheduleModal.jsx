import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateBookingMutation } from "../api/bookingApiSlice";
import { toast } from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

// Skema validasi tidak berubah
const rescheduleSchema = z.object({
  newDate: z.date({ required_error: "Tanggal baru harus diisi" }),
  newStartTime: z.string().nonempty("Waktu mulai baru harus diisi"),
  newDuration: z.number().min(1, "Durasi baru minimal 1 jam"),
});

const durationOptions = [1, 2, 3, 4, 5, 6];

const RescheduleModal = ({ isOpen, onClose, bookingData }) => {
  const [updateBooking, { isLoading }] = useUpdateBookingMutation();

  // --- PERBAIKAN DI SINI: Tambahkan 'register' ---
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rescheduleSchema),
  });

  useEffect(() => {
    if (isOpen && bookingData) {
      reset({
        newDuration: bookingData.duration,
      });
    }
  }, [isOpen, bookingData, reset]);

  const onSubmit = async (formData) => {
    try {
      const updatedData = {
        ...bookingData,
        tanggalBooking: format(formData.newDate, "dd MMMM yyyy", {
          locale: id,
        }),
        startTime: formData.newStartTime,
        duration: formData.newDuration,
        statusBooking: "Rescheduled",
      };

      const [hours, minutes] = formData.newStartTime.split(":");
      const startTimeDate = new Date(formData.newDate);
      startTimeDate.setHours(hours, minutes, 0, 0);
      const durationInMs = formData.newDuration * 60 * 60 * 1000;
      const endTimeDate = new Date(startTimeDate.getTime() + durationInMs);
      updatedData.endTime = endTimeDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await updateBooking(updatedData).unwrap();
      toast.success("Booking berhasil di-reschedule!");
      onClose();
    } catch (err) {
      toast.error("Gagal me-reschedule booking.");
      console.error("Failed to reschedule:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-4xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Reschedule Booking</h3>
        <p className="text-sm mb-4">
          No. Transaksi:{" "}
          <span className="font-mono">{bookingData?.noTransaction}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Kolom Jadwal Saat Ini */}
            <div className="bg-base-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Jadwal Saat Ini</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  <span>{bookingData?.tanggalBooking}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span>
                    {bookingData?.startTime} ({bookingData?.duration} Jam)
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Jadwal Baru */}
            <div className="p-4 border border-base-200 rounded-lg">
              <h4 className="font-semibold mb-3">Jadwal Baru</h4>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label py-0">
                    <span className="label-text">Pilih Tanggal Baru</span>
                  </label>
                  <Controller
                    name="newDate"
                    control={control}
                    render={({ field }) => (
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        className="bg-base-100 rounded-lg"
                        classNames={{ head_cell: "w-10", cell: "w-10" }}
                        disabled={{ before: new Date() }}
                        locale={id}
                      />
                    )}
                  />
                  {errors.newDate && (
                    <span className="text-xs text-error mt-1">
                      {errors.newDate.message}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-0">
                      <span className="label-text">Waktu Mulai Baru</span>
                    </label>
                    <input
                      type="time"
                      {...register("newStartTime")}
                      className={`input input-bordered ${
                        errors.newStartTime ? "input-error" : ""
                      }`}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-0">
                      <span className="label-text">Durasi Baru</span>
                    </label>
                    <select
                      {...register("newDuration", { valueAsNumber: true })}
                      className={`select select-bordered ${
                        errors.newDuration ? "select-error" : ""
                      }`}
                    >
                      {durationOptions.map((d) => (
                        <option key={d} value={d}>
                          {d} Jam
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              Reschedule Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
