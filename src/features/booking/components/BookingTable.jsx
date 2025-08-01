/* eslint-disable no-unused-vars */
import React from 'react';
import { EyeIcon, ReceiptRefundIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../utils/formatters';

const BookingTable = ({ bookings, isLoading, page, limit, onViewDetails, onRefund }) => {
  // Fungsi helper untuk menentukan warna badge status
  const getStatusBadge = (status) => {
    const baseClasses = 'badge font-semibold capitalize';
    switch (status?.toLowerCase()) {
      case 'finished':
      case 'complete':
      case 'confirmed':
        return `${baseClasses} badge-success`;
      case 'pending':
      case 'booking success':
        return `${baseClasses} badge-info`;
      case 'ongoing':
        return `${baseClasses} badge-warning`;
      case 'cancelled':
        return `${baseClasses} badge-error`;
      case 'refunded':
        return `${baseClasses} badge-accent`;
      default:
        return `${baseClasses} badge-ghost`;
    }
  };

  // Fungsi untuk merender tombol aksi secara dinamis berdasarkan status
  const renderActions = (booking) => {
    const actions = [];

    // View Details - selalu tersedia untuk semua booking
    actions.push(
      <div key="view" className="tooltip" data-tip="View Details">
        <button
          onClick={() => onViewDetails(booking)}
          className="btn btn-ghost btn-xs"
        >
          <EyeIcon className="h-5 w-5 text-blue-500" />
        </button>
      </div>
    );

    // Refund - hanya untuk status tertentu
    if (booking.statusBooking?.toLowerCase() === 'cancelled') {
      actions.push(
        <div key="refund" className="tooltip" data-tip="Refund">
          <button
            onClick={() => onRefund(booking)}
            className="btn btn-ghost btn-xs"
          >
            <ReceiptRefundIcon className="h-5 w-5 text-accent" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1">
        {actions.length > 0 ? actions : <span className="text-xs text-gray-400">-</span>}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><span className="loading loading-lg"></span></div>;
  }
  if (!bookings || bookings.length === 0) {
    return <div className="text-center p-10">Tidak ada data booking yang ditemukan.</div>;
  }

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Customer</th>
            <th>Invoice Number</th>
            <th>Booking Type</th>
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
              <td><div className="font-bold">{booking.name}</div><div className="text-xs opacity-60">{booking.phoneNumber}</div></td>
              <td><div className="font-mono text-xs">{booking.noTransaction}</div></td>
              <td><div className="badge badge-outline badge-info">{booking.bookingType}</div></td>
              <td>
                <ul className="list-disc list-inside text-sm">
                  <li><span className="font-semibold">Room:</span> {booking.room}</li>
                  <li><span className="font-semibold">Unit:</span> {booking.unit}</li>
                </ul>
              </td>
              <td><div className="font-semibold">{booking.tanggalBooking}</div><div className="text-xs opacity-70">{booking.startTime} - {booking.endTime} ({booking.duration.toFixed(0)} jam)</div></td>
              <td><div className="font-bold text-success">{formatCurrency(booking.totalPembayaran)}</div><div className="text-xs opacity-60">{booking.metodePembayaran}</div></td>
              <td><span className={getStatusBadge(booking.statusBooking)}>{booking.statusBooking}</span></td>
              <td className="text-center">{renderActions(booking)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
