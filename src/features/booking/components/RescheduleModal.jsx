import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetAvailableDaysMutation,
  useGetAvailableTimesMutation,
  useRescheduleBookingMutation
} from '../api/bookingApiSlice';
import { toast } from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarDaysIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

// Komponen internal untuk input stepper yang profesional
const StepperInput = ({ value, onIncrement, onDecrement, min = 1, max = 12, register, name }) => (
  <div className="join w-full">
    <button type="button" onClick={onDecrement} disabled={value <= min} className="btn btn-outline join-item px-3"><MinusIcon className="h-4 w-4" /></button>
    <input type="number" {...register(name, { valueAsNumber: true })} min={min} max={max} className="input input-bordered join-item flex-1 text-center font-medium" />
    <button type="button" onClick={onIncrement} disabled={value >= max} className="btn btn-outline join-item px-3"><PlusIcon className="h-4 w-4" /></button>
  </div>
);

// Skema validasi untuk form reschedule
const rescheduleSchema = z.object({
  newDate: z.date({ required_error: "Tanggal baru harus dipilih" }),
  newStartTime: z.string().nonempty("Waktu mulai baru harus diisi"),
  newDuration: z.number().min(1, "Durasi minimal 1 jam"),
});

const RescheduleModal = ({ isOpen, onClose, bookingData }) => {
  const [getAvailableDays, { isLoading: isLoadingDays }] = useGetAvailableDaysMutation();
  const [getAvailableTimes, { isLoading: isLoadingTimes }] = useGetAvailableTimesMutation();
  const [rescheduleBooking, { isLoading: isRescheduling }] = useRescheduleBookingMutation();

  const [disabledDays, setDisabledDays] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rescheduleSchema),
  });

  const selectedDate = watch('newDate');
  const watchedDuration = watch('newDuration');

  // Efek untuk mengambil ketersediaan hari saat modal dibuka atau bulan di kalender berubah
  useEffect(() => {
    if (isOpen && bookingData?.rawBooking?.unit_id) {
      const fetchDays = async () => {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        try {
          const result = await getAvailableDays({ unitId: bookingData.rawBooking.unit_id, startDate, endDate }).unwrap();
          const fullyBookedDays = result
            .filter(day => day.is_fully_booked)
            .map(day => new Date(day.date));
          setDisabledDays(fullyBookedDays);
        } catch (err) {
          toast.error("Gagal mengambil data ketersediaan hari.");
          console.error("Error fetching available days:", err);
        }
      };
      fetchDays();
    }
  }, [isOpen, bookingData, currentMonth, getAvailableDays]);

  // Efek untuk mengambil ketersediaan jam setelah pengguna memilih tanggal baru
  useEffect(() => {
    if (selectedDate && bookingData?.rawBooking?.unit_id) {
      const fetchTimes = async () => {
        setAvailableTimes([]); // Kosongkan daftar waktu sebelumnya
        try {
          const result = await getAvailableTimes({ unitId: bookingData.rawBooking.unit_id, date: format(selectedDate, 'yyyy-MM-dd') }).unwrap();
          const availableSlots = result.slots.filter(slot => slot.is_available).map(slot => slot.time);
          setAvailableTimes(availableSlots);
          setValue('newStartTime', ''); // Reset pilihan waktu
        } catch (err) {
          toast.error("Gagal mengambil data ketersediaan jam.");
          console.error("Error fetching available times:", err);
        }
      };
      fetchTimes();
    }
  }, [selectedDate, bookingData, getAvailableTimes, setValue]);

  // Efek untuk mengisi form dengan data awal saat modal dibuka
  useEffect(() => {
    if (isOpen && bookingData) {
      const startTime = parseISO(bookingData.rawBooking.start_time);
      reset({
        noTransaction: bookingData.noTransaction,
        previousDate: format(startTime, 'EEEE, dd MMMM yyyy', { locale: idLocale }),
        previousStartTime: bookingData.startTime,
        previousDuration: bookingData.duration,
        newDate: startTime,
        newStartTime: bookingData.startTime,
        newDuration: bookingData.duration,
      });
      setCurrentMonth(startTime);
    }
  }, [isOpen, bookingData, reset]);

  const onSubmit = async (formData) => {
    try {
      const [hours, minutes] = formData.newStartTime.split(':');
      const newStartTime = new Date(formData.newDate);
      newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const newEndTime = new Date(newStartTime.getTime() + formData.newDuration * 60 * 60 * 1000);

      // --- PERBAIKAN UTAMA DI SINI ---
      // Format tanggal ke 'YYYY-MM-DD HH:mm' sesuai yang diharapkan backend
      await rescheduleBooking({
        bookingId: bookingData.id,
        startTime: format(newStartTime, 'yyyy-MM-dd HH:mm'),
        endTime: format(newEndTime, 'yyyy-MM-dd HH:mm'),
      }).unwrap();

      toast.success('Booking berhasil dijadwalkan ulang!');
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Gagal menjadwalkan ulang.');
    }
  };

  const handleStepper = (field, amount) => {
    const currentValue = getValues(field) || 0;
    const newValue = Math.max(1, currentValue + amount);
    setValue(field, newValue, { shouldValidate: true });
  };

  const isLoading = isLoadingDays || isLoadingTimes || isRescheduling;

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
        <h3 className="font-bold text-lg">Reschedule Details</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label"><span className="label-text">No. Transaction</span></label>
            <input type="text" {...register('noTransaction')} className="input input-bordered bg-base-200" disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Previous Date</span></label>
              <input type="text" {...register('previousDate')} className="input input-bordered bg-base-200" disabled />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">New Date <span className="text-error">*</span></span></label>
              <Controller
                name="newDate" control={control}
                render={({ field }) => (
                  <div className="dropdown w-full">
                    <label tabIndex={0} className="btn btn-outline justify-start font-normal w-full">
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      {field.value ? format(field.value, 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal'}
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] bg-base-100 shadow-lg rounded-box mt-2">
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={[{ before: new Date() }, ...disabledDays]}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        locale={idLocale}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Previous Start Time</span></label>
              <input type="text" {...register('previousStartTime')} className="input input-bordered bg-base-200" disabled />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">New Start Time <span className="text-error">*</span></span></label>
              <select {...register('newStartTime')} className="select select-bordered" disabled={!selectedDate || isLoadingTimes}>
                <option value="">{isLoadingTimes ? 'Loading...' : 'Pilih Waktu'}</option>
                {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Previous Duration</span></label>
              <input type="text" {...register('previousDuration')} className="input input-bordered bg-base-200" disabled />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">New Duration (Hours) <span className="text-error">*</span></span></label>
              <StepperInput
                value={watchedDuration}
                onIncrement={() => handleStepper("newDuration", 1)}
                onDecrement={() => handleStepper("newDuration", -1)}
                register={register}
                name="newDuration"
              />
              {errors.newDuration && <span className="text-xs text-error mt-1">{errors.newDuration.message}</span>}
            </div>
          </div>

          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn bg-brand-gold hover:bg-amber-600 text-white" disabled={isLoading}>
              {isLoading && <span className="loading loading-spinner"></span>}
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
