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
            <th>NO TRANSAKSI</th>
            <th>NAME</th>
            <th>PHONE NUMBER</th>
            <th>BOOKING TYPE</th>
            <th>TYPE</th>
            <th>TANGGAL BOOKING</th>
            <th>UNIT</th>
            <th>DURATION</th>
            <th>SUBTOTAL ROOM</th>
            <th>FOOD & DRINK</th>
            <th>SUBTOTAL FOOD&DRINK</th>
            <th>PB1</th>
            <th>SERVICE FEE</th>
            <th>TOTAL PEMBAYARAN</th>
            <th>METODE PEMBAYARAN</th>
            <th>TANGGAL PEMBAYARAN</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id} className="hover">
              {/* 1. NO */}
              <td className="text-center font-bold">{(page - 1) * limit + index + 1}</td>

              {/* 2. NO TRANSAKSI */}
              <td>
                <div className="font-mono text-xs font-bold">{tx.noTransaction}</div>
              </td>

              {/* 3. NAME */}
              <td>
                <div className="font-semibold text-sm">{tx.name}</div>
              </td>

              {/* 4. PHONE NUMBER */}
              <td>
                <div className="text-sm">{tx.phoneNumber}</div>
              </td>

              {/* 5. BOOKING TYPE */}
              <td>
                <span className={getBookingTypeBadge(tx.bookingType || "Manual (OTS)")}>
                  {tx.bookingType || "Manual (OTS)"}
                </span>
              </td>

              {/* 6. TYPE */}
              <td>
                <div className="text-sm">{tx.type}</div>
              </td>

              {/* 7. TANGGAL BOOKING */}
              <td>
                <div className="text-sm">{tx.tanggalBooking}</div>
              </td>

              {/* 8. UNIT */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.unit_name || "-"}
                </div>
              </td>

              {/* 9. DURATION */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.duration_hours ? `${tx.rawBooking.duration_hours} jam` : "-"}
                </div>
              </td>

              {/* 10. SUBTOTAL ROOM */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.subtotal_room ? formatCurrency(tx.rawBooking.subtotal_room) : "-"}
                </div>
              </td>

              {/* 11. FOOD & DRINK */}
              <td>
                <div className="text-sm max-w-[200px]">
                  {tx.type === "Food & Drink" ? (
                    <div className="space-y-1">
                      {tx.rawBooking?.fnb_items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                      {tx.rawBooking?.fnb_items?.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{tx.rawBooking.fnb_items.length - 2} lainnya
                        </div>
                      )}
                    </div>
                  ) : (
                    tx.rawBooking?.fnb_items?.length > 0 ? (
                      <div className="space-y-1">
                        {tx.rawBooking.fnb_items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                        {tx.rawBooking.fnb_items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{tx.rawBooking.fnb_items.length - 2} lainnya
                          </div>
                        )}
                      </div>
                    ) : "-"
                  )}
                </div>
              </td>

              {/* 12. SUBTOTAL FOOD&DRINK */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.subtotal_fnb ? formatCurrency(tx.rawBooking.subtotal_fnb) : "-"}
                </div>
              </td>

              {/* 13. PB1 */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.promo_percentage ? `${tx.rawBooking.promo_percentage}%` : "-"}
                </div>
              </td>

              {/* 14. SERVICE FEE */}
              <td>
                <div className="text-sm">
                  {tx.rawBooking?.service_fee_amount ? formatCurrency(tx.rawBooking.service_fee_amount) : "-"}
                </div>
              </td>

              {/* 15. TOTAL PEMBAYARAN */}
              <td>
                <div className="font-bold text-success text-sm">
                  {formatCurrency(tx.totalPembayaran)}
                </div>
              </td>

              {/* 16. METODE PEMBAYARAN */}
              <td>
                <div className="text-sm">{tx.metodePembayaran}</div>
              </td>

              {/* 17. TANGGAL PEMBAYARAN */}
              <td>
                <div className="text-sm">{tx.tanggalPembayaran || tx.tanggalBooking}</div>
              </td>

              {/* 18. STATUS */}
              <td>
                <span className={getStatusBadge(tx.status)}>{tx.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
