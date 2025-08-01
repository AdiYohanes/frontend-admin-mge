/* eslint-disable no-unused-vars */
import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils/formatters";

const CustomerTable = ({ users, isLoading, page, limit, onDelete }) => {
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
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="hover">
              <th>{(page - 1) * limit + index + 1}</th>
              <td className="font-bold">{user.name}</td>
              <td className="text-sm opacity-70">@{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td className="font-bold text-success">
                {formatCurrency(user.total_spend)}
              </td>
              <td className="font-bold text-info">
                {user.total_points || 0}
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
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
