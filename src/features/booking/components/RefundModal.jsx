import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateBookingMutation } from "../api/bookingApiSlice";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../../../utils/formatters";

// Skema validasi hanya untuk persentase
const refundSchema = z.object({
  refundPercentage: z
    .number()
    .min(0, "Persentase tidak boleh negatif")
    .max(100, "Persentase tidak boleh lebih dari 100"),
});

const percentageOptions = [0, 25, 50, 75, 100];

const RefundModal = ({ isOpen, onClose, bookingData }) => {
  const [updateBooking, { isLoading }] = useUpdateBookingMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(refundSchema),
    defaultValues: { refundPercentage: 100 },
  });

  // Awasi perubahan pada persentase
  const watchedPercentage = watch("refundPercentage");
  const totalAmount = bookingData?.totalPembayaran || 0;

  // Hitung total refund secara dinamis
  const calculatedRefund = (totalAmount * (watchedPercentage || 0)) / 100;

  useEffect(() => {
    if (isOpen) {
      // Reset ke nilai default saat modal dibuka
      reset({ refundPercentage: 100 });
    }
  }, [isOpen, reset]);

  const onSubmit = async (formData) => {
    try {
      const updatedData = {
        ...bookingData,
        statusBooking: "Refunded",
        // Kita bisa tambahkan info refund ke data booking untuk catatan
        refundDetails: {
          percentage: formData.refundPercentage,
          amount: calculatedRefund,
          refundedAt: new Date().toISOString(),
        },
      };

      await updateBooking(updatedData).unwrap();
      toast.success(
        `Refund sebesar ${formatCurrency(calculatedRefund)} berhasil diproses!`
      );
      onClose();
    } catch (err) {
      toast.error("Gagal memproses refund.");
      console.error("Failed to process refund:", err);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Proses Refund</h3>
        <p className="text-sm mb-4">
          No. Transaksi:{" "}
          <span className="font-mono">{bookingData?.noTransaction}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Customer Name</span>
            </label>
            <input
              type="text"
              value={bookingData?.name || ""}
              className="input input-bordered"
              disabled
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Amount</span>
            </label>
            <input
              type="text"
              value={formatCurrency(totalAmount)}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="divider"></div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Persentase Refund (%)</span>
            </label>
            <select
              {...register("refundPercentage", { valueAsNumber: true })}
              className={`select select-bordered ${
                errors.refundPercentage ? "select-error" : ""
              }`}
            >
              {percentageOptions.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Refund</span>
            </label>
            <input
              type="text"
              value={formatCurrency(calculatedRefund)}
              className="input input-bordered font-bold text-lg text-success"
              disabled
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              Proses Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundModal;
