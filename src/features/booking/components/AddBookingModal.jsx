/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/slices/authSlice";
import {
  useAddBookingMutation,
  useUpdateBookingMutation,
} from "../api/bookingApiSlice";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../../../utils/formatters";
import {
  UserIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  CubeIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const bookingSchema = z.object({
  name: z.string().min(3, { message: "Nama customer minimal 3 karakter" }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon tidak valid" }),
  console: z.string().nonempty({ message: "Pilih konsol" }),
  room: z.string().nonempty({ message: "Pilih ruangan" }),
  unit: z.string().nonempty({ message: "Pilih unit" }),
  totalPerson: z.number().min(1, { message: "Jumlah orang minimal 1" }),
  duration: z.number().min(1, { message: "Durasi minimal 1 jam" }),
  metodePembayaran: z.string().nonempty({ message: "Pilih metode pembayaran" }),
});

const consoleOptions = [
  {
    value: "PS5",
    label: "PlayStation 5",
    multiplier: 1.5,
    color: "text-blue-600",
  },
  {
    value: "PS4 Pro",
    label: "PlayStation 4 Pro",
    multiplier: 1.2,
    color: "text-purple-600",
  },
  {
    value: "PS4 Slim",
    label: "PlayStation 4 Slim",
    multiplier: 1,
    color: "text-gray-600",
  },
];

const roomOptions = [
  {
    value: "Reguler",
    label: "Reguler",
    icon: "🎮",
    color: "bg-blue-50 text-blue-700",
  },
  {
    value: "VIP",
    label: "VIP",
    icon: "👑",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    value: "Smoking Area",
    label: "Smoking Area",
    icon: "🚬",
    color: "bg-gray-50 text-gray-700",
  },
];

const unitOptions = ["Unit #1", "Unit #2", "Unit #3", "Unit #4", "Unit #5"];

const paymentOptions = [
  {
    value: "Cash",
    label: "Cash",
    icon: CurrencyDollarIcon,
    color: "text-brand-gold",
  },
  {
    value: "QRIS",
    label: "QRIS",
    icon: DevicePhoneMobileIcon,
    color: "text-blue-600",
  },
  {
    value: "Card",
    label: "Card",
    icon: CreditCardIcon,
    color: "text-purple-600",
  },
];

const FormSection = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center gap-2 pb-3 border-b border-base-300">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h4 className="font-semibold text-base-content">{title}</h4>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const InputField = ({
  label,
  error,
  children,
  required = false,
  description = null,
  icon: Icon = null,
}) => (
  <div className="form-control">
    <label className="label pb-1">
      <span className="label-text font-medium flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-base-content/60" />}
        {label}
        {required && <span className="text-error">*</span>}
      </span>
    </label>
    {children}
    {description && (
      <label className="label pt-1">
        <span className="label-text-alt text-base-content/60">
          {description}
        </span>
      </label>
    )}
    {error && (
      <label className="label pt-1">
        <span className="label-text-alt text-error flex items-center gap-1">
          <ExclamationTriangleIcon className="h-3 w-3" />
          {error.message}
        </span>
      </label>
    )}
  </div>
);

const StepperInput = ({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 999,
  register,
  name,
}) => (
  <div className="join w-full">
    <button
      type="button"
      onClick={onDecrement}
      disabled={value <= min}
      className="btn btn-sm btn-outline join-item px-3"
    >
      <MinusIcon className="h-4 w-4" />
    </button>
    <input
      type="number"
      {...register(name, { valueAsNumber: true })}
      min={min}
      max={max}
      className="input input-sm input-bordered join-item flex-1 text-center font-medium"
    />
    <button
      type="button"
      onClick={onIncrement}
      disabled={value >= max}
      className="btn btn-sm btn-outline join-item px-3"
    >
      <PlusIcon className="h-4 w-4" />
    </button>
  </div>
);

