import React, { useEffect } from "react";
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
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const eventSchema = z.object({
  eventName: z.string().min(5, { message: "Nama event minimal 5 karakter" }),
  eventDescription: z.string().optional(),
  console: z.string().nonempty({ message: "Pilih konsol" }),
  room: z.string().nonempty({ message: "Pilih ruangan" }),
  unit: z.string().nonempty({ message: "Pilih unit" }),
  totalPerson: z.number().min(1, { message: "Jumlah orang minimal 1" }),
  tanggalBooking: z.date({ required_error: "Tanggal booking harus diisi" }),
  startTime: z.string().nonempty({ message: "Waktu mulai harus diisi" }),
  duration: z.number().min(1, { message: "Durasi minimal 1 jam" }),
});

const consoleOptions = ["PS5", "PS4 Pro", "PS4 Slim", "All Consoles"];
const roomOptions = ["Area Event", "VIP", "Semua Ruangan"];
const unitOptions = ["Semua Unit", "Unit #1-5"];

const AddEventModal = ({ isOpen, onClose, editingData }) => {
  const isEditMode = Boolean(editingData);

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset({
          ...editingData,
          tanggalBooking: new Date(editingData.tanggalBooking),
        });
      } else {
        reset({
          eventName: "",
          eventDescription: "",
          console: "",
          room: "",
          unit: "",
          totalPerson: 10,
          startTime: "19:00",
          duration: 1,
          tanggalBooking: new Date(),
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset]);

  const onSubmit = async (formData) => {
    try {
      const [hours, minutes] = formData.startTime.split(":");
      const startTimeDate = new Date(formData.tanggalBooking);
      startTimeDate.setHours(hours, minutes, 0, 0);
      const durationInMs = formData.duration * 60 * 60 * 1000;
      const endTimeDate = new Date(startTimeDate.getTime() + durationInMs);

      const finalData = {
        ...formData,
        tanggalBooking: startTimeDate.toISOString(),
        endTime: endTimeDate.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (isEditMode) {
        await updateEventBooking({ ...editingData, ...finalData }).unwrap();
        toast.success("Event berhasil diperbarui!");
      } else {
        await addEventBooking(finalData).unwrap();
        toast.success("Event baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal memproses event.");
      console.error("Failed to process event:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-3xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">
          {isEditMode ? "Edit Event Booking" : "Add New Event Booking"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="divider text-sm font-semibold">Detail Event</div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text">Event Name</span>
            </label>
            <input
              type="text"
              {...register("eventName")}
              className={`input input-bordered ${
                errors.eventName ? "input-error" : ""
              }`}
            />
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text">Event Description</span>
            </label>
            <textarea
              {...register("eventDescription")}
              className="textarea textarea-bordered h-24"
            ></textarea>
          </div>

          <div className="divider text-sm font-semibold">Kebutuhan Rental</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text">Console</span>
              </label>
              <select
                {...register("console")}
                className="select select-bordered"
              >
                <option value="">Pilih...</option>
                {consoleOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text">Room</span>
              </label>
              <select {...register("room")} className="select select-bordered">
                <option value="">Pilih...</option>
                {roomOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text">Unit</span>
              </label>
              <select {...register("unit")} className="select select-bordered">
                <option value="">Pilih...</option>
                {unitOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divider text-sm font-semibold">
            Jadwal & Kapasitas
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text">Tanggal Booking</span>
              </label>
              <Controller
                name="tanggalBooking"
                control={control}
                render={({ field }) => (
                  <div className="dropdown w-full">
                    <label
                      tabIndex={0}
                      className="btn btn-outline justify-start font-normal"
                    >
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      {field.value
                        ? format(field.value, "dd MMMM yyyy", { locale: id })
                        : "Pilih Tanggal"}
                    </label>
                    <div
                      tabIndex={0}
                      className="dropdown-content z-[1] bg-base-100 shadow-lg rounded-box mt-2"
                    >
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={{ before: new Date() }}
                        locale={id}
                      />
                    </div>
                  </div>
                )}
              />
              {errors.tanggalBooking && (
                <span className="text-xs text-error mt-1">
                  {errors.tanggalBooking.message}
                </span>
              )}
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Start Time</span>
                </label>
                <input
                  type="time"
                  {...register("startTime")}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Duration (Hours)</span>
                </label>
                <input
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Total Person</span>
                </label>
                <input
                  type="number"
                  {...register("totalPerson", { valueAsNumber: true })}
                  className="input input-bordered"
                />
              </div>
            </div>
          </div>

          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              {isEditMode ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEventModal;
