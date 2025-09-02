/* eslint-disable no-unused-vars */
import React from 'react';
import { PrinterIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../utils/formatters';

const FoodDrinkTable = ({ orders, isLoading, page, limit, onPrint, onDelete, onViewDetail }) => {
  const getStatusBadge = (status) => {
    const baseClasses = 'badge font-semibold capitalize';
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return `${baseClasses} badge-success`;
      case 'ongoing':
        return `${baseClasses} badge-info`;
      case 'pending':
        return `${baseClasses} badge-warning`;
      case 'cancelled':
        return `${baseClasses} badge-error`;
      case 'refunded':
        return `${baseClasses} badge-accent`;
      default:
        return `${baseClasses} badge-ghost`;
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><span className="loading loading-lg"></span></div>;
  if (!orders || orders.length === 0) return <div className="text-center p-10">Tidak ada data pesanan yang ditemukan.</div>;

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        <thead className="bg-base-200">
          <tr>
            <th className="text-center">NO.</th>
            <th>NO. TRANSAKSI</th>
            <th>TANGGAL</th>
            <th>ORDER</th>
            <th>NOTES</th>
            <th className="text-center">VISITORS</th>
            <th className="text-center">TOTAL</th>
            <th>STATUS</th>
            <th className="text-center">AKSI</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            return (
              <tr key={order.id} className="hover">
                <th className="text-center">{(page - 1) * limit + index + 1}</th>
                <td>
                  <div className="font-mono text-sm font-bold text-brand-gold">
                    {order.noTransaction}
                  </div>
                </td>
                <td className="text-sm text-base-content/60">
                  {order.tanggalTransaksi}
                </td>
                <td>
                  <div className="font-medium text-sm max-w-xs">
                    {order.orderName}
                  </div>
                </td>
                <td>
                  <div className="text-sm max-w-xs">
                    {order.notes && order.notes.trim() ? (
                      <span className="text-base-content/80">{order.notes}</span>
                    ) : (
                      <span className="text-base-content/40 italic">-</span>
                    )}
                  </div>
                </td>
                <td className="text-center font-bold">{order.quantity}</td>
                <td className="text-center">
                  <div className="font-bold text-brand-gold">
                    {formatCurrency(order.totalPembayaran)}
                  </div>
                  <div className="text-xs text-base-content/60">
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
                    <div className="tooltip" data-tip="Lihat Detail">
                      <button
                        onClick={() => onViewDetail && onViewDetail(order)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <EyeIcon className="h-4 w-4 text-brand-gold" />
                      </button>
                    </div>
                    <div className="tooltip" data-tip="Print Struk">
                      <button
                        onClick={() => onPrint(order)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <PrinterIcon className="h-4 w-4 text-brand-gold" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FoodDrinkTable;