const AddBookingModal = ({ isOpen, onClose, editingData, onFormSubmit }) => {
  const isEditMode = Boolean(editingData);
  const admin = useSelector(selectCurrentUser);

  const [addBooking, { isLoading: isAdding }] = useAddBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { totalPerson: 1, duration: 1 },
  });

  const watchedDuration = watch("duration");
  const watchedConsole = watch("console");
  const watchedTotalPerson = watch("totalPerson");
  const watchedTotalPembayaran = watch("totalPembayaran");

  useEffect(() => {
    const basePrice = 50000;
    let consoleMultiplier = 1;
    const selectedConsole = consoleOptions.find(
      (c) => c.value === watchedConsole
    );
    if (selectedConsole) {
      consoleMultiplier = selectedConsole.multiplier;
    }
    const totalPrice = basePrice * consoleMultiplier * (watchedDuration || 0);
    setValue("totalPembayaran", totalPrice);
  }, [watchedDuration, watchedConsole, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingData) {
        reset(editingData);
      } else {
        const now = new Date();
        reset({
          noTransaction: `TRX-OTS-${Date.now()}`,
          transactionDate: now.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          adminName: admin?.name || "Admin",
          name: "",
          phoneNumber: "",
          console: "",
          room: "",
          unit: "",
          totalPerson: 1,
          startTime: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: 1,
          tanggalBooking: now.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          totalPembayaran: 50000,
          metodePembayaran: "",
        });
      }
    }
  }, [isOpen, isEditMode, editingData, reset, admin?.name]);

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateBooking({ ...editingData, ...formData }).unwrap();
        toast.success("Booking berhasil diperbarui!");
      } else {
        const finalTotalPrice = watch("totalPembayaran");
        const now = new Date();
        const startTimeDate = new Date();
        const durationInMs = formData.duration * 60 * 60 * 1000;
        const endTimeDate = new Date(startTimeDate.getTime() + durationInMs);
        const completeData = {
          ...formData,
          id: Date.now(),
          noTransaction: `TRX-OTS-${Date.now()}`,
          bookingType: "OTS",
          statusBooking: "Ongoing",
          startTime: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endTimeDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          tanggalBooking: now.toLocaleDateString("id-ID"),
          totalPembayaran: finalTotalPrice,
        };
        await addBooking(completeData).unwrap();
        toast.success("Booking baru berhasil ditambahkan!");
      }
      reset();
      onFormSubmit();
    } catch (err) {
      toast.error("Gagal memproses data.");
      console.error("Failed to process booking:", err);
    }
  };

  const handleStepper = (field, amount) => {
    const currentValue = getValues(field) || 0;
    const newValue = Math.max(1, currentValue + amount);
    setValue(field, newValue, { shouldValidate: true });
  };

  const isLoading = isAdding || isUpdating;

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DevicePhoneMobileIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-base-content">
                {isEditMode ? "Edit Booking" : "On-The-Spot Booking"}
              </h3>
              <p className="text-sm text-base-content/60 mt-1">
                {isEditMode
                  ? "Perbarui informasi booking yang sudah ada"
                  : "Buat booking baru untuk pelanggan walk-in"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Transaction Info */}
          <FormSection title="Informasi Transaksi" icon={DocumentDuplicateIcon}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="No. Transaksi"
                icon={DocumentDuplicateIcon}
                required
              >
                <input
                  type="text"
                  {...register("noTransaction")}
                  className="input input-bordered bg-base-200"
                  disabled
                />
              </InputField>

              <InputField
                label="Tanggal Transaksi"
                icon={CalendarIcon}
                required
              >
                <input
                  type="text"
                  {...register("transactionDate")}
                  className="input input-bordered bg-base-200"
                  disabled
                />
              </InputField>

              <InputField label="Admin" icon={UserCircleIcon} required>
                <input
                  type="text"
                  {...register("adminName")}
                  className="input input-bordered bg-base-200"
                  disabled
                />
              </InputField>
            </div>
          </FormSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Info */}
            <div className="space-y-6">
              <FormSection title="Informasi Pelanggan" icon={UserIcon}>
                <InputField
                  label="Nama Pelanggan"
                  icon={UserIcon}
                  error={errors.name}
                  required
                  description="Minimal 3 karakter"
                >
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Masukkan nama pelanggan"
                    className={`input input-bordered w-full ${
                      errors.name ? "input-error" : ""
                    }`}
                  />
                </InputField>

                <InputField
                  label="Nomor Telepon"
                  icon={PhoneIcon}
                  error={errors.phoneNumber}
                  required
                  description="Minimal 10 digit"
                >
                  <input
                    type="tel"
                    {...register("phoneNumber")}
                    placeholder="08xxxxxxxxxx"
                    className={`input input-bordered w-full ${
                      errors.phoneNumber ? "input-error" : ""
                    }`}
                  />
                </InputField>
              </FormSection>

              <FormSection title="Detail Booking" icon={ClockIcon}>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Jumlah Orang"
                    icon={UsersIcon}
                    error={errors.totalPerson}
                    required
                    description={`${watchedTotalPerson || 1} orang`}
                  >
                    <StepperInput
                      value={watchedTotalPerson}
                      onIncrement={() => handleStepper("totalPerson", 1)}
                      onDecrement={() => handleStepper("totalPerson", -1)}
                      min={1}
                      max={50}
                      register={register}
                      name="totalPerson"
                    />
                  </InputField>

                  <InputField
                    label="Waktu Mulai"
                    icon={ClockIcon}
                    description="Otomatis terisi"
                  >
                    <input
                      type="text"
                      {...register("startTime")}
                      className="input input-bordered bg-base-200"
                      disabled
                    />
                  </InputField>
                </div>

                <InputField
                  label="Durasi"
                  icon={ClockIcon}
                  error={errors.duration}
                  required
                  description={`${watchedDuration || 1} jam`}
                >
                  <StepperInput
                    value={watchedDuration}
                    onIncrement={() => handleStepper("duration", 1)}
                    onDecrement={() => handleStepper("duration", -1)}
                    min={1}
                    max={12}
                    register={register}
                    name="duration"
                  />
                </InputField>
              </FormSection>
            </div>

            {/* Right Column - Facility & Payment */}
            <div className="space-y-6">
              <FormSection title="Fasilitas & Ruangan" icon={CubeIcon}>
                <InputField
                  label="Konsol Gaming"
                  icon={DevicePhoneMobileIcon}
                  error={errors.console}
                  required
                >
                  <select
                    {...register("console")}
                    className={`select select-bordered w-full ${
                      errors.console ? "select-error" : ""
                    }`}
                  >
                    <option value="">Pilih Konsol</option>
                    {consoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}{" "}
                        {option.multiplier > 1 &&
                          `(+${((option.multiplier - 1) * 100).toFixed(0)}%)`}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField
                  label="Ruangan"
                  icon={HomeIcon}
                  error={errors.room}
                  required
                >
                  <select
                    {...register("room")}
                    className={`select select-bordered w-full ${
                      errors.room ? "select-error" : ""
                    }`}
                  >
                    <option value="">Pilih Ruangan</option>
                    {roomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField
                  label="Unit"
                  icon={CubeIcon}
                  error={errors.unit}
                  required
                >
                  <select
                    {...register("unit")}
                    className={`select select-bordered w-full ${
                      errors.unit ? "select-error" : ""
                    }`}
                  >
                    <option value="">Pilih Unit</option>
                    {unitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </InputField>
              </FormSection>

              <FormSection title="Pembayaran" icon={CreditCardIcon}>
                <InputField
                  label="Metode Pembayaran"
                  icon={CreditCardIcon}
                  error={errors.metodePembayaran}
                  required
                >
                  <select
                    {...register("metodePembayaran")}
                    className={`select select-bordered w-full ${
                      errors.metodePembayaran ? "select-error" : ""
                    }`}
                  >
                    <option value="">Pilih Metode</option>
                    {paymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField
                  label="Total Pembayaran"
                  icon={CurrencyDollarIcon}
                  description="Harga otomatis dihitung berdasarkan konsol dan durasi"
                >
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-success" />
                    <input
                      type="text"
                      value={formatCurrency(watchedTotalPembayaran || 0)}
                      className="input input-bordered w-full pl-10 font-bold text-lg text-success bg-success/5"
                      disabled
                    />
                  </div>
                  <input type="hidden" {...register("totalPembayaran")} />
                </InputField>
              </FormSection>

              {/* Summary Card */}
              <div className="card bg-primary/5 border border-primary/20">
                <div className="card-body p-4">
                  <h5 className="card-title text-sm font-medium text-brand-gold flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Ringkasan Booking
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Durasi:</span>
                      <span className="font-medium">
                        {watchedDuration || 1} jam
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Peserta:</span>
                      <span className="font-medium">
                        {watchedTotalPerson || 1} orang
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Konsol:</span>
                      <span className="font-medium">
                        {watchedConsole || "-"}
                      </span>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="flex justify-between font-bold text-success">
                      <span>Total:</span>
                      <span>{formatCurrency(watchedTotalPembayaran || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="booking-form"
              className="btn bg-brand-gold hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="loading loading-spinner loading-sm mr-2" />
              )}
              {isEditMode ? "Simpan Perubahan" : "Buat Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookingModal;
