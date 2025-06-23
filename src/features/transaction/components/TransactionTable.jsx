import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const TransactionTable = ({ transactions, isLoading, page, limit }) => {
  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold";
    return status === "Finished"
      ? `${baseClasses} badge-success`
      : `${baseClasses} badge-accent`;
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
            <th>Details</th>
            <th>Total Payment</th>
            <th>Status</th>
            <th>Total Refund</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="font-mono text-xs">{tx.noTransaction}</div>
                <div className="text-xs opacity-60">{tx.tanggalBooking}</div>
              </td>
              <td>
                <div className="font-bold">{tx.name}</div>
                <div className="text-xs opacity-60">{tx.phoneNumber}</div>
              </td>
              <td>
                <div className="font-semibold">{tx.details}</div>
                <div className="text-xs opacity-70">
                  {tx.quantity} {tx.quantityUnit}
                </div>
              </td>
              <td>
                <div className="font-bold text-success">
                  {formatCurrency(tx.totalPembayaran)}
                </div>
                <div className="text-xs opacity-60">{tx.metodePembayaran}</div>
              </td>
              <td>
                <span className={getStatusBadge(tx.status)}>{tx.status}</span>
              </td>
              <td className="font-semibold">
                {tx.totalRefund ? formatCurrency(tx.totalRefund) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
