/* eslint-disable no-unused-vars */
import React from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  BanknotesIcon,
  ServerIcon,
  ArrowPathIcon,
  XCircleIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const BookingTable = ({
  bookings,
  isLoading,
  isError,
  onCancel,
  error,
  page,
  limit,
  onEdit,
  onDelete,
  onReschedule,
  onRefund,
}) => {
  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold";
    switch (status) {
      case "Finished":
        return `${baseClasses} badge-success`;
      case "Booking Success":
        return `${baseClasses} badge-info`;
      case "Ongoing":
        return `${baseClasses} badge-warning`;
      case "Cancelled":
        return `${baseClasses} badge-error`;
      case "Refunded":
        return `${baseClasses} badge-accent`;
      default:
        return `${baseClasses} badge-ghost`;
    }
  };

  // Fungsi untuk merender tombol aksi secara kondisional
  const renderActions = (booking) => {
    switch (booking.statusBooking) {
      case "Booking Success":
      case "Rescheduled":
        return (
          <div className="flex items-center justify-center gap-1">
            <div className="tooltip" data-tip="Reschedule">
              <button
                onClick={() => onReschedule(booking)}
                className="btn btn-ghost btn-xs"
              >
                <ArrowPathIcon className="h-5 w-5 text-blue-500" />
              </button>
            </div>
            <div className="tooltip" data-tip="Cancel Booking">
              <button
                onClick={() => onCancel(booking)}
                className="btn btn-ghost btn-xs"
              >
                <XCircleIcon className="h-5 w-5 text-orange-500" />
              </button>
            </div>
            <div className="tooltip tooltip-error" data-tip="Delete Record">
              <button
                onClick={() => onDelete(booking)}
                className="btn btn-ghost btn-xs text-error"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        );

      case "Cancelled":
        return (
          <div className="tooltip" data-tip="Refund">
            <button
              onClick={() => onRefund(booking)}
              className="btn btn-ghost btn-xs"
            >
              <ReceiptRefundIcon className="h-5 w-5 text-accent" />
            </button>
          </div>
        );

      case "Finished":
      case "Refunded":
      case "Ongoing":
      default:
        // Tidak menampilkan aksi apa pun untuk status-status ini
        return <span className="text-xs text-gray-400">-</span>;
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (isError)
    return <div className="alert alert-error">Error: {error.toString()}</div>;
  if (!bookings || bookings.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data booking yang ditemukan.
      </div>
    );

  return (
    <div className="w-full">
      {/* TAMPILAN DESKTOP: TABEL */}
      <div className="overflow-x-auto hidden md:block bg-base-100 rounded-lg shadow">
        <table className="table table-sm">
          <thead className="bg-base-200">
            <tr>
              <th>No</th>
              <th>Customer</th>
              <th>Booking Details</th>
              <th>Rental Details</th>
              <th>Time & Duration</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking.id} className="hover">
                <th>{(page - 1) * limit + index + 1}</th>
                <td>
                  <div className="font-bold">{booking.name}</div>
                  <div className="text-xs opacity-60">
                    {booking.phoneNumber}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <div className="font-mono text-xs">
                      {booking.noTransaction}
                    </div>
                    <div className="badge badge-ghost badge-sm">
                      {booking.bookingType}
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-70">
                      <CalendarDaysIcon className="h-3 w-3" />
                      {booking.tanggalBooking}
                    </div>
                  </div>
                </td>
                <td>
                  <ul className="list-disc list-inside text-sm">
                    <li>
                      <span className="font-semibold">Console:</span>{" "}
                      {booking.console}
                    </li>
                    <li>
                      <span className="font-semibold">Room:</span>{" "}
                      {booking.room}
                    </li>
                    <li>
                      <span className="font-semibold">Unit:</span>{" "}
                      {booking.unit}
                    </li>
                  </ul>
                </td>
                <td>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4 text-green-500" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <div className="opacity-70 text-xs">
                      Duration: {booking.duration} hour(s) |{" "}
                      {booking.totalPerson} person(s)
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-bold text-success">
                    {formatCurrency(booking.totalPembayaran)}
                  </div>
                  <div className="text-xs opacity-60">
                    {booking.metodePembayaran}
                  </div>
                </td>
                <td>
                  <span className={getStatusBadge(booking.statusBooking)}>
                    {booking.statusBooking}
                  </span>
                </td>
                <td className="text-center">{renderActions(booking)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TAMPILAN MOBILE: DAFTAR KARTU */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {bookings.map((booking) => (
          <div key={booking.id} className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{booking.name}</div>
                  <div className="text-xs opacity-60">
                    {booking.phoneNumber}
                  </div>
                </div>
              </div>
              <div className="divider my-2"></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">No. Transaksi</div>
                    <div className="font-mono text-xs">
                      {booking.noTransaction}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">Tanggal</div>
                    <div className="font-semibold">
                      {booking.tanggalBooking}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">Waktu</div>
                    <div className="font-semibold">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">Peserta</div>
                    <div className="font-semibold">
                      {booking.totalPerson} orang
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <ServerIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">Rental</div>
                    <div className="font-semibold">
                      {booking.console} / {booking.room} / {booking.unit}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <BanknotesIcon className="h-4 w-4 opacity-70" />{" "}
                  <div>
                    <div className="text-xs opacity-60">Pembayaran</div>
                    <div className="font-bold text-success">
                      {formatCurrency(booking.totalPembayaran)} (
                      {booking.metodePembayaran})
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-actions justify-between items-center mt-2">
                <span className={getStatusBadge(booking.statusBooking)}>
                  {booking.statusBooking}
                </span>
                <div className="flex items-center">
                  {renderActions(booking)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTable;
