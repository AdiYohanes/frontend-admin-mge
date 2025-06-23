import React from "react";
import { PrinterIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const FoodDrinkTable = ({
  orders,
  isLoading,
  page,
  limit,
  onDelete,
  onPrint,
}) => {
  const getStatusBadge = (status) => {
    const baseClasses = "badge font-semibold";
    switch (status) {
      case "Complete":
        return `${baseClasses} badge-success`;
      case "Waiting for Payment":
        return `${baseClasses} badge-info`;
      default:
        return `${baseClasses} badge-ghost`;
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!orders || orders.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data pesanan yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Customer</th>
            <th>Order Details</th>
            <th>Tanggal Booking PS</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td>
                <div className="font-bold">{order.name}</div>
                <div className="text-xs opacity-60">{order.phoneNumber}</div>
              </td>
              <td>
                <div className="font-bold">
                  {order.orderName} (x{order.quantity})
                </div>
                <div className="text-xs opacity-60">
                  {order.type} | By: {order.admin}
                </div>
                <div className="font-mono text-xs opacity-70">
                  {order.noTransaction}
                </div>
              </td>
              <td>{order.tanggalBooking}</td>
              <td>
                <div className="font-bold text-success">
                  {formatCurrency(order.totalPembayaran)}
                </div>
                <div className="text-xs opacity-60">
                  {order.metodePembayaran}
                </div>
              </td>
              <td>
                <span className={getStatusBadge(order.statusBooking)}>
                  {order.statusBooking}
                </span>
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Print Struk">
                    <button
                      onClick={() => onPrint(order)}
                      className="btn btn-ghost btn-xs"
                    >
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(order)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FoodDrinkTable;
