import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const TransactionTable = ({ transactions, isLoading, page, limit }) => {
  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold";
    return status === "Finished"
      ? `${baseClasses} badge-success`
      : `${baseClasses} badge-accent`;
  };

  const getTypeBadge = (type) => {
    const baseClasses = "badge badge-sm";
    return type === "Food & Drink"
      ? `${baseClasses} badge-primary`
      : `${baseClasses} badge-secondary`;
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
            <th>No</th>
            <th>Transaction</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Details</th>
            <th>Total Payment</th>
            <th>Status</th>
            <th>Refund</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="font-mono text-xs font-bold">{tx.noTransaction}</div>
                <div className="text-xs opacity-60">{tx.tanggalBooking}</div>
              </td>
              <td>
                <div className="font-bold text-sm">{tx.name}</div>
                <div className="text-xs opacity-60">{tx.phoneNumber}</div>
              </td>
              <td>
                <span className={getTypeBadge(tx.type)}>{tx.type}</span>
              </td>
              <td>
                <div className="font-semibold text-sm">{tx.details}</div>
                <div className="text-xs opacity-70">
                  {tx.quantity} {tx.quantityUnit}
                </div>
              </td>
              <td>
                <div className="font-bold text-success text-sm">
                  {formatCurrency(tx.totalPembayaran)}
                </div>
                <div className="text-xs opacity-60">{tx.metodePembayaran}</div>
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
                  <span className="text-xs opacity-50">-</span>
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
