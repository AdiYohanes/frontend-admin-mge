import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const TransactionTable = ({ transactions, isLoading, page, limit }) => {
  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold text-xs";
    const statusLower = status?.toLowerCase() || "";

    // Handle different status values with appropriate colors
    switch (statusLower) {
      case "finished":
      case "completed":
        return `${baseClasses} badge-success`; // Green
      case "pending":
        return `${baseClasses} badge-warning`; // Orange/Yellow
      case "confirmed":
        return `${baseClasses} badge-info`; // Blue
      case "refunded":
      case "cancelled":
        return `${baseClasses} badge-error`; // Red
      case "active":
        return `${baseClasses} badge-primary`; // Primary color
      case "inactive":
        return `${baseClasses} badge-neutral`; // Gray
      default:
        return `${baseClasses} badge-neutral`; // Default gray
    }
  };

  const getBookingTypeBadge = (bookingType) => {
    const baseClasses = "badge badge-sm";
    return bookingType === "Online"
      ? `${baseClasses} badge-primary`
      : `${baseClasses} badge-secondary`;
  };

  const getTypeBadge = (type) => {
    const baseClasses = "badge badge-sm";
    return type === "Food & Drink"
      ? `${baseClasses} badge-accent`
      : `${baseClasses} badge-info`;
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );

  if (!transactions || transactions.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data transaksi yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        <thead className="bg-base-200">
          <tr>
            <th className="text-center">NO</th>
            <th>NO. TRANSAKSI</th>
            <th>BOOKING TYPE</th>
            <th>TYPE</th>
            <th>NAME</th>
            <th>PHONE NUMBER</th>
            <th>DETAILS</th>
            <th>QUANTITY</th>
            <th>TANGGAL BOOKING</th>
            <th>TOTAL PEMBAYARAN</th>
            <th>METODE PEMBAYARAN</th>
            <th>TANGGAL PEMBAYARAN</th>
            <th>STATUS</th>
            <th>TOTAL REFUND</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id} className="hover">
              <td className="text-center font-bold">{(page - 1) * limit + index + 1}</td>
              <td>
                <div className="font-mono text-xs font-bold">{tx.noTransaction}</div>
              </td>
              <td>
                <span className={getBookingTypeBadge(tx.bookingType || "Manual (OTS)")}>
                  {tx.bookingType || "Manual (OTS)"}
                </span>
              </td>
              <td>
                <span className={getTypeBadge(tx.type)}>{tx.type}</span>
              </td>
              <td>
                <div className="font-semibold text-sm">{tx.name}</div>
              </td>
              <td>
                <div className="text-sm">{tx.phoneNumber}</div>
              </td>
              <td>
                <div className="font-semibold text-sm min-w-[200px] max-w-[300px]">
                  {tx.type === "Food & Drink" ? (
                    <span title={tx.details}>{tx.details}</span>
                  ) : (
                    <div className="space-y-1">
                      {tx.rawBooking?.unit?.name && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[40px]">Unit:</span>
                          <span className="text-sm font-semibold">{tx.rawBooking.unit.name}</span>
                        </div>
                      )}
                      {tx.rawBooking?.unit?.room?.name && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[40px]">Room:</span>
                          <span className="text-sm font-semibold">{tx.rawBooking.unit.room.name}</span>
                        </div>
                      )}
                      {tx.rawBooking?.unit?.consoles?.[0]?.name && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[40px]">Console:</span>
                          <span className="text-sm font-semibold">{tx.rawBooking.unit.consoles[0].name}</span>
                        </div>
                      )}
                      {!tx.rawBooking?.unit?.name && !tx.rawBooking?.unit?.room?.name && !tx.rawBooking?.unit?.consoles?.[0]?.name && (
                        <span className="text-sm text-gray-500">{tx.details}</span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="text-sm">
                  {tx.quantity} {tx.quantityUnit}
                </div>
              </td>
              <td>
                <div className="text-sm">{tx.tanggalBooking}</div>
              </td>
              <td>
                <div className="font-bold text-success text-sm">
                  {formatCurrency(tx.totalPembayaran)}
                </div>
              </td>
              <td>
                <div className="text-sm">{tx.metodePembayaran}</div>
              </td>
              <td>
                <div className="text-sm">{tx.tanggalBooking}</div>
              </td>
              <td>
                <span className={getStatusBadge(tx.status)}>{tx.status}</span>
              </td>
              <td>
                {tx.totalRefund ? (
                  <div className="font-semibold text-error text-sm">
                    {formatCurrency(tx.totalRefund)}
                  </div>
                ) : (
                  <span className="text-sm">Rp0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
