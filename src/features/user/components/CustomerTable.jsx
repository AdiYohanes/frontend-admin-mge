import React from "react";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const CustomerTable = ({ users, isLoading, page, limit, onDelete, onEdit }) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-lg"></span>
      </div>
    );
  if (!users || users.length === 0)
    return (
      <div className="text-center p-10">
        Tidak ada data customer yang ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto w-full bg-base-100 rounded-lg shadow">
      <table className="table table-sm">
        <thead className="bg-base-200">
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Total Spending</th>
            <th>Points</th>
            <th>Booking Hours</th>
            <th>Status</th>
            <th>Created</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td className="font-bold">{user.name}</td>
              <td className="text-sm opacity-70">@{user.username}</td>
              <td>{user.email || '-'}</td>
              <td>{user.phone}</td>
              <td className="font-bold text-success">
                {(() => {
                  console.log('🔍 DEBUG - User total_spend:', user.total_spend, 'Type:', typeof user.total_spend);
                  const spendValue = user.total_spend || "0";
                  console.log('🔍 DEBUG - Processed spend value:', spendValue);
                  return formatCurrency(spendValue);
                })()}
              </td>
              <td className="font-bold text-info">
                {user.total_points || 0}
              </td>
              <td className="text-center">
                <span className="text-sm">
                  {user.total_booking_hours || 0}h
                </span>
              </td>
              <td>
                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="text-xs opacity-70">
                {new Date(user.created_at).toLocaleDateString('id-ID')}
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="tooltip" data-tip="Edit">
                    <button
                      onClick={() => onEdit(user)}
                      className="btn btn-ghost btn-xs text-warning"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-error" data-tip="Hapus">
                    <button
                      onClick={() => onDelete(user)}
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

export default CustomerTable;
